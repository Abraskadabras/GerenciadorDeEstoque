import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemEstoque, Fornecedor, Material } from '../types';
import { Lancamento } from '../types';

const CHAVE_LANCAMENTOS = '@stockmanager:lancamentos';


const CHAVES = {
  estoque: '@stockmanager:estoque',
  fornecedores: '@stockmanager:fornecedores',
  materiais: '@stockmanager:materiais',
};


export async function getLancamentos(): Promise<Lancamento[]> {
  const json = await AsyncStorage.getItem(CHAVE_LANCAMENTOS);
  return json ? JSON.parse(json) : [];
}

export async function adicionarLancamento(l: Lancamento): Promise<void> {
  const lista = await getLancamentos();
  await AsyncStorage.setItem(CHAVE_LANCAMENTOS, JSON.stringify([...lista, l]));
}

export async function removerLancamento(id: string): Promise<void> {
  const lista = await getLancamentos();
  await AsyncStorage.setItem(
    CHAVE_LANCAMENTOS,
    JSON.stringify(lista.filter((l) => l.id !== id))
  );
}

// --- Estoque ---

export async function getEstoque(): Promise<ItemEstoque[]> {
  const json = await AsyncStorage.getItem(CHAVES.estoque);
  return json ? JSON.parse(json) : [];
}

export async function salvarEstoque(itens: ItemEstoque[]): Promise<void> {
  await AsyncStorage.setItem(CHAVES.estoque, JSON.stringify(itens));
}

export async function adicionarItemEstoque(item: ItemEstoque): Promise<void> {
  const itens = await getEstoque();
  await salvarEstoque([...itens, item]);
}

export async function removerItemEstoque(id: string): Promise<void> {
  const itens = await getEstoque();
  await salvarEstoque(itens.filter((i) => i.id !== id));
}

export async function atualizarItemEstoque(itemAtualizado: ItemEstoque): Promise<void> {
  const itens = await getEstoque();
  const novos = itens.map((i) => i.id === itemAtualizado.id ? itemAtualizado : i);
  await salvarEstoque(novos);
}

// --- Fornecedores ---

export async function getFornecedores(): Promise<Fornecedor[]> {
  const json = await AsyncStorage.getItem(CHAVES.fornecedores);
  return json ? JSON.parse(json) : [];
}

export async function adicionarFornecedor(f: Fornecedor): Promise<void> {
  const lista = await getFornecedores();
  await AsyncStorage.setItem(CHAVES.fornecedores, JSON.stringify([...lista, f]));
}

export async function removerFornecedor(id: string): Promise<void> {
  const lista = await getFornecedores();
  await AsyncStorage.setItem(
    '@stockmanager:fornecedores',
    JSON.stringify(lista.filter((f) => f.id !== id))
  );
}

export async function atualizarFornecedor(atualizado: Fornecedor): Promise<void> {
  const lista = await getFornecedores();
  const novos = lista.map((f) => f.id === atualizado.id ? atualizado : f);
  await AsyncStorage.setItem('@stockmanager:fornecedores', JSON.stringify(novos));
}


// --- Materiais ---

export async function getMateriais(): Promise<Material[]> {
  const json = await AsyncStorage.getItem('@stockmanager:materiais');
  return json ? JSON.parse(json) : [];
}

export async function adicionarMaterial(m: Material): Promise<void> {
  const lista = await getMateriais();
  await AsyncStorage.setItem('@stockmanager:materiais', JSON.stringify([...lista, m]));
}

export async function removerMaterial(id: string): Promise<void> {
  const lista = await getMateriais();
  await AsyncStorage.setItem(
    '@stockmanager:materiais',
    JSON.stringify(lista.filter((m) => m.id !== id))
  );
}

export async function atualizarMaterial(atualizado: Material): Promise<void> {
  const lista = await getMateriais();
  const novos = lista.map((m) => m.id === atualizado.id ? atualizado : m);
  await AsyncStorage.setItem('@stockmanager:materiais', JSON.stringify(novos));
}