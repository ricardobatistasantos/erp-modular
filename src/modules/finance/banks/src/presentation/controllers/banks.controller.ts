import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateBanksUseCase } from '../../application/use-cases/create-banks.use-case';
import { GetByIdBanksUseCase } from '../../application/use-cases/get-by-id-banks.use-case';

@Controller('banks')
export class BanksController {
  constructor(
    private readonly createBanksUseCase: CreateBanksUseCase,
    private readonly getByIdBanksUseCase: GetByIdBanksUseCase,
  ) {}

  @Get(':id')
  getBanksById() {
    return this.getByIdBanksUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All Bankss';
  }

  @Post()
  create(@Body() createBanksDto: any) {
    return this.createBanksUseCase.execute(createBanksDto);
  }

  @Put()
  updateBanks(@Body() createBanksDto: any) {
    return createBanksDto;
  }
}
