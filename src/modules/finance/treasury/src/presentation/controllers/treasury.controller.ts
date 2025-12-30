import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateTreasuryUseCase } from '../../application/use-cases/create-treasury.use-case';
import { GetByIdTreasuryUseCase } from '../../application/use-cases/get-by-id-treasury.use-case';

@Controller('treasury')
export class TreasuryController {
  constructor(
    private readonly createTreasuryUseCase: CreateTreasuryUseCase,
    private readonly getByIdTreasuryUseCase: GetByIdTreasuryUseCase,
  ) {}

  @Get(':id')
  getTreasuryById() {
    return this.getByIdTreasuryUseCase.execute({ id: 'some-id' });
  }

  @Get()
  findAll() {
    return 'All Treasurys';
  }

  @Post()
  create(@Body() createTreasuryDto: any) {
    return this.createTreasuryUseCase.execute(createTreasuryDto);
  }

  @Put()
  updateTreasury(@Body() createTreasuryDto: any) {
    return createTreasuryDto;
  }
}
