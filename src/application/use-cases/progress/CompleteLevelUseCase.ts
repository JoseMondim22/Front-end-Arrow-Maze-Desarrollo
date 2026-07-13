import { IPlayerProgressRepository } from '../../../domain/player-progress/IPlayerProgressRepository';
import { ICommandService } from '../../cqs/ICommandService';
import { IProgressSyncPort } from '../../ports/IProgressSyncPort';
import { CompleteLevelCommand } from './CompleteLevelCommand';

/**
 * Records a level completion locally (offline-first: this must succeed regardless
 * of connectivity) and fires a remote sync. Sync failures are NOT swallowed here —
 * that resilience concern (retry/fallback) belongs to the AOP decorator planned for
 * later, not to ad-hoc error handling duplicated inside the use case.
 */
export class CompleteLevelUseCase implements ICommandService<CompleteLevelCommand> {
  constructor(
    private readonly playerProgressRepository: IPlayerProgressRepository,
    private readonly progressSyncPort: IProgressSyncPort,
  ) {}

  async execute(command: CompleteLevelCommand): Promise<void> {
    const progress = await this.playerProgressRepository.load();
    const updated = progress.recordAttempt(command);
    await this.playerProgressRepository.save(updated);
    await this.progressSyncPort.sync({
      levelId: command.levelId,
      score: command.score,
    });
  }
}
