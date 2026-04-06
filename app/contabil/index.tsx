import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getLancamentos, removerLancamento } from '../../src/storage/database';
import { Lancamento } from '../../src/types';

type Periodo = 'hoje' | 'semana' | 'mes' | 'ano';

const COR_TIPO = {
  venda:   { bg: '#F0FDF4', border: '#059669', texto: '#059669', label: 'Venda' },
  entrada: { bg: '#EEF2FF', border: '#4F46E5', texto: '#4F46E5', label: 'Entrada' },
  despesa: { bg: '#FFFBEB', border: '#D97706', texto: '#D97706', label: 'Despesa' },
  saida:   { bg: '#FEF2F2', border: '#ef4444', texto: '#ef4444', label: 'Saída' },
};

function filtrarPorPeriodo(lista: Lancamento[], periodo: Periodo): Lancamento[] {
  const agora = new Date();
  return lista.filter((l) => {
    const data = new Date(l.data);
    if (periodo === 'hoje') {
      return data.toDateString() === agora.toDateString();
    }
    if (periodo === 'semana') {
      const diff = (agora.getTime() - data.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }
    if (periodo === 'mes') {
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    }
    if (periodo === 'ano') {
      return data.getFullYear() === agora.getFullYear();
    }
    return true;
  });
}

function calcularResumo(lista: Lancamento[]) {
  const receitas = lista
    .filter((l) => l.tipo === 'venda' || l.tipo === 'entrada')
    .reduce((acc, l) => acc + (l.tipo === 'venda' ? l.valor * (l.quantidade ?? 1) : l.valor), 0);

  const despesas = lista
    .filter((l) => l.tipo === 'despesa' || l.tipo === 'saida')
    .reduce((acc, l) => acc + l.valor, 0);

  const vendas = lista.filter((l) => l.tipo === 'venda');
  const lucroVendas = vendas.reduce((acc, l) => acc + (l.valor * (l.quantidade ?? 1)), 0);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
    totalVendas: vendas.length,
    lucroVendas,
  };
}

function formatarValor(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Contabil() {
  const router = useRouter();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [periodo, setPeriodo] = useState<Periodo>('mes');

  async function carregar() {
    const dados = await getLancamentos();
    setLancamentos(dados.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  const listaFiltrada = filtrarPorPeriodo(lancamentos, periodo);
  const resumo = calcularResumo(listaFiltrada);

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: '7 dias' },
    { key: 'mes', label: 'Mês' },
    { key: 'ano', label: 'Ano' },
  ];

  async function confirmarRemocao(id: string, descricao: string) {
    Alert.alert(
      'Remover lançamento',
      `Deseja remover "${descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerLancamento(id);
            carregar();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={listaFiltrada}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {/* Filtro de período */}
            <View style={styles.periodos}>
              {periodos.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.periodoBotao, periodo === p.key && styles.periodoAtivo]}
                  onPress={() => setPeriodo(p.key)}
                >
                  <Text style={[styles.periodoTexto, periodo === p.key && styles.periodoTextoAtivo]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Saldo */}
            <View style={[
              styles.saldoCard,
              { borderLeftColor: resumo.saldo >= 0 ? '#059669' : '#ef4444' }
            ]}>
              <Text style={styles.saldoLabel}>Saldo do período</Text>
              <Text style={[
                styles.saldoValor,
                { color: resumo.saldo >= 0 ? '#059669' : '#ef4444' }
              ]}>
                {formatarValor(resumo.saldo)}
              </Text>
              <Text style={styles.saldoSub}>
                {resumo.saldo >= 0 ? '▲ Superávit' : '▼ Déficit'}
              </Text>
            </View>

            {/* Cards de resumo */}
            <View style={styles.resumoGrid}>
              <View style={[styles.resumoCard, { borderLeftColor: '#059669' }]}>
                <Text style={styles.resumoLabel}>Receitas</Text>
                <Text style={[styles.resumoValor, { color: '#059669' }]}>
                  {formatarValor(resumo.receitas)}
                </Text>
              </View>
              <View style={[styles.resumoCard, { borderLeftColor: '#ef4444' }]}>
                <Text style={styles.resumoLabel}>Despesas</Text>
                <Text style={[styles.resumoValor, { color: '#ef4444' }]}>
                  {formatarValor(resumo.despesas)}
                </Text>
              </View>
              <View style={[styles.resumoCard, { borderLeftColor: '#4F46E5' }]}>
                <Text style={styles.resumoLabel}>Vendas</Text>
                <Text style={[styles.resumoValor, { color: '#4F46E5' }]}>
                  {resumo.totalVendas} registros
                </Text>
              </View>
              <View style={[styles.resumoCard, { borderLeftColor: '#D97706' }]}>
                <Text style={styles.resumoLabel}>Faturamento</Text>
                <Text style={[styles.resumoValor, { color: '#D97706' }]}>
                  {formatarValor(resumo.lucroVendas)}
                </Text>
              </View>
            </View>

            <Text style={styles.historicoTitulo}>
              Histórico — {listaFiltrada.length} lançamentos
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhum lançamento neste período.</Text>
            <Text style={styles.vazioSub}>Toque em + para registrar.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cor = COR_TIPO[item.tipo];
          const valorExibido = item.tipo === 'venda'
            ? item.valor * (item.quantidade ?? 1)
            : item.valor;
          return (
            <View style={[styles.card, { borderLeftColor: cor.border }]}>
              <View style={[styles.cardBadge, { backgroundColor: cor.bg }]}>
                <Text style={[styles.cardBadgeTexto, { color: cor.texto }]}>
                  {cor.label}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardDescricao}>{item.descricao}</Text>
                {item.categoria && (
                  <Text style={styles.cardCategoria}>{item.categoria}</Text>
                )}
                {item.tipo === 'venda' && item.quantidade && item.quantidade > 1 && (
                  <Text style={styles.cardCategoria}>
                    {item.quantidade}x {formatarValor(item.valor)} / unid
                  </Text>
                )}
                <Text style={styles.cardData}>{formatarData(item.data)}</Text>
              </View>
              <View style={styles.cardDireita}>
                <Text style={[styles.cardValor, { color: cor.texto }]}>
                  {(item.tipo === 'despesa' || item.tipo === 'saida') ? '- ' : '+ '}
                  {formatarValor(valorExibido)}
                </Text>
                <TouchableOpacity
                  onPress={() => confirmarRemocao(item.id, item.descricao)}
                  style={styles.btnRemover}
                >
                  <Text style={styles.btnRemoverTexto}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/contabil/novo')}
      >
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  periodos: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  periodoBotao: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  periodoAtivo: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  periodoTexto: { fontSize: 12, color: '#666', fontWeight: '600' },
  periodoTextoAtivo: { color: '#fff' },
  saldoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 5,
    elevation: 2,
  },
  saldoLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  saldoValor: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  saldoSub: { fontSize: 12, color: '#888' },
  resumoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  resumoCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 1,
  },
  resumoLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  resumoValor: { fontSize: 14, fontWeight: '700' },
  historicoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  vazio: { alignItems: 'center', marginTop: 40 },
  vazioTexto: { fontSize: 16, color: '#888' },
  vazioSub: { fontSize: 13, color: '#aaa', marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 1,
    gap: 10,
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBadgeTexto: { fontSize: 11, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardDescricao: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  cardCategoria: { fontSize: 12, color: '#888', marginTop: 2 },
  cardData: { fontSize: 11, color: '#aaa', marginTop: 3 },
  cardDireita: { alignItems: 'flex-end', gap: 4 },
  cardValor: { fontSize: 14, fontWeight: '700' },
  btnRemover: { padding: 4 },
  btnRemoverTexto: { color: '#ef4444', fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabTexto: { color: '#fff', fontSize: 28, lineHeight: 32 },
});