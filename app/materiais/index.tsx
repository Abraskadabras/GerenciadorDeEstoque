import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Material } from '../../src/types';
import { getMateriais, removerMaterial } from '../../src/storage/database';

export default function Materiais() {
  const router = useRouter();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'materia-prima' | 'produto-uso'>('todos');

  async function carregar() {
    const dados = await getMateriais();
    setMateriais(dados);
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  const listaFiltrada = materiais.filter((m) => {
    if (filtro === 'todos') return true;
    return m.tipo === filtro;
  });

  const totalGeral = materiais.reduce((acc, m) => acc + (m.valor * m.quantidade), 0);
  const totalFiltrado = listaFiltrada.reduce((acc, m) => acc + (m.valor * m.quantidade), 0);

  function formatarValor(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async function confirmarRemocao(id: string, nome: string) {
    Alert.alert(
      'Remover material',
      `Deseja remover "${nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerMaterial(id);
            carregar();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>

      {/* Filtro */}
      <View style={styles.filtros}>
        {(['todos', 'materia-prima', 'produto-uso'] as const).map((op) => (
          <TouchableOpacity
            key={op}
            style={[styles.filtroBotao, filtro === op && styles.filtroAtivo]}
            onPress={() => setFiltro(op)}
          >
            <Text style={[styles.filtroTexto, filtro === op && styles.filtroTextoAtivo]}>
              {op === 'todos' ? 'Todos' : op === 'materia-prima' ? 'Matéria-prima' : 'Uso interno'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Card de total investido */}
      <View style={styles.totalCard}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Total investido</Text>
          <Text style={styles.totalValor}>{formatarValor(totalGeral)}</Text>
        </View>
        {filtro !== 'todos' && (
          <>
            <View style={styles.totalDivisor} />
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>
                {filtro === 'materia-prima' ? 'Matéria-prima' : 'Uso interno'}
              </Text>
              <Text style={[styles.totalValor, { fontSize: 15 }]}>
                {formatarValor(totalFiltrado)}
              </Text>
            </View>
          </>
        )}
      </View>

      <FlatList
        data={listaFiltrada}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhum material encontrado.</Text>
            <Text style={styles.vazioSub}>Toque em + para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          // 👇 Card inteiro é clicável — leva para a tela de edição
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/materiais/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={[
              styles.badge,
              { backgroundColor: item.tipo === 'materia-prima' ? '#FEF3C7' : '#EDE9FE' }
            ]}>
              <Text style={[
                styles.badgeTexto,
                { color: item.tipo === 'materia-prima' ? '#B45309' : '#6D28D9' }
              ]}>
                {item.tipo === 'materia-prima' ? 'MP' : 'UI'}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardQtd}>{item.quantidade} {item.unidade}</Text>
              {item.valor > 0 && (
                <Text style={styles.cardValor}>
                  {formatarValor(item.valor)} / unid
                  {'  ·  '}
                  <Text style={styles.cardTotal}>
                    Total: {formatarValor(item.valor * item.quantidade)}
                  </Text>
                </Text>
              )}
            </View>
            {/* 👇 Botão ✕ com stopPropagation para não abrir edição ao remover */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                confirmarRemocao(item.id, item.nome);
              }}
              style={styles.btnRemover}
            >
              <Text style={styles.btnRemoverTexto}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/materiais/novo')}
      >
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filtros: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filtroBotao: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  filtroAtivo: { backgroundColor: '#BE185D', borderColor: '#BE185D' },
  filtroTexto: { fontSize: 12, color: '#666', fontWeight: '500' },
  filtroTextoAtivo: { color: '#fff' },
  totalCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    elevation: 1,
  },
  totalItem: { flex: 1 },
  totalLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  totalValor: { fontSize: 18, fontWeight: '700', color: '#BE185D' },
  totalDivisor: {
    width: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 16,
  },
  vazio: { alignItems: 'center', marginTop: 80 },
  vazioTexto: { fontSize: 16, color: '#888' },
  vazioSub: { fontSize: 13, color: '#aaa', marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    gap: 12,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTexto: { fontSize: 11, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  cardQtd: { fontSize: 13, color: '#666', marginTop: 3 },
  cardValor: { fontSize: 12, color: '#888', marginTop: 3 },
  cardTotal: { color: '#BE185D', fontWeight: '600' },
  btnRemover: { padding: 8 },
  btnRemoverTexto: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#BE185D',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabTexto: { color: '#fff', fontSize: 28, lineHeight: 32 },
});