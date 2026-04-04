export type ItemEstoque = {
    id: string;
    nome: string;
    quantidade: number;
    unidade: string;
    quantidadeMinima: number;
    fornecedorId: string;
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