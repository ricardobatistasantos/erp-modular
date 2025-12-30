import { Module } from '@nestjs/common';
import { TransporterController } from './presentation/controllers/transporter.controller';
import { CreateTransporterUseCase } from './application/use-cases/create-transporter.use-case';
import { GetByIdTransporterUseCase } from './application/use-cases/get-by-id-transporter.use-case';

@Module({
  imports: [],
  controllers: [TransporterController],
  providers: [CreateTransporterUseCase, GetByIdTransporterUseCase],
})
export class TransporterModule {}
