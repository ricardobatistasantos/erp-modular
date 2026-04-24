import { Inject } from '@nestjs/common';

import { IEmployeeRepository } from '../../domain/repository/enployee.interface.repository';
import { RabbitMQMananger } from 'src/infra/queue/rabbit-mq-manager';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { CreateEmployeeDTO } from '../dto/create-employee.dto';

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
    @Inject('ISallesRepository')
    private readonly sallesRepository: ISallesRepository,
    @Inject('RABBIT_MQ')
    private readonly rabbitQueue: RabbitMQMananger
  ) { }

  async execute(data: CreateEmployeeDTO) {
    return this.connection().tx('Create Employee Person', async (transaction) => {
      const person = await this.personRepository.create(data.pessoa, transaction);

      if (data.pessoa.tipo === 'F' && data.pessoa.fisica)
        await this.personFisicaRepository.create(data.pessoa.fisica, transaction);

      if (data.pessoa.tipo === 'J' && data.pessoa.juridica)
        await this.personJuridicaRepository.create(data.pessoa.juridica, transaction);

      data.pessoa.contatos?.map(async contato =>
        await this.contactRepository.create(contato, transaction));

      data.pessoa.enderecos?.map(async endereco =>
        await this.addressRepository.create(endereco, transaction));

      const employee = await this.employeeRepository.create(data.colaborador, transaction);

      if (data.colaborador.vendedor)
        await this.sallesRepository.create(data.colaborador.vendedor, transaction);

      if (data.createUser)
        this.rabbitQueue.publish('employee_exchange', 'employee.created', JSON.stringify({
          id: employee.id,
          personId: employee.personId,
          name: data.pessoa.nome,
          email: data.pessoa.email,
          cargo: employee.cargo,
          departamento: employee.departamento
        }));

      return employee;
    });
  }
}
