import { GameSession } from '../../../domain/game-session/GameSession';
import { ILevelRepository } from '../../../domain/level/ILevelRepository';
import { ScoringStrategy } from '../../../domain/shared/services/ScoringStrategy';
import { IQueryService } from '../../cqs/IQueryService';
import { StartGameQuery } from './StartGameQuery';

/**
 * Loads a level and spawns a live GameSession from it (Level.startSession). The
 * scoring policy is injected once at the composition root — the domain has no
 * concept of a level choosing its own strategy, so every session in the app uses
 * the same one for now.
 */
export class StartGameUseCase implements IQueryService<StartGameQuery, GameSession> {
  constructor(
    private readonly levelRepository: ILevelRepository,
    private readonly scoring: ScoringStrategy,
  ) {}

  async execute(query: StartGameQuery): Promise<GameSession> {
    const level = await this.levelRepository.findById(query.levelId);
    if (level === null) {
      throw new Error(`Level not found: ${query.levelId.toString()}`);
    }
    return level.startSession(this.scoring);
  }
}
