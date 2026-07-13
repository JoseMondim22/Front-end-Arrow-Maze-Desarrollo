import { LevelId } from '../../../domain/shared/value-objects/LevelId';

/** Parameter object for SyncLeaderboardsUseCase. */
export interface SyncLeaderboardsCommand {
  levelIds: LevelId[];
  limit: number;
}
