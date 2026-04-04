import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ItemEstoque, Fornecedor } from '../../src/types';
import { getEstoque, removerItemEstoque, getFornecedores } from '../../src/storage/database';

export default function Estoque() {
  const router = useRouter();
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  async function carregar() {
    const [dados, lista] = await Promise.all([
      getEstoque(),
      getFornecedores(),
    ]);
    setItens(dados);
    setFornecedores(lista);
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  function nomeFornecedor(id: string) {
    if (!id) return null;
    const f = fornecedores.find((f) => f.id === id);
    return f ? f.nome : null;
  }

  async function confirmarRemocao(id: string, nome: string) {
    Alert.alert(
      'Remover item',
      `Deseja remover "${nome}" do estoque?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerItemEstoque(id);
            carregar();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhum item no estoque.</Text>
            <Text style={styles.vazioSub}>Toque em + para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              item.quantidade <= item.quantidadeMinima && styles.cardAlerta
            ]}
            onPress={() => router.push(`/estoque/${item.id}`)}
            activeOpacity={0.75}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardQtd}>
                {item.quantidade} {item.unidade}
                {item.quantidade <= item.quantidadeMinima && (
                  <Text style={styles.alertaTexto}> ⚠ estoque baixo</Text>
                )}
              </Text>
              {nomeFornecedor(item.fornecedorId) && (
                <Text style={styles.cardFornecedor}>
                  🏭 {nomeFornecedor(item.fornecedorId)}
                </Text>
              )}
            </View>
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
        onPress={() => router.push('/estoque/novo')}
      >
        <Text style={styles.fabTexto}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
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
  },
  cardAlerta: { borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  cardQtd: { fontSize: 13, color: '#666', marginTop: 3 },
  alertaTexto: { color: '#D97706', fontWeight: '600' },
  cardFornecedor: { fontSize: 12, color: '#0F766E', marginTop: 4 },
  btnRemover: { padding: 8 },
  btnRemoverTexto: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
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