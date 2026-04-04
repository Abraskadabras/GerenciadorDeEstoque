import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getEstoque, atualizarItemEstoque } from '../../src/storage/database';
import { ItemEstoque } from '../../src/types';

export default function DetalheEstoque() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ItemEstoque | null>(null);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [quantidadeMinima, setQuantidadeMinima] = useState('');

  useEffect(() => {
    async function buscar() {
      const itens = await getEstoque();
      const encontrado = itens.find((i) => i.id === id);
      if (encontrado) {
        setItem(encontrado);
        setNome(encontrado.nome);
        setQuantidade(String(encontrado.quantidade));
        setUnidade(encontrado.unidade);
        setQuantidadeMinima(String(encontrado.quantidadeMinima));
      }
    }
    buscar();
  }, [id]);

  async function salvar() {
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert('Atenção', 'Preencha nome e quantidade.');
      return;
    }

    await atualizarItemEstoque({
      ...item!,
      nome: nome.trim(),
      quantidade: Number(quantidade),
      unidade,
      quantidadeMinima: Number(quantidadeMinima),
    });

    Alert.alert('Sucesso', 'Item atualizado!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }

  if (!item) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome do item *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Quantidade *</Text>
      <TextInput
        style={styles.input}
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Unidade</Text>
      <TextInput
        style={styles.input}
        value={unidade}
        onChangeText={setUnidade}
      />

      <Text style={styles.label}>Quantidade mínima (alerta)</Text>
      <TextInput
        style={styles.input}
        value={quantidadeMinima}
        onChangeText={setQuantidadeMinima}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnTexto}>Salvar alterações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  btn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});