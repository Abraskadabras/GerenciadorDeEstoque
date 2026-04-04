import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { adicionarItemEstoque } from '../../src/storage/database';
import { ItemEstoque } from '../../src/types';

export default function NovoEstoque() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('unid');
  const [quantidadeMinima, setQuantidadeMinima] = useState('');

  async function salvar() {
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert('Atenção', 'Preencha nome e quantidade.');
      return;
    }

    const novoItem: ItemEstoque = {
      id: Date.now().toString(),
      nome: nome.trim(),
      quantidade: Number(quantidade),
      unidade,
      quantidadeMinima: Number(quantidadeMinima),
      fornecedorId: '',
      createdAt: new Date().toISOString(),
    };

    await adicionarItemEstoque(novoItem);
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome do item *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="ex: Camisa"
      />

      <Text style={styles.label}>Quantidade *</Text>
      <TextInput
        style={styles.input}
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        placeholder="ex: 50"
      />

      <Text style={styles.label}>Unidade</Text>
      <TextInput
        style={styles.input}
        value={unidade}
        onChangeText={setUnidade}
        placeholder="ex: kg, unid, litros"
      />

      <Text style={styles.label}>Quantidade mínima (alerta)</Text>
      <TextInput
        style={styles.input}
        value={quantidadeMinima}
        onChangeText={setQuantidadeMinima}
        keyboardType="numeric"
        placeholder="ex: 5"
      />

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnTexto}>Salvar item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
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