import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFornecedores, atualizarFornecedor, removerFornecedor } from '../../src/storage/database';
import { Fornecedor } from '../../src/types';

export default function DetalheFornecedor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function buscar() {
      const lista = await getFornecedores();
      const encontrado = lista.find((f) => f.id === id);
      if (encontrado) {
        setFornecedor(encontrado);
        setNome(encontrado.nome);
        setTelefone(encontrado.telefone.toString());
        setEmail(encontrado.email);
      }
    }
    buscar();
  }, [id]);

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório.');
      return;
    }
    await atualizarFornecedor({
      ...fornecedor!,
      nome: nome.trim(),
      telefone: Number(telefone.trim()),
      email: email.trim(),
    });
    Alert.alert('Sucesso', 'Fornecedor atualizado!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }

  async function confirmarExclusao() {
    Alert.alert(
      'Excluir fornecedor',
      `Deseja excluir "${nome}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await removerFornecedor(id!);
            router.back();
          },
        },
      ]
    );
  }

  if (!fornecedor) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0F766E" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nome *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnTexto}>Salvar alterações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnExcluir} onPress={confirmarExclusao}>
        <Text style={styles.btnExcluirTexto}>Excluir fornecedor</Text>
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
    backgroundColor: '#0F766E',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnExcluir: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  btnExcluirTexto: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});