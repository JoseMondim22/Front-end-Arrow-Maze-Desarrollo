import { ILevelRepository } from '../../../domain/level/ILevelRepository';
import { Level } from '../../../domain/level/Level';
import { IQueryService } from '../../cqs/IQueryService';
import { GetLevelsQuery } from './GetLevelsQuery';

/** Lists every level through ILevelRepository. No filtering, no domain logic to add. */
export class GetLevelsUseCase implements IQueryService<GetLevelsQuery, Level[]> {
  constructor(private readonly levelRepository: ILevelRepository) {}

  async execute(_query: GetLevelsQuery): Promise<Level[]> {
    return this.levelRepository.findAll();
  }
}
