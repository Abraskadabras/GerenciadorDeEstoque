export type ItemEstoque = {
    id: string;
    nome: string;
    quantidade: number;
    unidade: string;
    quantidadeMinima: number;
    fornecedorId: string;
    valorCompra: number;
    valorVenda: number;
    createdAt: string;
    };

export type Fornecedor = {
    id: string;
    nome: string;
    telefone: number;
    email: string;
    createdAt: string;
};

export type Material = {
    id: string;
    nome: string;
    quantidade: number;
    unidade: string;
    tipo: 'materia-prima' | 'produto-uso';
    valor:number;
    createdAt: string;
};

export type TipoLancamento =
    | 'venda'
    | 'despesa'
    | 'entrada'
    | 'saida';

export type Lancamento = {
    id: string;
    tipo: TipoLancamento;
    descricao: string;
    valor: number;
    produtoId?: string;
    quantidade?: number;
    categoria?: string;
    data: string;
    createdAt: string;
};