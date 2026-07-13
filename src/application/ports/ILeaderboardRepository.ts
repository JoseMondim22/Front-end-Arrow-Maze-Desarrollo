import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { Score } from '../../domain/shared/value-objects/Score';

/** One row of a level's leaderboard. */
export interface LeaderboardEntryResult {
  position: number;
  username: string;
  score: Score;
}

/**
 * Technical port over the backend's leaderboard endpoint (GET /leaderboard/:levelId).
 * Consumed by GetLeaderboardUseCase.
 */
export interface ILeaderboardRepository {
  findTop(params: { levelId: LevelId; limit: number }): Promise<LeaderboardEntryResult[]>;
}
