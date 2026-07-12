import { LevelId } from '../shared/value-objects/LevelId';
import { LevelOrder } from '../shared/value-objects/LevelOrder';
import { LevelRules } from '../shared/value-objects/LevelRules';
import { Score } from '../shared/value-objects/Score';
import { BoardDefinition } from './value-objects/BoardDefinition';

/**
 * Aggregate root: the static definition of a playable level.
 *
 * Constructed only through named factories (private constructor, aligned with the
 * backend aggregate): create() for a brand-new level authored in the client's level
 * editor, reconstitute() for a level rehydrated from the backend via LevelMapper.
 *
 * It carries real behaviour, not just getters: isScorePlausible guards against a
 * score above the level's ceiling before it is ever recorded or synced.
 *
 * Factory Method (pending): startSession(scoring: ScoringStrategy): GameSession will
 * spawn an in-memory GameSession from this definition. It is intentionally left out
 * until the GameSession aggregate and ScoringStrategy exist, so this file stays free
 * of forward references that would not type-check yet.
 */
export class Level {
  private constructor(
    private readonly levelId: LevelId,
    private readonly boardDefinition: BoardDefinition,
    private readonly levelRules: LevelRules,
    private readonly levelOrder: LevelOrder,
  ) {}

  /** A brand-new level authored in the client (level editor, POST /levels). */
  static create(
    id: LevelId,
    board: BoardDefinition,
    rules: LevelRules,
    order: LevelOrder,
  ): Level {
    return new Level(id, board, rules, order);
  }

  /** A level rehydrated from the backend (via LevelMapper.toDomain). */
  static reconstitute(
    id: LevelId,
    board: BoardDefinition,
    rules: LevelRules,
    order: LevelOrder,
  ): Level {
    return new Level(id, board, rules, order);
  }

  /** A score is plausible only if it does not exceed the level's ceiling. */
  isScorePlausible(score: Score): boolean {
    return !score.isGreaterThan(Score.of(this.levelRules.maxPossibleScore));
  }

  get id(): LevelId {
    return this.levelId;
  }

  get board(): BoardDefinition {
    return this.boardDefinition;
  }

  get rules(): LevelRules {
    return this.levelRules;
  }

  get order(): LevelOrder {
    return this.levelOrder;
  }
}
