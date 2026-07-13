import { GameSession } from '../game-session/GameSession';
import { ScoringStrategy } from '../shared/services/ScoringStrategy';
import { LevelId } from '../shared/value-objects/LevelId';
import { LevelOrder } from '../shared/value-objects/LevelOrder';
import { LevelRules } from '../shared/value-objects/LevelRules';
import { Score } from '../shared/value-objects/Score';
import { BoardBuilder } from './BoardBuilder';
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
 * Factory Method: startSession spawns an in-memory GameSession from this definition,
 * building the runtime Board with BoardBuilder and injecting the scoring policy.
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

  /** Factory Method: spawn a live GameSession from this static definition. */
  startSession(scoring: ScoringStrategy): GameSession {
    const board = new BoardBuilder(this.boardDefinition).build();
    return GameSession.begin({ board, rules: this.levelRules, scoring });
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
