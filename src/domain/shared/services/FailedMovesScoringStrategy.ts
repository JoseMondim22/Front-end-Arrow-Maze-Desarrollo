import { Score } from '../value-objects/Score';
import { ScoringInput, ScoringStrategy } from './ScoringStrategy';

/**
 * Starts at the level's maximum score and decays ONLY with the failed (reverted)
 * moves — time is ignored. The penalty is proportional to the move budget (fraction
 * of maxMoves), so it scales across levels.
 *
 * The weight is constructor-injected (OCP). With the default (1.0), wasting the
 * whole move budget on mistakes lands at zero.
 */
export class FailedMovesScoringStrategy implements ScoringStrategy {
  constructor(private readonly failedMoveWeight: number = 1) {}

  score(input: ScoringInput): Score {
    const failedFraction =
      input.maxMoves > 0 ? Math.min(input.failedMoves / input.maxMoves, 1) : 0;

    const penalty = input.maxPossibleScore * (this.failedMoveWeight * failedFraction);

    const remaining = Math.round(input.maxPossibleScore - penalty);
    const clamped = Math.max(0, Math.min(remaining, input.maxPossibleScore));
    return Score.of(clamped);
  }
}
