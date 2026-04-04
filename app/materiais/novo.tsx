import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { adicionarMaterial } from '../../src/storage/database';
import { Material } from '../../src/types';

export default function NovoMaterial() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('unid');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'materia-prima' | 'produto-uso'>('materia-prima');

  async function salvar() {
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert('Atenção', 'Preencha nome e quantidade.');
      return;
    }

    const novo: Material = {
      id: Date.now().toString(),
      nome: nome.trim(),
      quantidade: Number(quantidade),
      unidade,
      valor: Number(valor.replace(',', '.')),
      tipo,
      createdAt: new Date().toISOString(),
    };

    await adicionarMaterial(novo);
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Tipo *</Text>
      <View style={styles.tipoContainer}>
        {(['materia-prima', 'produto-uso'] as const).map((op) => (
          <TouchableOpacity
            key={op}
            style={[styles.tipoBotao, tipo === op && styles.tipoAtivo]}
            onPress={() => setTipo(op)}
          >
            <Text style={[styles.tipoTexto, tipo === op && styles.tipoTextoAtivo]}>
              {op === 'materia-prima' ? 'Matéria-prima' : 'Uso interno'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Nome *</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="ex: Cimento, Papel A4"
      />

      <Text style={styles.label}>Quantidade *</Text>
      <TextInput
        style={styles.input}
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        placeholder="ex: 100"
      />

      <Text style={styles.label}>Unidade</Text>
      <TextInput
        style={styles.input}
        value={unidade}
        onChangeText={setUnidade}
        placeholder="ex: kg, unid, caixas"
      />

      <Text style={styles.label}>Valor unitário (R$)</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        keyboardType="decimal-pad"
        placeholder="ex: 12,50"
      />

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnTexto}>Salvar material</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 16 },
  tipoContainer: { flexDirection: 'row', gap: 10 },
  tipoBotao: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tipoAtivo: { backgroundColor: '#BE185D', borderColor: '#BE185D' },
  tipoTexto: { fontSize: 13, color: '#666', fontWeight: '500' },
  tipoTextoAtivo: { color: '#fff' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  btn: {
    backgroundColor: '#BE185D',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});