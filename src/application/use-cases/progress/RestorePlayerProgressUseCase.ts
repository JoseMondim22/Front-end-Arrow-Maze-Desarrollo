import { ILevelRepository } from '../../../domain/level/ILevelRepository';
import { IPlayerProgressRepository } from '../../../domain/player-progress/IPlayerProgressRepository';
import { ICommandService } from '../../cqs/ICommandService';
import { IProgressSyncPort } from '../../ports/IProgressSyncPort';
import { RestorePlayerProgressCommand } from './RestorePlayerProgressCommand';

/**
 * Pulls the account's progress from the backend (GET /progress) and folds it
 * into local storage. Runs on login: local progress has no per-account
 * scoping (ClearLocalProgressUseCase wipes it on logout, see that use case's
 * doc comment), so without this, re-logging into the same account on the
 * same device would look like a brand-new player.
 *
 * Merges onto whatever is already stored locally rather than overwriting —
 * recordAttempt keeps bestScore monotonic, so this can never regress a score
 * from an offline attempt that hasn't synced to the backend yet.
 */
export class RestorePlayerProgressUseCase
  implements ICommandService<RestorePlayerProgressCommand>
{
  constructor(
    private readonly levelRepository: ILevelRepository,
    private readonly progressSyncPort: IProgressSyncPort,
    private readonly playerProgressRepository: IPlayerProgressRepository,
  ) {}

  async execute(): Promise<void> {
    const [levels, remoteEntries, progress] = await Promise.all([
      this.levelRepository.findAll(),
      this.progressSyncPort.fetchAll(),
      this.playerProgressRepository.load(),
    ]);

    let restored = progress;
    for (const entry of remoteEntries) {
      const level = levels.find((candidate) => candidate.id.equals(entry.levelId));
      if (level === undefined) {
        continue;
      }
      restored = restored.recordAttempt({
        levelId: entry.levelId,
        order: level.order,
        score: entry.bestScore,
      });
    }

    await this.playerProgressRepository.save(restored);
  }
}
