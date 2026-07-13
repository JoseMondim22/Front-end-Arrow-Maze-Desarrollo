import { LevelId } from '../../../domain/shared/value-objects/LevelId';
import { Score } from '../../../domain/shared/value-objects/Score';

/** Parameter object for SyncProgressUseCase. */
export interface SyncProgressCommand {
  levelId: LevelId;
  score: Score;
}
