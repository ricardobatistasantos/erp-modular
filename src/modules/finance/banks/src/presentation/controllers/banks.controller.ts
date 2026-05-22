import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateBankUseCase } from '../../application/use-cases/create-bank.use-case';
import { GetByIdBankUseCase } from '../../application/use-cases/get-by-id-bank.use-case';
import { FindAllBanksUseCase } from '../../application/use-cases/find-all-banks.use-case';
import { UpdateBankUseCase } from '../../application/use-cases/update-bank.use-case';
import { DeleteBankUseCase } from '../../application/use-cases/delete-bank.use-case';
import { CreateBankDTO } from '../../application/dto/create-bank.dto';
import { UpdateBankDTO } from '../../application/dto/update-bank.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('banks')
export class BanksController {
  constructor(
    private readonly createBankUseCase: CreateBankUseCase,
    private readonly getByIdBankUseCase: GetByIdBankUseCase,
    private readonly findAllBanksUseCase: FindAllBanksUseCase,
    private readonly updateBankUseCase: UpdateBankUseCase,
    private readonly deleteBankUseCase: DeleteBankUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateBankDTO) {
    return this.createBankUseCase.execute(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllBanksUseCase.execute(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.getByIdBankUseCase.execute({ id });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBankDTO) {
    return this.updateBankUseCase.execute({ id, data: dto });
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteBankUseCase.execute({ id });
  }
}
