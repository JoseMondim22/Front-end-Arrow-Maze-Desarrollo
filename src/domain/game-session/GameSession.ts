import { DomainError } from '../shared/errors/DomainError';
import {
  ArrowChainExited,
  GameEvent,
  LevelCompleted,
} from '../shared/events/GameEvent';
import { ScoringStrategy } from '../shared/services/ScoringStrategy';
import { ChainId } from '../shared/value-objects/ChainId';
import { LevelRules } from '../shared/value-objects/LevelRules';
import { Score } from '../shared/value-objects/Score';
import { Board } from './Board';
import { GameStatus } from './value-objects/GameStatus';

/** The full immutable state of a session. Passed as one object so the many fields
 * are never mixed up positionally. */
interface GameSessionState {
  readonly board: Board;
  readonly rules: LevelRules;
  readonly scoring: ScoringStrategy;
  readonly status: GameStatus;
  readonly movesUsed: number;
  readonly timeUsed: number;
  readonly failedMoves: number;
  readonly finalScore: Score | null;
  readonly events: readonly GameEvent[];
}

/**
 * Aggregate root: a game in progress. Immutable — every action returns a NEW, valid
 * GameSession. Time is passed in via tick(); the domain never reads a clock, so the
 * whole aggregate is deterministic and testable in isolation.
 *
 * It holds the game invariants directly (move, rotate, victory, defeat, deadlock)
 * plus the scoring POLICY it was started with, so it can award the final Score the
 * moment the level is won. Each action stamps the events it produced; pullEvents()
 * returns the events of the LAST transition (no mutation — this is an immutable read).
 */
export class GameSession {
  private constructor(private readonly state: GameSessionState) {}

  /** Start a fresh session from a built board, the level's rules and a scoring policy. */
  static begin(params: {
    board: Board;
    rules: LevelRules;
    scoring: ScoringStrategy;
  }): GameSession {
    const status = GameSession.resolveStatus(params.board, params.rules, 0, 0);
    const finalScore =
      status.name === 'Victory'
        ? GameSession.computeScore(params.rules, 0, 0, 0, params.scoring)
        : null;
    return new GameSession({
      board: params.board,
      rules: params.rules,
      scoring: params.scoring,
      status,
      movesUsed: 0,
      timeUsed: 0,
      failedMoves: 0,
      finalScore,
      events: finalScore === null ? [] : [new LevelCompleted(finalScore)],
    });
  }

  get status(): GameStatus {
    return this.state.status;
  }

  get movesUsed(): number {
    return this.state.movesUsed;
  }

  get timeUsed(): number {
    return this.state.timeUsed;
  }

  /** Moves that reverted (hit a wall / edge / another chain). Feeds the scoring. */
  get failedMoves(): number {
    return this.state.failedMoves;
  }

  get activeChainCount(): number {
    return this.state.board.chains.length;
  }

  /** The final score, available only once the level is won; null otherwise. */
  get finalScore(): Score | null {
    return this.state.finalScore;
  }

  /** Events produced by the last transition, for the store to republish. */
  pullEvents(): readonly GameEvent[] {
    return this.state.events;
  }

  /**
   * Slide a chain. The whole chain escapes through an exit or reverts wholesale.
   * Either way movesUsed increments; a reverted attempt also bumps failedMoves.
   */
  moveArrow(chainId: ChainId): GameSession {
    if (!this.state.status.canAct()) {
      return this;
    }
    const slide = this.state.board.slideChain(chainId);
    const movesUsed = this.state.movesUsed + 1;
    const failedMoves =
      slide.outcome === 'Reverted'
        ? this.state.failedMoves + 1
        : this.state.failedMoves;
    const status = GameSession.resolveStatus(
      slide.board,
      this.state.rules,
      movesUsed,
      this.state.timeUsed,
    );

    const events: GameEvent[] = [];
    if (slide.outcome === 'Exited') {
      events.push(new ArrowChainExited(chainId));
    }

    let finalScore: Score | null = null;
    if (status.name === 'Victory') {
      finalScore = GameSession.computeScore(
        this.state.rules,
        movesUsed,
        failedMoves,
        this.state.timeUsed,
        this.state.scoring,
      );
      events.push(new LevelCompleted(finalScore));
    }

    return new GameSession({
      ...this.state,
      board: slide.board,
      status,
      movesUsed,
      failedMoves,
      finalScore,
      events,
    });
  }

  /** Re-aim a chain's head 90 clockwise. NEVER increments movesUsed, never scores. */
  rotateArrow(chainId: ChainId): GameSession {
    if (!this.state.status.canAct()) {
      return this;
    }
    const board = this.state.board.rotateChain(chainId);
    const status = GameSession.resolveStatus(
      board,
      this.state.rules,
      this.state.movesUsed,
      this.state.timeUsed,
    );
    return new GameSession({
      ...this.state,
      board,
      status,
      finalScore: null,
      events: [],
    });
  }

  /** Advance the clock. Can only push the game into Defeat (time out). */
  tick(elapsedSeconds: number): GameSession {
    if (!this.state.status.isPlaying()) {
      return this;
    }
    if (elapsedSeconds < 0) {
      throw new DomainError('tick elapsedSeconds cannot be negative');
    }
    const timeUsed = Math.min(
      this.state.timeUsed + elapsedSeconds,
      this.state.rules.timeLimit,
    );
    const status = GameSession.resolveStatus(
      this.state.board,
      this.state.rules,
      this.state.movesUsed,
      timeUsed,
    );
    return new GameSession({
      ...this.state,
      timeUsed,
      status,
      finalScore: null,
      events: [],
    });
  }

  pause(): GameSession {
    const status = this.state.status.pause();
    if (status === this.state.status) {
      return this;
    }
    return new GameSession({ ...this.state, status, events: [] });
  }

  resume(): GameSession {
    const status = this.state.status.resume();
    if (status === this.state.status) {
      return this;
    }
    return new GameSession({ ...this.state, status, events: [] });
  }

  /**
   * Terminal-state resolution, evaluated after every action (never on a paused or
   * already-terminal session). Order matters: victory wins over a simultaneous
   * move/time exhaustion.
   */
  private static resolveStatus(
    board: Board,
    rules: LevelRules,
    movesUsed: number,
    timeUsed: number,
  ): GameStatus {
    if (board.chains.length === 0) {
      return GameStatus.Victory;
    }
    if (movesUsed >= rules.maxMoves) {
      return GameStatus.Defeat;
    }
    if (timeUsed >= rules.timeLimit) {
      return GameStatus.Defeat;
    }
    const deadlocked = board.chains.every(
      (chain) => !board.hasLegalMove(chain.id),
    );
    if (deadlocked) {
      return GameStatus.Defeat;
    }
    return GameStatus.Playing;
  }

  private static computeScore(
    rules: LevelRules,
    movesUsed: number,
    failedMoves: number,
    timeUsed: number,
    scoring: ScoringStrategy,
  ): Score {
    return scoring.score({
      maxPossibleScore: rules.maxPossibleScore,
      movesUsed,
      maxMoves: rules.maxMoves,
      failedMoves,
      timeUsedSec: timeUsed,
      timeLimitSec: rules.timeLimit,
    });
  }
}
