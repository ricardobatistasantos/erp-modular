import { NotFoundException } from '@nestjs/common';
import { UpdateSupplierUseCase } from '../../src/application/use-cases/update-supplier.use-case';
import { ISupplierRepository } from '../../src/domain/repository/supplier.interface.repository';
import { IPersonRepository } from '@person/shared/domain/repository/person-interface.repository';
import { IPersonFisicaRepository } from '@person/shared/domain/repository/person-fisica-interface.repository';
import { IPersonJuridicaRepository } from '@person/shared/domain/repository/person-juridica-interface.repository';
import { IContactRepository } from '@person/shared/domain/repository/person-contact-interface.repository';
import { IAddressRepository } from '@person/shared/domain/repository/person-address-interface.repository';

describe('UpdateSupplierUseCase', () => {
  let useCase: UpdateSupplierUseCase;
  let supplierRepository: jest.Mocked<ISupplierRepository>;
  let personRepository: jest.Mocked<IPersonRepository>;
  let personFisicaRepository: jest.Mocked<IPersonFisicaRepository>;
  let personJuridicaRepository: jest.Mocked<IPersonJuridicaRepository>;
  let contactRepository: jest.Mocked<IContactRepository>;
  let addressRepository: jest.Mocked<IAddressRepository>;
  let mockConnection: jest.Mock;
  let mockTransaction: object;

  beforeEach(() => {
    mockTransaction = {};

    supplierRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

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

    mockConnection = jest.fn().mockReturnValue({
      tx: jest.fn((_name: string, callback: (t: any) => Promise<any>) =>
        callback(mockTransaction),
      ),
    });

    useCase = new UpdateSupplierUseCase(
      mockConnection,
      personRepository,
      personFisicaRepository,
      personJuridicaRepository,
      contactRepository,
      addressRepository,
      supplierRepository,
    );
  });

  it('should throw NotFoundException when supplier not found', async () => {
    supplierRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'non-existent-id',
        updateData: { fornecedor: { categoria: 'Test' } },
      }),
    ).rejects.toThrow(new NotFoundException('Fornecedor não encontrado'));

    expect(supplierRepository.findById).toHaveBeenCalledWith('non-existent-id');
    expect(mockConnection).not.toHaveBeenCalled();
  });

  it('should update person fields within transaction', async () => {
    const supplierId = 'supplier-uuid';
    const pessoaId = 'pessoa-uuid';

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Materiais',
      prazo_entrega_dias: 10,
    });

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Materiais',
      prazo_entrega_dias: 10,
      nome: 'Fornecedor Atualizado',
      email: 'novo@email.com',
    });

    personRepository.update.mockResolvedValue(undefined);

    const updateData = {
      pessoa: {
        nome: 'Fornecedor Atualizado',
        email: 'novo@email.com',
        tipo: 'F' as const,
      },
    };

    const result = await useCase.execute({ id: supplierId, updateData });

    expect(personRepository.update).toHaveBeenCalledWith(
      pessoaId,
      updateData.pessoa,
      mockTransaction,
    );
    expect(result).toEqual(
      expect.objectContaining({ id: supplierId, pessoa_id: pessoaId }),
    );
  });

  it('should delete and recreate contacts when provided', async () => {
    const supplierId = 'supplier-uuid';
    const pessoaId = 'pessoa-uuid';

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Serviços',
      prazo_entrega_dias: 5,
    });

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Serviços',
      prazo_entrega_dias: 5,
    });

    personRepository.update.mockResolvedValue(undefined);
    contactRepository.deleteByPessoaId.mockResolvedValue(undefined);
    contactRepository.create.mockResolvedValue(undefined);

    const contatos = [
      { tipo: 'celular', telefone: '11999999999' },
      { tipo: 'comercial', telefone: '1133334444' },
    ];

    const updateData = {
      pessoa: {
        nome: 'Fornecedor',
        tipo: 'J' as const,
        contatos,
      },
    };

    await useCase.execute({ id: supplierId, updateData });

    expect(contactRepository.deleteByPessoaId).toHaveBeenCalledWith(
      pessoaId,
      mockTransaction,
    );
    expect(contactRepository.create).toHaveBeenCalledTimes(2);
    expect(contactRepository.create).toHaveBeenCalledWith(
      { pessoaId, ...contatos[0] },
      mockTransaction,
    );
    expect(contactRepository.create).toHaveBeenCalledWith(
      { pessoaId, ...contatos[1] },
      mockTransaction,
    );
  });

  it('should delete and recreate addresses when provided', async () => {
    const supplierId = 'supplier-uuid';
    const pessoaId = 'pessoa-uuid';

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Logística',
      prazo_entrega_dias: 15,
    });

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Logística',
      prazo_entrega_dias: 15,
    });

    personRepository.update.mockResolvedValue(undefined);
    addressRepository.deleteByPessoaId.mockResolvedValue(undefined);
    addressRepository.create.mockResolvedValue(undefined);

    const enderecos = [
      { logradouro: 'Rua A', numero: 100, bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', cep: '01000-000', tipoEndereco: 'comercial' },
      { logradouro: 'Rua B', numero: 200, bairro: 'Jardim', cidade: 'Rio de Janeiro', uf: 'RJ', cep: '20000-000', tipoEndereco: 'entrega' },
    ];

    const updateData = {
      pessoa: {
        nome: 'Fornecedor Logística',
        tipo: 'J' as const,
        enderecos,
      },
    };

    await useCase.execute({ id: supplierId, updateData });

    expect(addressRepository.deleteByPessoaId).toHaveBeenCalledWith(
      pessoaId,
      mockTransaction,
    );
    expect(addressRepository.create).toHaveBeenCalledTimes(2);
    expect(addressRepository.create).toHaveBeenCalledWith(
      { pessoaId, ...enderecos[0] },
      mockTransaction,
    );
    expect(addressRepository.create).toHaveBeenCalledWith(
      { pessoaId, ...enderecos[1] },
      mockTransaction,
    );
  });

  it('should update supplier-specific fields', async () => {
    const supplierId = 'supplier-uuid';
    const pessoaId = 'pessoa-uuid';

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Materiais',
      prazo_entrega_dias: 10,
    });

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Eletrônicos',
      prazo_entrega_dias: 30,
    });

    supplierRepository.update.mockResolvedValue(undefined);

    const updateData = {
      fornecedor: {
        categoria: 'Eletrônicos',
        prazoEntregaDias: 30,
      },
    };

    await useCase.execute({ id: supplierId, updateData });

    expect(supplierRepository.update).toHaveBeenCalledWith(
      supplierId,
      updateData.fornecedor,
      mockTransaction,
    );
  });

  it('should return full updated record', async () => {
    const supplierId = 'supplier-uuid';
    const pessoaId = 'pessoa-uuid';

    const fullRecord = {
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Alimentos',
      prazo_entrega_dias: 7,
      nome: 'Fornecedor Alimentos LTDA',
      email: 'contato@alimentos.com',
      tipo: 'J',
    };

    supplierRepository.findById.mockResolvedValueOnce({
      id: supplierId,
      pessoa_id: pessoaId,
      categoria: 'Materiais',
      prazo_entrega_dias: 10,
    });

    supplierRepository.findById.mockResolvedValueOnce(fullRecord);

    supplierRepository.update.mockResolvedValue(undefined);

    const updateData = {
      fornecedor: {
        categoria: 'Alimentos',
        prazoEntregaDias: 7,
      },
    };

    const result = await useCase.execute({ id: supplierId, updateData });

    expect(result).toEqual(fullRecord);
    // findById is called twice: once to check existence, once after transaction
    expect(supplierRepository.findById).toHaveBeenCalledTimes(2);
    expect(supplierRepository.findById).toHaveBeenLastCalledWith(supplierId);
  });
});
