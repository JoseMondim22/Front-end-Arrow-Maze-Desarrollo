import { LevelId } from '../shared/value-objects/LevelId';
import { LevelOrder } from '../shared/value-objects/LevelOrder';
import { Score } from '../shared/value-objects/Score';

/**
 * Internal entity of the PlayerProgress aggregate: the player's progress on ONE
 * level. Immutable — recordCompletion returns a new instance.
 *
 * It carries the level's `order` (denormalised from Level) on purpose: it lets the
 * PlayerProgress root answer the cross-level unlock invariant from its own state,
 * without reaching out to the level roster (aggregate autonomy).
 */
export class LevelProgress {
  private constructor(
    private readonly levelId: LevelId,
    private readonly levelOrder: LevelOrder,
    private readonly completed: boolean,
    private readonly best: Score,
  ) {}

  /** A level that exists in the progression but has never been completed. */
  static fresh(levelId: LevelId, order: LevelOrder): LevelProgress {
    return new LevelProgress(levelId, order, false, Score.zero());
  }

  /** Rehydrate a stored row (via PlayerProgressMapper). */
  static reconstitute(
    levelId: LevelId,
    order: LevelOrder,
    completed: boolean,
    bestScore: Score,
  ): LevelProgress {
    return new LevelProgress(levelId, order, completed, bestScore);
  }

  /**
   * Register a completion with a score: the level becomes completed and bestScore
   * is monotonic (it never decreases).
   */
  recordCompletion(score: Score): LevelProgress {
    const best = score.isGreaterThan(this.best) ? score : this.best;
    return new LevelProgress(this.levelId, this.levelOrder, true, best);
  }

  get id(): LevelId {
    return this.levelId;
  }

  get order(): LevelOrder {
    return this.levelOrder;
  }

  get bestScore(): Score {
    return this.best;
  }

  isCompleted(): boolean {
    return this.completed;
  }
}
