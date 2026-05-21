import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { GetByIdClientUseCase } from '../../application/use-cases/get-by-id-client.use-case';
import { CreateClientUseCase } from '../../application/use-cases/create-client.use-case';
import { FindAllClientsUseCase } from '../../application/use-cases/find-all-clients.use-case';
import { UpdateClientUseCase } from '../../application/use-cases/update-client.use-case';
import { DeleteClientUseCase } from '../../application/use-cases/delete-client.use-case';
import { CreateClientDTO } from '../../application/dto/create-client.dto';
import { UpdateClientDTO } from '../../application/dto/update-client.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('client')
export class ClientController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly getByIdClientUseCase: GetByIdClientUseCase,
    private readonly findAllClientsUseCase: FindAllClientsUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
  ) {}

  @Get(':id')
  getClientById(@Param('id') id: string) {
    return this.getByIdClientUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllClientsUseCase.execute(query);
  }

  @Post()
  create(@Body() createClientDto: CreateClientDTO) {
    return this.createClientUseCase.execute(createClientDto);
  }

  @Put(':id')
  updateClient(@Param('id') id: string, @Body() updateClientDto: UpdateClientDTO) {
    return this.updateClientUseCase.execute({ id, updateData: updateClientDto });
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteClient(@Param('id') id: string): Promise<void> {
    await this.deleteClientUseCase.execute({ id });
  }
}
