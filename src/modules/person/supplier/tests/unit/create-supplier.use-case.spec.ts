import { CreateSupplierUseCase } from '../../src/application/use-cases/create-supplier.use-case';
import { IPersonRepository } from '@person/shared/domain/repository/person-interface.repository';
import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
import { IContactRepository } from '@person/shared/domain/repository/person-contact-interface.repository';
import { IAddressRepository } from '@person/shared/domain/repository/person-address-interface.repository';
import { ISupplierRepository } from '../../src/domain/repository/supplier.interface.repository';

describe('CreateSupplierUseCase', () => {
  let useCase: CreateSupplierUseCase;
  let personRepository: jest.Mocked<IPersonRepository>;
  let personFisicaRepository: jest.Mocked<IPersonFisicaRepository>;
  let personJuridicaRepository: jest.Mocked<IPersonJuridicaRepository>;
  let contactRepository: jest.Mocked<IContactRepository>;
  let addressRepository: jest.Mocked<IAddressRepository>;
  let supplierRepository: jest.Mocked<ISupplierRepository>;
  let mockTransaction: any;
  let mockConnection: any;

  beforeEach(() => {
    personRepository = {
      create: jest.fn(),
      update: jest.fn(),
    };

    personFisicaRepository = {
      create: jest.fn(),
      update: jest.fn(),
    };

    personJuridicaRepository = {
      create: jest.fn(),
      update: jest.fn(),
    };

    contactRepository = {
      create: jest.fn(),
      deleteByPessoaId: jest.fn(),
    };

    addressRepository = {
      create: jest.fn(),
      deleteByPessoaId: jest.fn(),
    };

    supplierRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTransaction = {};
    mockConnection = jest.fn().mockReturnValue({
      tx: jest.fn((_name, callback) => callback(mockTransaction)),
    });

    useCase = new CreateSupplierUseCase(
      mockConnection,
      personRepository,
      personFisicaRepository,
      personJuridicaRepository,
      contactRepository,
      addressRepository,
      supplierRepository,
    );
  });

  it('should call personRepository.create with fornecedor: 1 flag', async () => {
    const input = {
      pessoa: {
        nome: 'Fornecedor Teste',
        tipo: 'F' as const,
      },
      fornecedor: {
        categoria: 'Materiais',
        prazoEntregaDias: 15,
      },
    };

    const createdPerson = { id: 'person-uuid-1', nome: 'Fornecedor Teste', tipo: 'F' };
    personRepository.create.mockResolvedValue(createdPerson);
    supplierRepository.create.mockResolvedValue({ id: 'supplier-uuid-1', personId: 'person-uuid-1', categoria: 'Materiais', prazoEntregaDias: 15 });

    await useCase.execute(input);

    expect(personRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ fornecedor: 1 }),
      mockTransaction,
    );
  });

  it('should create personFisica when tipo="F" and fisica provided', async () => {
    const input = {
      pessoa: {
        nome: 'Fornecedor PF',
        tipo: 'F' as const,
        fisica: { cpf: '12345678901', rg: '123456789' },
      },
      fornecedor: {
        categoria: 'Serviços',
      },
    };

    const createdPerson = { id: 'person-uuid-2', nome: 'Fornecedor PF', tipo: 'F' };
    personRepository.create.mockResolvedValue(createdPerson);
    personFisicaRepository.create.mockResolvedValue({});
    supplierRepository.create.mockResolvedValue({ id: 'supplier-uuid-2', personId: 'person-uuid-2', categoria: 'Serviços' });

    await useCase.execute(input);

    expect(personFisicaRepository.create).toHaveBeenCalledWith(
      { pessoaId: 'person-uuid-2', cpf: '12345678901', rg: '123456789' },
      mockTransaction,
    );
  });

  it('should create personJuridica when tipo="J" and juridica provided', async () => {
    const input = {
      pessoa: {
        nome: 'Fornecedor PJ',
        tipo: 'J' as const,
        juridica: { cnpj: '12345678000199', razaoSocial: 'Empresa LTDA' },
      },
      fornecedor: {
        categoria: 'Tecnologia',
        prazoEntregaDias: 30,
      },
    };

    const createdPerson = { id: 'person-uuid-3', nome: 'Fornecedor PJ', tipo: 'J' };
    personRepository.create.mockResolvedValue(createdPerson);
    personJuridicaRepository.create.mockResolvedValue({});
    supplierRepository.create.mockResolvedValue({ id: 'supplier-uuid-3', personId: 'person-uuid-3', categoria: 'Tecnologia', prazoEntregaDias: 30 });

    await useCase.execute(input);

    expect(personJuridicaRepository.create).toHaveBeenCalledWith(
      { pessoaId: 'person-uuid-3', cnpj: '12345678000199', razaoSocial: 'Empresa LTDA' },
      mockTransaction,
    );
  });

  it('should create contacts and addresses when provided', async () => {
    const input = {
      pessoa: {
        nome: 'Fornecedor Completo',
        tipo: 'F' as const,
        contatos: [
          { tipo: 'celular', telefone: '11999999999' },
          { tipo: 'comercial', telefone: '1133334444' },
        ],
        enderecos: [
          { logradouro: 'Rua A', numero: 100, bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', cep: '01000-000', tipoEndereco: 'comercial' },
        ],
      },
      fornecedor: {
        categoria: 'Alimentos',
      },
    };

    const createdPerson = { id: 'person-uuid-4', nome: 'Fornecedor Completo', tipo: 'F' };
    personRepository.create.mockResolvedValue(createdPerson);
    contactRepository.create.mockResolvedValue({});
    addressRepository.create.mockResolvedValue({});
    supplierRepository.create.mockResolvedValue({ id: 'supplier-uuid-4', personId: 'person-uuid-4', categoria: 'Alimentos' });

    await useCase.execute(input);

    expect(contactRepository.create).toHaveBeenCalledTimes(2);
    expect(contactRepository.create).toHaveBeenCalledWith(
      { pessoaId: 'person-uuid-4', tipo: 'celular', telefone: '11999999999' },
      mockTransaction,
    );
    expect(contactRepository.create).toHaveBeenCalledWith(
      { pessoaId: 'person-uuid-4', tipo: 'comercial', telefone: '1133334444' },
      mockTransaction,
    );

    expect(addressRepository.create).toHaveBeenCalledTimes(1);
    expect(addressRepository.create).toHaveBeenCalledWith(
      { pessoaId: 'person-uuid-4', logradouro: 'Rua A', numero: 100, bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', cep: '01000-000', tipoEndereco: 'comercial' },
      mockTransaction,
    );
  });

  it('should call supplierRepository.create with supplier-specific fields', async () => {
    const input = {
      pessoa: {
        nome: 'Fornecedor Campos',
        tipo: 'J' as const,
      },
      fornecedor: {
        categoria: 'Eletrônicos',
        prazoEntregaDias: 45,
      },
    };

    const createdPerson = { id: 'person-uuid-5', nome: 'Fornecedor Campos', tipo: 'J' };
    personRepository.create.mockResolvedValue(createdPerson);
    supplierRepository.create.mockResolvedValue({ id: 'supplier-uuid-5', personId: 'person-uuid-5', categoria: 'Eletrônicos', prazoEntregaDias: 45 });

    await useCase.execute(input);

    expect(supplierRepository.create).toHaveBeenCalledWith(
      { pessoa_id: 'person-uuid-5', categoria: 'Eletrônicos', prazoEntregaDias: 45 },
      mockTransaction,
    );
  });

  it('should execute all operations within the same transaction', async () => {
    const input = {
      pessoa: {
        nome: 'Fornecedor Transação',
        tipo: 'F' as const,
        fisica: { cpf: '99988877766' },
        contatos: [{ tipo: 'celular', telefone: '11888888888' }],
        enderecos: [{ logradouro: 'Rua B', numero: 200, bairro: 'Centro', cidade: 'Rio', uf: 'RJ', cep: '20000-000', tipoEndereco: 'residencial' }],
      },
      fornecedor: {
        categoria: 'Logística',
        prazoEntregaDias: 7,
      },
    };

    const createdPerson = { id: 'person-uuid-6', nome: 'Fornecedor Transação', tipo: 'F' };
    personRepository.create.mockResolvedValue(createdPerson);
    personFisicaRepository.create.mockResolvedValue({});
    contactRepository.create.mockResolvedValue({});
    addressRepository.create.mockResolvedValue({});
    supplierRepository.create.mockResolvedValue({ id: 'supplier-uuid-6', personId: 'person-uuid-6', categoria: 'Logística', prazoEntregaDias: 7 });

    await useCase.execute(input);

    // Verify the connection().tx was called (transaction was used)
    const connectionResult = mockConnection();
    expect(connectionResult.tx).toHaveBeenCalledWith('Create Supplier Person', expect.any(Function));

    // Verify all repository calls received the same transaction object
    expect(personRepository.create).toHaveBeenCalledWith(
      expect.anything(),
      mockTransaction,
    );
    expect(personFisicaRepository.create).toHaveBeenCalledWith(
      expect.anything(),
      mockTransaction,
    );
    expect(contactRepository.create).toHaveBeenCalledWith(
      expect.anything(),
      mockTransaction,
    );
    expect(addressRepository.create).toHaveBeenCalledWith(
      expect.anything(),
      mockTransaction,
    );
    expect(supplierRepository.create).toHaveBeenCalledWith(
      expect.anything(),
      mockTransaction,
    );
  });

  it('should not call personFisicaRepository when tipo="F" but fisica not provided', async () => {
    const input = {
      pessoa: {
        nome: 'Fornecedor Sem Fisica',
        tipo: 'F' as const,
      },
      fornecedor: {
        categoria: 'Geral',
      },
    };

    const createdPerson = { id: 'person-uuid-7', nome: 'Fornecedor Sem Fisica', tipo: 'F' };
    personRepository.create.mockResolvedValue(createdPerson);
    supplierRepository.create.mockResolvedValue({ id: 'supplier-uuid-7', personId: 'person-uuid-7', categoria: 'Geral' });

    await useCase.execute(input);

    expect(personFisicaRepository.create).not.toHaveBeenCalled();
  });

  it('should not call personJuridicaRepository when tipo="J" but juridica not provided', async () => {
    const input = {
      pessoa: {
        nome: 'Fornecedor Sem Juridica',
        tipo: 'J' as const,
      },
      fornecedor: {
        prazoEntregaDias: 20,
      },
    };

    const createdPerson = { id: 'person-uuid-8', nome: 'Fornecedor Sem Juridica', tipo: 'J' };
    personRepository.create.mockResolvedValue(createdPerson);
    supplierRepository.create.mockResolvedValue({ id: 'supplier-uuid-8', personId: 'person-uuid-8', prazoEntregaDias: 20 });

    await useCase.execute(input);

    expect(personJuridicaRepository.create).not.toHaveBeenCalled();
  });
});
