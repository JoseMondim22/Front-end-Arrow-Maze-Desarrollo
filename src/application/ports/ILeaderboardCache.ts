import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { LeaderboardEntryResult } from './ILeaderboardRepository';

/**
 * Technical port over LOCAL leaderboard storage (write side). Kept separate
 * from ILeaderboardRepository (read-only findTop) so that port stays a pure
 * query source — this is only consumed by SyncLeaderboardsUseCase.
 */
export interface ILeaderboardCache {
  replaceTop(params: { levelId: LevelId; entries: LeaderboardEntryResult[] }): Promise<void>;
}
