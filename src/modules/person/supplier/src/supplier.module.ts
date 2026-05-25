import { Module } from '@nestjs/common';
import { SupplierController } from './presentation/controllers/supplier.controller';
import { CreateSupplierUseCase } from './application/use-cases/create-supplier.use-case';
import { GetByIdSupplierUseCase } from './application/use-cases/get-by-id-supplier.use-case';
import { FindAllSuppliersUseCase } from './application/use-cases/find-all-suppliers.use-case';
import { UpdateSupplierUseCase } from './application/use-cases/update-supplier.use-case';
import { DeleteSupplierUseCase } from './application/use-cases/delete-supplier.use-case';
import { AddressRepository } from '@person/shared/infra/repository/person-address.repository';
import { ContactRepository } from '@person/shared/infra/repository/person-contact.repository';
import { PersonJuridicaRepository } from '@person/shared/infra/repository/person-juridica.repository';
import { PersonFisicaRepository } from '@person/shared/infra/repository/person-fisica.repository';
import { PersonRepository } from '@person/shared/infra/repository/person.repository';
import { SupplierRepository } from './infra/repository/supplier.repository';

@Module({
  imports: [],
  controllers: [SupplierController],
  providers: [
    {
      provide: 'ISupplierRepository',
      useClass: SupplierRepository,
    },
    {
      provide: 'IPersonRepository',
      useClass: PersonRepository,
    },
    {
      provide: 'IPersonFisicaRepository',
      useClass: PersonFisicaRepository,
    },
    {
      provide: 'IPersonJuridicaRepository',
      useClass: PersonJuridicaRepository,
    },
    {
      provide: 'IContactRepository',
      useClass: ContactRepository,
    },
    {
      provide: 'IAddressRepository',
      useClass: AddressRepository,
    },
    CreateSupplierUseCase,
    GetByIdSupplierUseCase,
    FindAllSuppliersUseCase,
    UpdateSupplierUseCase,
    DeleteSupplierUseCase,
  ],
})
export class SupplierModule {}
