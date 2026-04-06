import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getMateriais, atualizarMaterial, removerMaterial } from '../../src/storage/database';
import { Material } from '../../src/types';

export default function DetalheMaterial() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'materia-prima' | 'produto-uso'>('materia-prima');

  useEffect(() => {
    async function buscar() {
      const lista = await getMateriais();
      const encontrado = lista.find((m) => m.id === id);
      if (encontrado) {
        setMaterial(encontrado);
        setNome(encontrado.nome);
        setQuantidade(String(encontrado.quantidade));
        setUnidade(encontrado.unidade);
        setValor(String(encontrado.valor ?? 0));
        setTipo(encontrado.tipo);
      }
    }
    buscar();
  }, [id]);

  async function salvar() {
    if (!nome.trim() || !quantidade.trim()) {
      Alert.alert('Atenção', 'Preencha nome e quantidade.');
      return;
    }

    await atualizarMaterial({
      ...material!,
      nome: nome.trim(),
      quantidade: Number(quantidade),
      unidade,
      valor: Number(valor.replace(',', '.')),
      tipo,
    });

    Alert.alert('Sucesso', 'Material atualizado!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }

  async function confirmarExclusao() {
    Alert.alert(
      'Excluir material',
      `Deseja excluir "${nome}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await removerMaterial(id!);
            router.back();
          },
        },
      ]
    );
  }

  function ajustarQuantidade(delta: number) {
    const atual = Number(quantidade) || 0;
    const novo = Math.max(0, atual + delta);
    setQuantidade(String(novo));
  }

  if (!material) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#BE185D" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.label}>Tipo</Text>
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
      />

      <Text style={styles.label}>Quantidade *</Text>
      <View style={styles.quantidadeContainer}>
        <TouchableOpacity
          style={styles.qtdBotao}
          onPress={() => ajustarQuantidade(-1)}
        >
          <Text style={styles.qtdBotaoTexto}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.qtdInput}
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
          textAlign="center"
        />
        <TouchableOpacity
          style={styles.qtdBotao}
          onPress={() => ajustarQuantidade(1)}
        >
          <Text style={styles.qtdBotaoTexto}>+</Text>
        </TouchableOpacity>
      </View>

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

      {Number(valor) > 0 && Number(quantidade) > 0 && (
        <View style={styles.totalPreview}>
          <Text style={styles.totalPreviewTexto}>
            Total em estoque:{' '}
            <Text style={styles.totalPreviewValor}>
              {(Number(valor.replace(',', '.')) * Number(quantidade))
                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnTexto}>Salvar alterações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnExcluir} onPress={confirmarExclusao}>
        <Text style={styles.btnExcluirTexto}>Excluir material</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtdBotao: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#BE185D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtdBotaoTexto: { color: '#fff', fontSize: 24, fontWeight: '600', lineHeight: 28 },
  qtdInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  totalPreview: {
    backgroundColor: '#FDF2F8',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  totalPreviewTexto: { fontSize: 13, color: '#888' },
  totalPreviewValor: { color: '#BE185D', fontWeight: '700', fontSize: 15 },
  btn: {
    backgroundColor: '#BE185D',
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