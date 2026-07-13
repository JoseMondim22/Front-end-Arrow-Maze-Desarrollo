import { LevelId } from '../../../domain/shared/value-objects/LevelId';

/** Parameter object for GetLeaderboardUseCase. */
export interface GetLeaderboardQuery {
  levelId: LevelId;
  limit: number;
}
