import { ILevelRepository } from '../../../domain/level/ILevelRepository';
import { Level } from '../../../domain/level/Level';
import { IQueryService } from '../../cqs/IQueryService';
import { GetLevelsQuery } from './GetLevelsQuery';

/**
 * Lists every level through ILevelRepository, sorted by progression order.
 * The backend returns rows in whatever order the database happens to give
 * them, not by LevelOrder — LevelSelectScreen just renders this array
 * top-to-bottom, so ordering has to be enforced here, once, for every caller.
 */
export class GetLevelsUseCase implements IQueryService<GetLevelsQuery, Level[]> {
  constructor(private readonly levelRepository: ILevelRepository) {}

  async execute(_query: GetLevelsQuery): Promise<Level[]> {
    const levels = await this.levelRepository.findAll();
    return [...levels].sort((a, b) => a.order.sequence - b.order.sequence);
  }
}
