import { Inject } from '@nestjs/common';

// import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
// import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IPersonRepository } from '@person/shared/domain/repository/person-interface.repository';
// import { IEmployeeRepository } from '../../domain/repository/enployee.interface.repository';
// import { RabbitMQMananger } from 'src/infra/queue/rabbit-mq-manager';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateEmployeeDTO } from '../dto/create-employee.dto';
import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
import { IContactRepository } from '@person/shared/domain/repository/person-contact-interface.repository';
import { IAddressRepository } from '@person/shared/domain/repository/person-address-interface.repository';
import { IEmployeeRepository } from '../../domain/repository/enployee.interface.repository';

export class CreateEmployeeUseCase implements BaseUseCase<CreateEmployeeDTO, any> {

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
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    // @Inject('RABBIT_MQ')
    // private readonly rabbitQueue: RabbitMQMananger
  ) { }

  async execute(data: CreateEmployeeDTO) {
    try {
      const result = await this.connection().tx('Create Employee Person', async (transaction) => {
        const person = await this.personRepository.create(data.pessoa, transaction);

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

        await this.employeeRepository.create({ pessoaId: person.id, ...data.colaborador }, transaction);

        return person;
      });

      if (data.createUser)
        console.log('Creating user for employee:', result.nome);
      //   this.rabbitQueue.publish('employee_exchange', 'employee.created', JSON.stringify({
      //     id: employee.id,
      //     personId: employee.personId,
      //     name: data.pessoa.nome,
      //     email: data.pessoa.email,
      //     cargo: employee.cargo,
      //     departamento: employee.departamento
      //   }));
      console.log('Employee created successfully:', result);
      return result;
    } catch (error) {
      console.log(error)
    }
  }
}
