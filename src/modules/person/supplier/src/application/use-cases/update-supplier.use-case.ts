import { Inject, NotFoundException } from '@nestjs/common';

import { IPersonRepository } from '@person/shared/domain/repository/person-interface.repository';
import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
import { IContactRepository } from '@person/shared/domain/repository/person-contact-interface.repository';
import { IAddressRepository } from '@person/shared/domain/repository/person-address-interface.repository';
import { ISupplierRepository } from '../../domain/repository/supplier.interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdateSupplierDTO } from '../dto/update-supplier.dto';

export class UpdateSupplierUseCase implements BaseUseCase<any, any> {

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: any,
    @Inject('IPersonRepository')
    private readonly personRepository: IPersonRepository,
    @Inject('IPersonFisicaRepository')
    private readonly personFisicaRepository: IPersonFisicaRepository,
    @Inject('IPersonJuridicaRepository')
    private readonly personJuridicaRepository: IPersonJuridicaRepository,
    @Inject('IContactRepository')
    private readonly contactRepository: IContactRepository,
    @Inject('IAddressRepository')
    private readonly addressRepository: IAddressRepository,
    @Inject('ISupplierRepository')
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(data: { id: string; updateData: UpdateSupplierDTO }): Promise<any> {
    const supplier = await this.supplierRepository.findById(data.id);

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    const pessoaId = supplier.pessoa_id;
    const updateData = data.updateData;

    const result = await this.connection().tx('Update Supplier Person', async (transaction) => {
      if (updateData.pessoa) {
        await this.personRepository.update(pessoaId, updateData.pessoa, transaction);

        if (updateData.pessoa.tipo === 'F' && updateData.pessoa.fisica) {
          await this.personFisicaRepository.update(pessoaId, updateData.pessoa.fisica, transaction);
        }

        if (updateData.pessoa.tipo === 'J' && updateData.pessoa.juridica) {
          await this.personJuridicaRepository.update(pessoaId, updateData.pessoa.juridica, transaction);
        }

        if (updateData.pessoa.contatos) {
          await this.contactRepository.deleteByPessoaId(pessoaId, transaction);
          await Promise.all(
            updateData.pessoa.contatos.map(contato =>
              this.contactRepository.create({ pessoaId, ...contato }, transaction)
            )
          );
        }

        if (updateData.pessoa.enderecos) {
          await this.addressRepository.deleteByPessoaId(pessoaId, transaction);
          await Promise.all(
            updateData.pessoa.enderecos.map(endereco =>
              this.addressRepository.create({ pessoaId, ...endereco }, transaction)
            )
          );
        }
      }

      if (updateData.fornecedor) {
        await this.supplierRepository.update(data.id, updateData.fornecedor, transaction);
      }

      return { id: data.id, pessoaId };
    });

    return this.supplierRepository.findById(result.id);
  }
}
