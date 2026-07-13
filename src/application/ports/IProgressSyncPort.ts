import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { Score } from '../../domain/shared/value-objects/Score';

/**
 * Technical port over the backend's progress endpoints (POST /progress/sync,
 * GET /progress). Consumed by SyncProgressUseCase/CompleteLevelUseCase (push)
 * and RestorePlayerProgressUseCase (pull, on login).
 */
export interface IProgressSyncPort {
  sync(params: { levelId: LevelId; score: Score }): Promise<void>;
  fetchAll(): Promise<Array<{ levelId: LevelId; bestScore: Score }>>;
}
