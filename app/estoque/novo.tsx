import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { adicionarItemEstoque, getFornecedores } from '../../src/storage/database';
import { ItemEstoque, Fornecedor } from '../../src/types';

export default function NovoEstoque() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('unid');
  const [quantidadeMinima, setQuantidadeMinima] = useState('5');
  const [valorCompra, setValorCompra] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorId, setFornecedorId] = useState('');

  useEffect(() => {
    async function carregarFornecedores() {
      const lista = await getFornecedores();
      setFornecedores(lista);
    }
    carregarFornecedores();
  }, []);

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

    const novoItem: ItemEstoque = {
      id: Date.now().toString(),
      nome: nome.trim(),
      quantidade: Number(quantidade),
      unidade,
      quantidadeMinima: Number(quantidadeMinima),
      valorCompra: compra,
      valorVenda: venda,
      fornecedorId,
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
        placeholder="ex: Farinha de trigo"
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

      {/* Valores */}
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
            <Text style={[
              styles.lucroValor,
              { color: lucroUnitario >= 0 ? '#059669' : '#ef4444' }
            ]}>
              {lucroUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
          <View style={styles.lucroLinha}>
            <Text style={styles.lucroLabel}>Margem de lucro</Text>
            <Text style={[
              styles.lucroValor,
              { color: lucroUnitario >= 0 ? '#059669' : '#ef4444' }
            ]}>
              {margemPercent.toFixed(1)}%
            </Text>
          </View>
          {Number(quantidade) > 0 && (
            <View style={[styles.lucroLinha, styles.lucroDestaque]}>
              <Text style={styles.lucroLabelDestaque}>Lucro total ({quantidade} unid)</Text>
              <Text style={[
                styles.lucroValorDestaque,
                { color: lucroTotal >= 0 ? '#059669' : '#ef4444' }
              ]}>
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
          <Text style={styles.semFornecedorTexto}>Nenhum fornecedor cadastrado ainda.</Text>
          <TouchableOpacity onPress={() => router.push('/fornecedores/novo')}>
            <Text style={styles.semFornecedorLink}>Cadastrar fornecedor →</Text>
          </TouchableOpacity>
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
  valoresContainer: { flexDirection: 'row', gap: 10 },
  valorItem: { flex: 1 },
  lucroCard: {
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  lucroPositivo: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  lucroNegativo: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
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
  semFornecedorLink: { fontSize: 13, color: '#4F46E5', fontWeight: '600', marginTop: 6 },
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
    marginBottom: 40,
  },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});