import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getEstoque, atualizarItemEstoque, removerItemEstoque, getFornecedores } from '../../src/storage/database';
import { ItemEstoque, Fornecedor } from '../../src/types';

export default function DetalheEstoque() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ItemEstoque | null>(null);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [quantidadeMinima, setQuantidadeMinima] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorId, setFornecedorId] = useState('');

  useEffect(() => {
    async function buscar() {
      const [itens, lista] = await Promise.all([getEstoque(), getFornecedores()]);
      const encontrado = itens.find((i) => i.id === id);
      if (encontrado) {
        setItem(encontrado);
        setNome(encontrado.nome);
        setQuantidade(String(encontrado.quantidade));
        setUnidade(encontrado.unidade);
        setQuantidadeMinima(String(encontrado.quantidadeMinima));
        setValorCompra(String(encontrado.valorCompra ?? 0));
        setValorVenda(String(encontrado.valorVenda ?? 0));
        setFornecedorId(encontrado.fornecedorId ?? '');
      }
      setFornecedores(lista);
    }
    buscar();
  }, [id]);

  function ajustarQuantidade(delta: number) {
    const atual = Number(quantidade) || 0;
    setQuantidade(String(Math.max(0, atual + delta)));
  }

  const compra = Number(valorCompra.replace(',', '.')) || 0;
  const venda = Number(valorVenda.replace(',', '.')) || 0;
  const lucroUnitario = venda - compra;
  const margemPercent = compra > 0 ? ((lucroUnitario / compra) * 100) : 0;
  const lucroTotal = lucroUnitario * (Number(quantidade) || 0);

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
      valorCompra: compra,
      valorVenda: venda,
      fornecedorId,
    });

    Alert.alert('Sucesso', 'Item atualizado!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }

  async function confirmarExclusao() {
    Alert.alert(
      'Excluir item',
      `Deseja excluir "${nome}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await removerItemEstoque(id!);
            router.back();
          },
        },
      ]
    );
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
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Quantidade *</Text>
      <View style={styles.quantidadeContainer}>
        <TouchableOpacity style={styles.qtdBotao} onPress={() => ajustarQuantidade(-1)}>
          <Text style={styles.qtdBotaoTexto}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.qtdInput}
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
          textAlign="center"
        />
        <TouchableOpacity style={styles.qtdBotao} onPress={() => ajustarQuantidade(1)}>
          <Text style={styles.qtdBotaoTexto}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Unidade</Text>
      <TextInput style={styles.input} value={unidade} onChangeText={setUnidade} />

      <Text style={styles.label}>Quantidade mínima (alerta)</Text>
      <TextInput
        style={styles.input}
        value={quantidadeMinima}
        onChangeText={setQuantidadeMinima}
        keyboardType="numeric"
      />

      {/* Valores lado a lado */}
      <View style={styles.valoresContainer}>
        <View style={styles.valorItem}>
          <Text style={styles.label}>Valor de compra (R$)</Text>
          <TextInput
            style={styles.input}
            value={valorCompra}
            onChangeText={setValorCompra}
            keyboardType="decimal-pad"
            placeholder="ex: 8,00"
          />
        </View>
        <View style={styles.valorItem}>
          <Text style={styles.label}>Valor de venda (R$)</Text>
          <TextInput
            style={styles.input}
            value={valorVenda}
            onChangeText={setValorVenda}
            keyboardType="decimal-pad"
            placeholder="ex: 15,00"
          />
        </View>
      </View>

      {/* Preview de lucro */}
      {compra > 0 && venda > 0 && (
        <View style={[
          styles.lucroCard,
          lucroUnitario >= 0 ? styles.lucroPositivo : styles.lucroNegativo
        ]}>
          <Text style={styles.lucroTitulo}>Análise de lucro</Text>
          <View style={styles.lucroLinha}>
            <Text style={styles.lucroLabel}>Lucro por unidade</Text>
            <Text style={[styles.lucroValor, { color: lucroUnitario >= 0 ? '#059669' : '#ef4444' }]}>
              {lucroUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
          <View style={styles.lucroLinha}>
            <Text style={styles.lucroLabel}>Margem de lucro</Text>
            <Text style={[styles.lucroValor, { color: lucroUnitario >= 0 ? '#059669' : '#ef4444' }]}>
              {margemPercent.toFixed(1)}%
            </Text>
          </View>
          {Number(quantidade) > 0 && (
            <View style={[styles.lucroLinha, styles.lucroDestaque]}>
              <Text style={styles.lucroLabelDestaque}>Lucro total ({quantidade} unid)</Text>
              <Text style={[styles.lucroValorDestaque, { color: lucroTotal >= 0 ? '#059669' : '#ef4444' }]}>
                {lucroTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Fornecedor */}
      <Text style={styles.label}>Fornecedor</Text>
      {fornecedores.length === 0 ? (
        <View style={styles.semFornecedor}>
          <Text style={styles.semFornecedorTexto}>Nenhum fornecedor cadastrado.</Text>
        </View>
      ) : (
        <View style={styles.fornecedorLista}>
          <TouchableOpacity
            style={[styles.fornecedorOpcao, fornecedorId === '' && styles.fornecedorAtivo]}
            onPress={() => setFornecedorId('')}
          >
            <Text style={[styles.fornecedorTexto, fornecedorId === '' && styles.fornecedorTextoAtivo]}>
              Nenhum
            </Text>
          </TouchableOpacity>
          {fornecedores.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.fornecedorOpcao, fornecedorId === f.id && styles.fornecedorAtivo]}
              onPress={() => setFornecedorId(f.id)}
            >
              <Text style={[styles.fornecedorTexto, fornecedorId === f.id && styles.fornecedorTextoAtivo]}>
                {f.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={salvar}>
        <Text style={styles.btnTexto}>Salvar alterações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnExcluir} onPress={confirmarExclusao}>
        <Text style={styles.btnExcluirTexto}>Excluir item</Text>
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
  quantidadeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtdBotao: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
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
  valoresContainer: { flexDirection: 'row', gap: 10 },
  valorItem: { flex: 1 },
  lucroCard: {
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  lucroPositivo: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  lucroNegativo: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  lucroTitulo: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 10 },
  lucroLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  lucroLabel: { fontSize: 13, color: '#666' },
  lucroValor: { fontSize: 14, fontWeight: '600' },
  lucroDestaque: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  lucroLabelDestaque: { fontSize: 13, fontWeight: '700', color: '#444' },
  lucroValorDestaque: { fontSize: 16, fontWeight: '700' },
  semFornecedor: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  semFornecedorTexto: { fontSize: 13, color: '#888' },
  fornecedorLista: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fornecedorOpcao: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  fornecedorAtivo: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  fornecedorTexto: { fontSize: 13, color: '#666' },
  fornecedorTextoAtivo: { color: '#fff', fontWeight: '600' },
  btn: {
    backgroundColor: '#4F46E5',
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