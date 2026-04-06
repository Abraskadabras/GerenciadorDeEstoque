import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getEstoque, getFornecedores, getMateriais } from '../src/storage/database';

export default function Dashboard() {
  const router = useRouter();
  const [totais, setTotais] = useState({
    estoque: 0,
    fornecedores: 0,
    materiais: 0,
    alertas: 0,
    totalInvestidoEstoque: 0,
    totalLucroEstoque: 0,
    totalMateriais: 0,
  });

  async function carregar() {
    const [estoque, fornecedores, materiais] = await Promise.all([
      getEstoque(),
      getFornecedores(),
      getMateriais(),
    ]);

    const alertas = estoque.filter((i) => i.quantidade <= i.quantidadeMinima).length;
    const totalInvestidoEstoque = estoque.reduce((acc, i) => acc + ((i.valorCompra ?? 0) * i.quantidade), 0);
    const totalLucroEstoque = estoque.reduce((acc, i) => acc + (((i.valorVenda ?? 0) - (i.valorCompra ?? 0)) * i.quantidade), 0);
    const totalMateriais = materiais.reduce((acc, m) => acc + ((m.valor ?? 0) * m.quantidade), 0);

    setTotais({
      estoque: estoque.length,
      fornecedores: fornecedores.length,
      materiais: materiais.length,
      alertas,
      totalInvestidoEstoque,
      totalLucroEstoque,
      totalMateriais,
    });
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  const modulos = [
    {
      titulo: 'Estoque',
      descricao: `${totais.estoque} itens cadastrados`,
      rota: '/estoque',
      cor: '#4F46E5',
      emoji: '📦',
    },
    {
      titulo: 'Fornecedores',
      descricao: `${totais.fornecedores} fornecedores`,
      rota: '/fornecedores',
      cor: '#0F766E',
      emoji: '🏭',
    },
    {
      titulo: 'Matéria-prima',
      descricao: `${totais.materiais} materiais`,
      rota: '/materiais',
      cor: '#B45309',
      emoji: '🧪',
    },
    {
      titulo: 'Contábil',
      descricao: 'Contabilidade e finanças',
      rota: '/contabil',
      cor: '#3da9d3',
      emoji: '📊',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Operador de Estoque</Text>
      <Text style={styles.subtitulo}>Visão geral do negócio</Text>

      {/* Banner de alertas */}
      {totais.alertas > 0 && (
        <TouchableOpacity
          style={styles.alerta}
          onPress={() => router.push('/estoque')}
        >
          <Text style={styles.alertaEmoji}>⚠️</Text>
          <View>
            <Text style={styles.alertaTitulo}>
              {totais.alertas} {totais.alertas === 1 ? 'item' : 'itens'} com estoque baixo
            </Text>
            <Text style={styles.alertaSub}>
              Toque aqui, e veja qual.
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Totais do estoque */}
      {totais.totalInvestidoEstoque > 0 && (
        <View style={styles.totaisContainer}>
          <View style={[styles.totalCard, { borderLeftColor: '#4F46E5' }]}>
            <Text style={styles.totalLabel}>Investido em estoque</Text>
            <Text style={[styles.totalValor, { color: '#4F46E5' }]}>
              {totais.totalInvestidoEstoque.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
          <View style={[styles.totalCard, { borderLeftColor: '#059669' }]}>
            <Text style={styles.totalLabel}>Lucro potencial</Text>
            <Text style={[
              styles.totalValor,
              { color: totais.totalLucroEstoque >= 0 ? '#059669' : '#ef4444' }
            ]}>
              {totais.totalLucroEstoque.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Total em materiais */}
      {totais.totalMateriais > 0 && (
        <View style={styles.totalMateriaisCard}>
          <Text style={styles.totalLabel}>Total investido em materiais</Text>
          <Text style={[styles.totalValor, { color: '#BE185D' }]}>
            {totais.totalMateriais.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      )}

      {/* Cards dos módulos */}
      <View style={styles.grade}>
        {modulos.map((modulo) => (
          <TouchableOpacity
            key={modulo.titulo}
            style={[styles.card, { borderLeftColor: modulo.cor }]}
            onPress={() => router.push(modulo.rota)}
            activeOpacity={0.75}
          >
            <Text style={styles.emoji}>{modulo.emoji}</Text>
            <Text style={[styles.cardTitulo, { color: modulo.cor }]}>
              {modulo.titulo}
            </Text>
            <Text style={styles.cardDescricao}>{modulo.descricao}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginTop: 20 },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 20, marginTop: 4 },
  alerta: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  alertaEmoji: { fontSize: 24 },
  alertaTitulo: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  alertaSub: { fontSize: 12, color: '#B45309', marginTop: 2 },
  totaisContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  totalCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 1,
  },
  totalMateriaisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#BE185D',
    elevation: 1,
    marginBottom: 14,
  },
  totalLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  totalValor: { fontSize: 16, fontWeight: '700' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '47%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emoji: { fontSize: 28, marginBottom: 10 },
  cardTitulo: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardDescricao: { fontSize: 12, color: '#888' },
});