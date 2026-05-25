import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../../infra/databases/pg-promise/config.module';
import { BrandController } from './presentation/controllers/brand.controller';
import { BrandRepository } from './infra/repository/brand.repository';
import { CreateBrandUseCase } from './application/use-cases/create-brand.use-case';
import { GetByIdBrandUseCase } from './application/use-cases/get-by-id-brand.use-case';
import { FindAllBrandsUseCase } from './application/use-cases/find-all-brands.use-case';
import { UpdateBrandUseCase } from './application/use-cases/update-brand.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [BrandController],
  providers: [
    { provide: 'IBrandRepository', useClass: BrandRepository },
    CreateBrandUseCase,
    GetByIdBrandUseCase,
    FindAllBrandsUseCase,
    UpdateBrandUseCase,
  ],
  exports: [
    'IBrandRepository',
    CreateBrandUseCase,
    GetByIdBrandUseCase,
    FindAllBrandsUseCase,
    UpdateBrandUseCase,
  ],
})
export class BrandModule {}
