import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { GetByIdClientUseCase } from '../../application/use-cases/get-by-id-client.use-case';
import { CreateClientUseCase } from '../../application/use-cases/create-client.use-case';
import { CreateClientDTO } from '../../application/dto/create-client.dto';

@Controller('client')
export class ClientController {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly getByIdClientUseCase: GetByIdClientUseCase,
  ) {}

  @Get(':id')
  getClientById() {
    return this.getByIdClientUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All clients';
  }

  @Post()
  create(@Body() createClientDto: CreateClientDTO) {
    return this.createClientUseCase.execute(createClientDto);
  }

  @Put()
  updateClient(@Body() createClientDto: any) {
    return createClientDto;
  }
}
