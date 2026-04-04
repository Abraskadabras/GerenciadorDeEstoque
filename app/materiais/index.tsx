import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
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

  useEffect(() => {
    carregar();
  }, []);

  const listafiltrada = materiais.filter((m) => {
    if (filtro === 'todos') return true;
    return m.tipo === filtro;
  });

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

      <FlatList
        data={listafiltrada}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vazioTexto}>Nenhum material encontrado.</Text>
            <Text style={styles.vazioSub}>Toque em + para adicionar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[
              styles.badge,
              { backgroundColor: item.tipo === 'materia-prima' ? '#FEF3C7' : '#EDE9FE' }
            ]}>
              <Text style={[
                styles.badgeTexto,
                { color: item.tipo === 'materia-prima' ? '#B45309' : '#6D28D9' }
              ]}>
                {item.tipo === 'materia-prima' ? 'Matéria-prima' : 'Uso interno'}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{item.nome}</Text>
              <Text style={styles.cardQtd}>{item.quantidade} {item.unidade}</Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await removerMaterial(item.id);
                carregar();
              }}
              style={styles.btnRemover}
            >
              <Text style={styles.btnRemoverTexto}>✕</Text>
            </TouchableOpacity>
          </View>
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
  filtroAtivo: {
    backgroundColor: '#BE185D',
    borderColor: '#BE185D',
  },
  filtroTexto: { fontSize: 12, color: '#666', fontWeight: '500' },
  filtroTextoAtivo: { color: '#fff' },
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  cardQtd: { fontSize: 13, color: '#666', marginTop: 3 },
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