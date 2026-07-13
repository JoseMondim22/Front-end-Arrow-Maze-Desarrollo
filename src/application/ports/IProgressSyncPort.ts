import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { Score } from '../../domain/shared/value-objects/Score';

/**
 * Technical port over the backend's progress endpoint (POST /progress/sync).
 * Consumed by SyncProgressUseCase and CompleteLevelUseCase.
 */
export interface IProgressSyncPort {
  sync(params: { levelId: LevelId; score: Score }): Promise<void>;
}
