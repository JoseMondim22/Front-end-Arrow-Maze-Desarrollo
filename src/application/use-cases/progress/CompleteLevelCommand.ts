import { LevelId } from '../../../domain/shared/value-objects/LevelId';
import { LevelOrder } from '../../../domain/shared/value-objects/LevelOrder';
import { Score } from '../../../domain/shared/value-objects/Score';

/**
 * Parameter object for CompleteLevelUseCase. Extends §4's literal shape (levelId,
 * score) with `order`: PlayerProgress.recordAttempt needs it to answer the
 * cross-level unlock invariant from its own state. The caller always has the
 * just-played Level (hence its order) at completion time, so passing it is trivial.
 */
export interface CompleteLevelCommand {
  levelId: LevelId;
  order: LevelOrder;
  score: Score;
}
