import { Inject, NotFoundException } from '@nestjs/common';
import { ISupplierRepository } from '../../domain/repository/supplier.interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';

export class DeleteSupplierUseCase implements BaseUseCase<any, void> {
  constructor(
    @Inject('ISupplierRepository')
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(data: { id: string }): Promise<void> {
    const supplier = await this.supplierRepository.findById(data.id);

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    await this.supplierRepository.delete(data.id);
  }
}
