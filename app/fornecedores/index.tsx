import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Fornecedor } from '../../src/types';
import { getFornecedores } from '../../src/storage/database';

export default function Fornecedores() {
  const router = useRouter();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  async function carregar() {
    const dados = await getFornecedores();
    setFornecedores(dados);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={fornecedores}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhum fornecedor cadastrado.</Text>
            <Text style={styles.vazioSub}>Toque em + para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetra}>
                {item.nome.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              {item.telefone ? (
                <Text style={styles.cardDetalhe}>📞 {item.telefone}</Text>
              ) : null}
              {item.email ? (
                <Text style={styles.cardDetalhe}>✉ {item.email}</Text>
              ) : null}
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/fornecedores/novo')}
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarLetra: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  cardDetalhe: { fontSize: 13, color: '#666', marginTop: 3 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabTexto: { color: '#fff', fontSize: 28, lineHeight: 32 },
});