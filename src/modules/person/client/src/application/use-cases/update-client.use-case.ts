import { Inject, NotFoundException } from '@nestjs/common';

import { IPersonRepository } from '@person/shared/domain/repository/person-interface.repository';
import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
import { IContactRepository } from '@person/shared/domain/repository/person-contact-interface.repository';
import { IAddressRepository } from '@person/shared/domain/repository/person-address-interface.repository';
import { IClientRepository } from '../../domain/repository/client.interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdateClientDTO } from '../dto/update-client.dto';

export class UpdateClientUseCase implements BaseUseCase<any, any> {

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
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(data: { id: string; updateData: UpdateClientDTO }): Promise<any> {
    const client = await this.clientRepository.findById(data.id);

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const pessoaId = client.pessoa_id;
    const updateData = data.updateData;

    const result = await this.connection().tx('Update Client Person', async (transaction) => {
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

      if (updateData.cliente) {
        await this.clientRepository.update(data.id, updateData.cliente, transaction);
      }

      return { id: data.id, pessoaId };
    });

    return this.clientRepository.findById(result.id);
  }
}
