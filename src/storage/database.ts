import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemEstoque, Fornecedor, Material } from '../types';

const CHAVES = {
  estoque: '@stockmanager:estoque',
  fornecedores: '@stockmanager:fornecedores',
  materiais: '@stockmanager:materiais',
};

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

// --- Fornecedores ---

export async function getFornecedores(): Promise<Fornecedor[]> {
  const json = await AsyncStorage.getItem(CHAVES.fornecedores);
  return json ? JSON.parse(json) : [];
}

export async function adicionarFornecedor(f: Fornecedor): Promise<void> {
  const lista = await getFornecedores();
  await AsyncStorage.setItem(CHAVES.fornecedores, JSON.stringify([...lista, f]));
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