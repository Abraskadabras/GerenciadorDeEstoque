import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { adicionarLancamento, getEstoque, atualizarItemEstoque  } from '../../src/storage/database';
import { Lancamento, TipoLancamento, ItemEstoque } from '../../src/types';

const CATEGORIAS_DESPESA = [
  'Aluguel', 'Energia', 'Água', 'Internet', 'Telefone',
  'Transporte', 'Salário', 'Imposto', 'Outros'
];

export default function NovoLancamento() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoLancamento>('venda');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [categoria, setCategoria] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [produtos, setProdutos] = useState<ItemEstoque[]>([]);
 // const [data, setData] = useState(new Date().toISOString().split('T')[0]);

 function dataHoje() {
  const d = new Date();
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
  }

  const [data, setData] = useState(dataHoje());

  function dataParaISO(dataBR: string): string {
  const partes = dataBR.split('/');
  if (partes.length !== 3) return new Date().toISOString();
  const [dia, mes, ano] = partes;
  return new Date(`${ano}-${mes}-${dia}T12:00:00`).toISOString();
  }

  function aplicarMascara(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  }

  

  useEffect(() => {
    async function carregar() {
      const lista = await getEstoque();
      setProdutos(lista);
    }
    carregar();
  }, []);

  const tipos: { key: TipoLancamento; label: string; cor: string; emoji: string }[] = [
    { key: 'venda', label: 'Venda', cor: '#059669', emoji: '🛍' },
    { key: 'entrada', label: 'Entrada', cor: '#4F46E5', emoji: '⬇️' },
    { key: 'despesa', label: 'Despesa', cor: '#D97706', emoji: '📋' },
    { key: 'saida', label: 'Saída', cor: '#ef4444', emoji: '⬆️' },
  ];

  function preencherValorProduto(id: string) {
    const produto = produtos.find((p) => p.id === id);
    if (produto && produto.valorVenda > 0) {
      setValor(String(produto.valorVenda));
    }
    setProdutoId(id);
    if (produto) setDescricao(`Venda: ${produto.nome}`);
  }

  async function salvar() {
    if (!descricao.trim() || !valor.trim()) {
      Alert.alert('Atenção', 'Preencha descrição e valor.');
      return;
    }

    const novo: Lancamento = {
      id: Date.now().toString(),
      tipo,
      descricao: descricao.trim(),
      valor: Number(valor.replace(',', '.')),
      quantidade: tipo === 'venda' ? Number(quantidade) : undefined,
      produtoId: tipo === 'venda' ? produtoId : undefined,
      categoria: tipo === 'despesa' ? categoria : undefined,
      data: dataParaISO(data),
      createdAt: new Date().toISOString(),
    };

    await adicionarLancamento(novo);

    // Baixa automática no estoque
    if (tipo === 'venda' && produtoId) {
      const itens = await getEstoque();
      const item = itens.find((i) => i.id === produtoId);
      if (item) {
        const novaQuantidade = Math.max(0, item.quantidade - (Number(quantidade) || 1));
        await atualizarItemEstoque({ ...item, quantidade: novaQuantidade });

        // Avisa se estoque ficou baixo após a venda
        if (novaQuantidade <= item.quantidadeMinima) {
          Alert.alert(
            '⚠️ Estoque baixo',
            `"${item.nome}" ficou com ${novaQuantidade} ${item.unidade} — abaixo do mínimo de ${item.quantidadeMinima}.`,
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
      }
    }

    router.back();
  }

  const produtoSelecionado = produtos.find((p) => p.id === produtoId);
  const valorNum = Number(valor.replace(',', '.')) || 0;
  const qtdNum = Number(quantidade) || 1;
  const totalVenda = tipo === 'venda' ? valorNum * qtdNum : 0;
  const lucroVenda = tipo === 'venda' && produtoSelecionado
    ? (produtoSelecionado.valorVenda - produtoSelecionado.valorCompra) * qtdNum
    : 0;

  return (
    <ScrollView style={styles.container}>

      {/* Tipo */}
      <Text style={styles.label}>Tipo de lançamento *</Text>
      <View style={styles.tipoContainer}>
        {tipos.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tipoBotao, tipo === t.key && { backgroundColor: t.cor, borderColor: t.cor }]}
            onPress={() => setTipo(t.key)}
          >
            <Text style={styles.tipoEmoji}>{t.emoji}</Text>
            <Text style={[styles.tipoTexto, tipo === t.key && styles.tipoTextoAtivo]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Data */}
      <Text style={styles.label}>Data *</Text>
      <TextInput
        style={styles.input}
        value={data}
        onChangeText={(v) => setData(aplicarMascara(v))}
        keyboardType="numeric"
        placeholder="DD-MM-AAAA"
        maxLength={10}
      />

      {/* Produto (só para venda) */}
      {tipo === 'venda' && (
        <>
          <Text style={styles.label}>Produto</Text>
          {produtos.length === 0 ? (
            <View style={styles.aviso}>
              <Text style={styles.avisoTexto}>Nenhum produto no estoque.</Text>
            </View>
          ) : (
            <View style={styles.opcoesFlex}>
              <TouchableOpacity
                style={[styles.opcao, produtoId === '' && styles.opcaoAtiva]}
                onPress={() => { setProdutoId(''); setDescricao(''); setValor(''); }}
              >
                <Text style={[styles.opcaoTexto, produtoId === '' && styles.opcaoTextoAtivo]}>
                  Nenhum
                </Text>
              </TouchableOpacity>
              {produtos.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.opcao, produtoId === p.id && styles.opcaoAtiva]}
                  onPress={() => preencherValorProduto(p.id)}
                >
                  <Text style={[styles.opcaoTexto, produtoId === p.id && styles.opcaoTextoAtivo]}>
                    {p.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Quantidade vendida</Text>
          <View style={styles.quantidadeContainer}>
            <TouchableOpacity
              style={styles.qtdBotao}
              onPress={() => setQuantidade(String(Math.max(1, qtdNum - 1)))}
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
              onPress={() => setQuantidade(String(qtdNum + 1))}
            >
              <Text style={styles.qtdBotaoTexto}>+</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Categoria (só para despesa) */}
      {tipo === 'despesa' && (
        <>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.opcoesFlex}>
            {CATEGORIAS_DESPESA.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.opcao, categoria === cat && styles.opcaoAtivaDespesa]}
                onPress={() => setCategoria(cat)}
              >
                <Text style={[styles.opcaoTexto, categoria === cat && styles.opcaoTextoAtivo]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Descrição */}
      <Text style={styles.label}>Descrição *</Text>
      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="ex: Venda balcão, Aluguel março..."
      />

      {/* Valor */}
      <Text style={styles.label}>
        {tipo === 'venda' ? 'Valor unitário (R$)' : 'Valor (R$)'}
      </Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        keyboardType="decimal-pad"
        placeholder="ex: 50,00"
      />

      {/* Preview venda */}
      {tipo === 'venda' && valorNum > 0 && (
        <View style={styles.previewCard}>
          <View style={styles.previewLinha}>
            <Text style={styles.previewLabel}>Total da venda</Text>
            <Text style={[styles.previewValor, { color: '#059669' }]}>
              {totalVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
          {lucroVenda > 0 && (
            <View style={styles.previewLinha}>
              <Text style={styles.previewLabel}>Lucro da venda</Text>
              <Text style={[styles.previewValor, { color: '#059669' }]}>
                {lucroVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={[styles.btn, { backgroundColor: tipos.find(t => t.key === tipo)?.cor }]} onPress={salvar}>
        <Text style={styles.btnTexto}>Registrar lançamento</Text>
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
  tipoContainer: { flexDirection: 'row', gap: 8 },
  tipoBotao: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tipoEmoji: { fontSize: 18, marginBottom: 2 },
  tipoTexto: { fontSize: 11, color: '#666', fontWeight: '600' },
  tipoTextoAtivo: { color: '#fff' },
  aviso: { backgroundColor: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e5e5e5' },
  avisoTexto: { fontSize: 13, color: '#888' },
  opcoesFlex: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  opcaoAtiva: { backgroundColor: '#059669', borderColor: '#059669' },
  opcaoAtivaDespesa: { backgroundColor: '#D97706', borderColor: '#D97706' },
  opcaoTexto: { fontSize: 13, color: '#666' },
  opcaoTextoAtivo: { color: '#fff', fontWeight: '600' },
  quantidadeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtdBotao: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center',
  },
  qtdBotaoTexto: { color: '#fff', fontSize: 24, fontWeight: '600', lineHeight: 28 },
  qtdInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 8,
    padding: 12, fontSize: 18, fontWeight: '700',
    borderWidth: 1, borderColor: '#e5e5e5',
  },
  previewCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  previewLinha: { flexDirection: 'row', justifyContent: 'space-between' },
  previewLabel: { fontSize: 13, color: '#666' },
  previewValor: { fontSize: 14, fontWeight: '700' },
  btn: {
    borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 32, marginBottom: 40,
  },
  btnTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
});