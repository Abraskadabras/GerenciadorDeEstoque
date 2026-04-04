import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { adicionarFornecedor } from '../../src/storage/database';
import { Fornecedor } from '../../src/types';

export default function NovoFornecedor() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome do fornecedor é obrigatório.');
      return;
    }

    const novoFornecedor: Fornecedor = {
      id: Date.now().toString(),
      nome: nome.trim(),
      telefone: Number(telefone.trim()),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    };

    await adicionarFornecedor(novoFornecedor);
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome do fornecedor *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="ex: Distribuidora Silva"
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        placeholder="ex: (27) 99999-0000"
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="ex: contato@fornecedor.com"
      />

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnTexto}>Salvar fornecedor</Text>
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
    backgroundColor: '#0F766E',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});