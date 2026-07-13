import { IPlayerProgressRepository } from '../../../domain/player-progress/IPlayerProgressRepository';
import { PlayerProgress } from '../../../domain/player-progress/PlayerProgress';
import { IQueryService } from '../../cqs/IQueryService';
import { LoadPlayerProgressQuery } from './LoadPlayerProgressQuery';

/** Loads the player's full local progress. Pure delegation to IPlayerProgressRepository. */
export class LoadPlayerProgressUseCase
  implements IQueryService<LoadPlayerProgressQuery, PlayerProgress>
{
  constructor(private readonly playerProgressRepository: IPlayerProgressRepository) {}

  async execute(_query: LoadPlayerProgressQuery): Promise<PlayerProgress> {
    return this.playerProgressRepository.load();
  }
}
