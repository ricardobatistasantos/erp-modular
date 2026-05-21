import { Inject, NotFoundException } from '@nestjs/common';

import { IPersonRepository } from '@person/shared/domain/repository/person-interface.repository';
import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
import { IContactRepository } from '@person/shared/domain/repository/person-contact-interface.repository';
import { IAddressRepository } from '@person/shared/domain/repository/person-address-interface.repository';
import { IEmployeeRepository } from '../../domain/repository/enployee.interface.repository';
import { IJobPositionRepository } from '../../domain/repository/job-position.interface.repository';
import { IDepartmentRepository } from '../../domain/repository/department.interface.repository';
import { ISalesProfileRepository } from '../../domain/repository/sales-profile.interface.repository';
import { BaseUseCase } from '../../domain/use-case/base.use-case';
import { UpdateEmployeeDTO } from '../dto/update-employee.dto';

export class UpdateEmployeeUseCase implements BaseUseCase<any, any> {

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
    @Inject('IJobPositionRepository')
    private readonly jobPositionRepository: IJobPositionRepository,
    @Inject('IDepartmentRepository')
    private readonly departmentRepository: IDepartmentRepository,
    @Inject('ISalesProfileRepository')
    private readonly salesProfileRepository: ISalesProfileRepository,
  ) {}

  async execute(data: { id: string; updateData: UpdateEmployeeDTO }): Promise<any> {
    const employee = await this.employeeRepository.findById(data.id);

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    const pessoaId = employee.pessoa_id;
    const updateData = data.updateData;

    await this.connection().tx('Update Employee', async (transaction) => {
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

      if (updateData.colaborador) {
        const colaboradorUpdateData: any = {
          matricula: updateData.colaborador.matricula || null,
        };

        // Upsert cargo
        if (updateData.colaborador.cargo) {
          if (employee.cargo_id) {
            await this.jobPositionRepository.update(employee.cargo_id, updateData.colaborador.cargo, transaction);
            colaboradorUpdateData.cargoId = employee.cargo_id;
          } else {
            const novoCargo = await this.jobPositionRepository.create(updateData.colaborador.cargo, transaction);
            colaboradorUpdateData.cargoId = novoCargo.id;
          }
        }

        // Upsert departamento
        if (updateData.colaborador.departamento) {
          if (employee.departamento_id) {
            await this.departmentRepository.update(employee.departamento_id, updateData.colaborador.departamento, transaction);
            colaboradorUpdateData.departamentoId = employee.departamento_id;
          } else {
            const novoDepartamento = await this.departmentRepository.create(updateData.colaborador.departamento, transaction);
            colaboradorUpdateData.departamentoId = novoDepartamento.id;
          }
        }

        await this.employeeRepository.update(data.id, colaboradorUpdateData, transaction);

        // Upsert vendedor
        if (updateData.colaborador.vendedor) {
          const vendedorExistente = await this.salesProfileRepository.findByColaboradorId(data.id, transaction);

          if (vendedorExistente) {
            await this.salesProfileRepository.update(data.id, {
              comissao: updateData.colaborador.vendedor.comissao,
              metaVenda: updateData.colaborador.vendedor.metaVendas,
            }, transaction);
          } else {
            await this.salesProfileRepository.create({
              colaboradorId: data.id,
              comissao: updateData.colaborador.vendedor.comissao,
              metaVenda: updateData.colaborador.vendedor.metaVendas,
            }, transaction);
          }
        }
      }
    });

    return this.employeeRepository.findById(data.id);
  }
}
