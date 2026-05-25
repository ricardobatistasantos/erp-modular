import { UnitOfMeasure } from '../entity/unit-of-measure.entity';
import { CreateUnitOfMeasureDTO } from '../../application/dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDTO } from '../../application/dto/update-unit-of-measure.dto';

export interface IUnitOfMeasureRepository {
  create(data: CreateUnitOfMeasureDTO, transaction?: any): Promise<UnitOfMeasure>;
  findById(id: string): Promise<UnitOfMeasure | null>;
  findAll(page: number, limit: number): Promise<{ data: UnitOfMeasure[]; total: number }>;
  update(id: string, data: UpdateUnitOfMeasureDTO, transaction?: any): Promise<UnitOfMeasure>;
}
