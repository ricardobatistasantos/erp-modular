import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { GetByIdSupplierUseCase } from '../../application/use-cases/get-by-id-supplier.use-case';
import { CreateSupplierUseCase } from '../../application/use-cases/create-supplier.use-case';
import { FindAllSuppliersUseCase } from '../../application/use-cases/find-all-suppliers.use-case';
import { UpdateSupplierUseCase } from '../../application/use-cases/update-supplier.use-case';
import { DeleteSupplierUseCase } from '../../application/use-cases/delete-supplier.use-case';
import { CreateSupplierDTO } from '../../application/dto/create-supplier.dto';
import { UpdateSupplierDTO } from '../../application/dto/update-supplier.dto';
import { PaginationQueryDTO } from '../../application/dto/pagination-query.dto';

@Controller('supplier')
export class SupplierController {
  constructor(
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly getByIdSupplierUseCase: GetByIdSupplierUseCase,
    private readonly findAllSuppliersUseCase: FindAllSuppliersUseCase,
    private readonly updateSupplierUseCase: UpdateSupplierUseCase,
    private readonly deleteSupplierUseCase: DeleteSupplierUseCase,
  ) {}

  @Get(':id')
  getSupplierById(@Param('id') id: string) {
    return this.getByIdSupplierUseCase.execute({ id });
  }

  @Get()
  findAll(@Query() query: PaginationQueryDTO) {
    return this.findAllSuppliersUseCase.execute(query);
  }

  @Post()
  create(@Body() createSupplierDto: CreateSupplierDTO) {
    return this.createSupplierUseCase.execute(createSupplierDto);
  }

  @Put(':id')
  updateSupplier(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDTO) {
    return this.updateSupplierUseCase.execute({ id, updateData: updateSupplierDto });
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteSupplier(@Param('id') id: string): Promise<void> {
    await this.deleteSupplierUseCase.execute({ id });
  }
}
