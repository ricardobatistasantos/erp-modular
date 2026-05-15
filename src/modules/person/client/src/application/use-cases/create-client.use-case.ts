import { Inject } from '@nestjs/common';

import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IContactRepository } from '@person/shared/domain/repository/person-contact-interface.repository';
import { IAddressRepository } from '@person/shared/domain/repository/person-address-interface.repository';
import { IPersonRepository } from '@person/shared/domain/repository/person-interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateClientDTO } from '../dto/create-client.dto';
import { IClientRepository } from '../../domain/repository/client.interface.repository';

export class CreateClientUseCase implements BaseUseCase<any, any> {

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
    // @Inject('RABBIT_MQ')
    // private readonly rabbitQueue: RabbitMQMananger
  ) { }

  async execute(data: CreateClientDTO) {
    try {
      const clientCreated = await this.connection().tx('Create Client Person', async (transaction) => {
        const person = await this.personRepository.create({ client: 1, ...data.pessoa }, transaction);

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

        await this.clientRepository.create({ pessoaId: person.id, ...data.cliente }, transaction);
        // await this.employeeRepository.create({ pessoaId: person.id, ...data.colaborador }, transaction);
        
        return person;
      });

      if (data.createUser)
        console.log('Creating user for client:', clientCreated.nome);
      //   this.rabbitQueue.publish('employee_exchange', 'employee.created', JSON.stringify({
      //     id: employee.id,
      //     personId: employee.personId,
      //     name: data.pessoa.nome,
      //     email: data.pessoa.email,
      //   }));
      console.log('Client created successfully:', clientCreated);
      return clientCreated;
    } catch (error) {
      console.log(error)
    }
  }
}
