import { Module } from '@nestjs/common';
import { ClientController } from './presentation/controllers/client.controller';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { GetByIdClientUseCase } from './application/use-cases/get-by-id-client.use-case';
import { FindAllClientsUseCase } from './application/use-cases/find-all-clients.use-case';
import { UpdateClientUseCase } from './application/use-cases/update-client.use-case';
import { DeleteClientUseCase } from './application/use-cases/delete-client.use-case';
import { AddressRepository } from '@person/shared/infra/repository/person-address.repository';
import { ContactRepository } from '@person/shared/infra/repository/person-contact.repository';
import { PersonJuridicaRepository } from '@person/shared/infra/repository/person-juridica.repository';
import { PersonFisicaRepository } from '@person/shared/infra/repository/person-fisica.repository';
import { PersonRepository } from '@person/shared/infra/repository/person.repository';
import { ClientRepository } from './infra/repository/client.repository';

@Module({
  imports: [],
  controllers: [ClientController],
  providers: [
    {
      provide: 'IClientRepository',
      useClass: ClientRepository,
    },
    {
      provide: 'IPersonRepository',
      useClass: PersonRepository
    },
    {
      provide: 'IPersonFisicaRepository',
      useClass: PersonFisicaRepository
    },
    {
      provide: 'IPersonJuridicaRepository',
      useClass: PersonJuridicaRepository
    },
    {
      provide: 'IContactRepository',
      useClass: ContactRepository
    },
    {
      provide: 'IAddressRepository',
      useClass: AddressRepository
    },
    CreateClientUseCase,
    GetByIdClientUseCase,
    FindAllClientsUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
  ],
})
export class ClientModule { }
