import { LevelId } from '../shared/value-objects/LevelId';
import { LevelOrder } from '../shared/value-objects/LevelOrder';
import { Score } from '../shared/value-objects/Score';
import { LevelProgress } from './LevelProgress';

/**
 * Aggregate root: the player's local progress across every level. A collection of
 * LevelProgress entries (one per level), keyed by level id. Immutable — every
 * mutation returns a new PlayerProgress.
 *
 * It owns the cross-level invariant that a single remote Progress row cannot express:
 * a level is unlocked only when the previous one (by order) is completed.
 */
export class PlayerProgress {
  private constructor(
    private readonly entries: ReadonlyMap<string, LevelProgress>,
  ) {}

  /** A brand-new player with no progress at all. */
  static empty(): PlayerProgress {
    return new PlayerProgress(new Map());
  }

  /** Rehydrate from stored entries (via PlayerProgressMapper). */
  static reconstitute(levelProgresses: readonly LevelProgress[]): PlayerProgress {
    const entries = new Map<string, LevelProgress>();
    for (const progress of levelProgresses) {
      entries.set(progress.id.toString(), progress);
    }
    return new PlayerProgress(entries);
  }

  /**
   * Record a completed attempt on a level. Marks it completed and keeps bestScore
   * monotonic. `order` is required so the aggregate can answer isUnlocked from its
   * own state; the caller always has the Level (hence its order) on completion.
   */
  recordAttempt(params: {
    levelId: LevelId;
    order: LevelOrder;
    score: Score;
  }): PlayerProgress {
    const key = params.levelId.toString();
    const current =
      this.entries.get(key) ?? LevelProgress.fresh(params.levelId, params.order);
    const updated = current.recordCompletion(params.score);

    const next = new Map(this.entries);
    next.set(key, updated);
    return new PlayerProgress(next);
  }

  /** A level is unlocked iff it is the first, or the previous order is completed. */
  isUnlocked(order: LevelOrder): boolean {
    if (order.isFirst()) {
      return true;
    }
    return this.isOrderCompleted(order.previous());
  }

  isCompleted(levelId: LevelId): boolean {
    return this.entries.get(levelId.toString())?.isCompleted() ?? false;
  }

  bestScoreOf(levelId: LevelId): Score {
    return this.entries.get(levelId.toString())?.bestScore ?? Score.zero();
  }

  /** Read-only view of every entry, for persistence / mapping. */
  get levelProgresses(): readonly LevelProgress[] {
    return [...this.entries.values()];
  }

  private isOrderCompleted(order: LevelOrder): boolean {
    for (const progress of this.entries.values()) {
      if (progress.order.equals(order) && progress.isCompleted()) {
        return true;
      }
    }
    return false;
  }
}
