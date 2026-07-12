import { DomainError } from '../errors/DomainError';

/**
 * The constraints of a level: how long the player has, how many moves are allowed,
 * and the ceiling the scoring strategy can award. Value Object: immutable.
 *
 * Shared: Level owns the rules, and GameSession copies them by value when a session
 * begins (see §6.5).
 */
export class LevelRules {
  private constructor(
    private readonly timeLimitSeconds: number,
    private readonly maxMovesAllowed: number,
    private readonly maxScore: number,
  ) {}

  static of(params: {
    timeLimitSeconds: number;
    maxMoves: number;
    maxPossibleScore: number;
  }): LevelRules {
    const { timeLimitSeconds, maxMoves, maxPossibleScore } = params;
    LevelRules.assertPositiveInteger(timeLimitSeconds, 'timeLimitSeconds');
    LevelRules.assertPositiveInteger(maxMoves, 'maxMoves');
    LevelRules.assertPositiveInteger(maxPossibleScore, 'maxPossibleScore');
    return new LevelRules(timeLimitSeconds, maxMoves, maxPossibleScore);
  }

  private static assertPositiveInteger(value: number, field: string): void {
    if (!Number.isInteger(value)) {
      throw new DomainError(`LevelRules.${field} must be an integer`);
    }
    if (value <= 0) {
      throw new DomainError(`LevelRules.${field} must be greater than zero`);
    }
  }

  get timeLimit(): number {
    return this.timeLimitSeconds;
  }

  get maxMoves(): number {
    return this.maxMovesAllowed;
  }

  get maxPossibleScore(): number {
    return this.maxScore;
  }
}
