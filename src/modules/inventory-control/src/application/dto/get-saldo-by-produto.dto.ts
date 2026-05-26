import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetSaldoByProdutoDto {
  @IsUUID()
  @IsNotEmpty({ message: 'produtoId é obrigatório' })
  produtoId: string;
}
