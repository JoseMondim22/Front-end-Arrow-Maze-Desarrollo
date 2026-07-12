import { ChainId } from '../shared/value-objects/ChainId';
import { DomainError } from '../shared/errors/DomainError';
import { LevelRules } from '../shared/value-objects/LevelRules';
import { Board } from './Board';
import { GameStatus } from './value-objects/GameStatus';

/**
 * Aggregate root: a game in progress. Immutable — every action returns a NEW, valid
 * GameSession. Time is passed in via tick(); the domain never reads a clock, so the
 * whole aggregate is deterministic and testable in isolation.
 *
 * It holds the game invariants directly (move, rotate, victory, defeat, deadlock):
 * these are not use cases and touch no ports. The scoring policy is deliberately NOT
 * here yet — it is a swappable strategy wired when ScoringStrategy exists, together
 * with Level.startSession().
 */
export class GameSession {
  private constructor(
    private readonly board: Board,
    private readonly rules: LevelRules,
    private readonly gameStatus: GameStatus,
    private readonly movesUsedCount: number,
    private readonly timeUsedSeconds: number,
  ) {}

  /** Start a fresh session from an already-built board and the level's rules. */
  static begin(params: { board: Board; rules: LevelRules }): GameSession {
    const status = GameSession.resolveStatus(params.board, params.rules, 0, 0);
    return new GameSession(params.board, params.rules, status, 0, 0);
  }

  get status(): GameStatus {
    return this.gameStatus;
  }

  get movesUsed(): number {
    return this.movesUsedCount;
  }

  get timeUsed(): number {
    return this.timeUsedSeconds;
  }

  get activeChainCount(): number {
    return this.board.chains.length;
  }

  /**
   * Slide a chain. The whole chain escapes through an exit or reverts wholesale.
   * Either way movesUsed increments — a reverted attempt still costs a move.
   */
  moveArrow(chainId: ChainId): GameSession {
    if (!this.gameStatus.canAct()) {
      return this;
    }
    const nextBoard = this.board.slideChain(chainId).board;
    const moves = this.movesUsedCount + 1;
    const status = GameSession.resolveStatus(
      nextBoard,
      this.rules,
      moves,
      this.timeUsedSeconds,
    );
    return new GameSession(nextBoard, this.rules, status, moves, this.timeUsedSeconds);
  }

  /** Re-aim a chain's head 90 clockwise. NEVER increments movesUsed. */
  rotateArrow(chainId: ChainId): GameSession {
    if (!this.gameStatus.canAct()) {
      return this;
    }
    const nextBoard = this.board.rotateChain(chainId);
    const status = GameSession.resolveStatus(
      nextBoard,
      this.rules,
      this.movesUsedCount,
      this.timeUsedSeconds,
    );
    return new GameSession(
      nextBoard,
      this.rules,
      status,
      this.movesUsedCount,
      this.timeUsedSeconds,
    );
  }

  /** Advance the clock. Can only push the game into Defeat (time out). */
  tick(elapsedSeconds: number): GameSession {
    if (!this.gameStatus.isPlaying()) {
      return this;
    }
    if (elapsedSeconds < 0) {
      throw new DomainError('tick elapsedSeconds cannot be negative');
    }
    const time = Math.min(
      this.timeUsedSeconds + elapsedSeconds,
      this.rules.timeLimit,
    );
    const status = GameSession.resolveStatus(
      this.board,
      this.rules,
      this.movesUsedCount,
      time,
    );
    return new GameSession(this.board, this.rules, status, this.movesUsedCount, time);
  }

  pause(): GameSession {
    const status = this.gameStatus.pause();
    if (status === this.gameStatus) {
      return this;
    }
    return new GameSession(
      this.board,
      this.rules,
      status,
      this.movesUsedCount,
      this.timeUsedSeconds,
    );
  }

  resume(): GameSession {
    const status = this.gameStatus.resume();
    if (status === this.gameStatus) {
      return this;
    }
    return new GameSession(
      this.board,
      this.rules,
      status,
      this.movesUsedCount,
      this.timeUsedSeconds,
    );
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
}
