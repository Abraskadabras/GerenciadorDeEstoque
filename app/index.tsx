import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const modulos = [
  {
    titulo: 'Estoque',
    descricao: 'Entradas e saídas',
    rota: '/estoque',
    cor: '#4F46E5',
    emoji: '📦',
  },
  {
    titulo: 'Fornecedores',
    descricao: 'Cadastro e contatos',
    rota: '/fornecedores',
    cor: '#0F766E',
    emoji: '🏭',
  },
  {
    titulo: 'Matéria-prima',
    descricao: 'Insumos e materiais',
    rota: '/materiais',
    cor: '#B45309',
    emoji: '🧪',
  },
  {
    titulo: 'Produtos',
    descricao: 'Itens de uso interno',
    rota: '/materiais',
    cor: '#BE185D',
    emoji: '🛒',
  },
];

export default function Dashboard() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Gerenciador</Text>
      <Text style={styles.subtitulo}>Gerenciador de estoque</Text>

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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
  },
  subtitulo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    marginTop: 4,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
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
  emoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescricao: {
    fontSize: 12,
    color: '#888',
  },
});