import { Inject } from '@nestjs/common';

import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IContactRepository } from '@person/shared/domain/repository/person-contact-interface.repository';
import { IAddressRepository } from '@person/shared/domain/repository/person-address-interface.repository';
import { IPersonRepository } from '@person/shared/domain/repository/person-interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateSupplierDTO } from '../dto/create-supplier.dto';
import { ISupplierRepository } from '../../domain/repository/supplier.interface.repository';

export class CreateSupplierUseCase implements BaseUseCase<any, any> {

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
  ) { }

  async execute(data: CreateSupplierDTO) {
    try {
      const supplierCreated = await this.connection().tx('Create Supplier Person', async (transaction) => {
        const person = await this.personRepository.create({ fornecedor: 1, ...data.pessoa }, transaction);

        if (data.pessoa.tipo === 'F' && data.pessoa.fisica)
          await this.personFisicaRepository.create({ pessoaId: person.id, ...data.pessoa.fisica }, transaction);

        if (data.pessoa.tipo === 'J' && data.pessoa.juridica)
          await this.personJuridicaRepository.create({ pessoaId: person.id, ...data.pessoa.juridica }, transaction);

        if (data.pessoa.contatos)
          await Promise.all(
            data.pessoa.contatos.map(contato =>
              this.contactRepository.create({ pessoaId: person.id, ...contato }, transaction)
            )
          );

        if (data.pessoa.enderecos)
          await Promise.all(
            data.pessoa.enderecos.map(endereco =>
              this.addressRepository.create({ pessoaId: person.id, ...endereco }, transaction)
            )
          );

        await this.supplierRepository.create({ pessoa_id: person.id, categoria: data.fornecedor.categoria, prazoEntregaDias: data.fornecedor.prazoEntregaDias }, transaction);

        return person;
      });

      console.log('Supplier created successfully:', supplierCreated);
      return supplierCreated;
    } catch (error) {
      console.log(error);
    }
  }
}
