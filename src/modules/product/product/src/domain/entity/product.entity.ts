export class Product {
  id: string;
  produtoSubCategoriaId: string;
  produtoUnidadeMedidaId: string;
  produtoMarcaId: string;
  nome: string;
  gtin?: string;
  codigoInterno?: string;
  valorCompra: number;
  valorVenda: number;
  quantidadeEstoque: number;
  cadastro: Date;
  descricao?: string;
}
