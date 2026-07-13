import { Score } from '../value-objects/Score';
import { ScoringInput, ScoringStrategy } from './ScoringStrategy';

/**
 * Starts at the level's maximum score and decays with BOTH the time spent and the
 * failed (reverted) moves. Each penalty is proportional to the level's own budget
 * (fraction of the time limit / of maxMoves), so it scales across levels regardless
 * of absolute limits.
 *
 * Weights are constructor-injected (OCP): tune them without touching this class.
 * With the defaults (0.5 + 0.5) a run that burns the whole clock AND wastes every
 * move on mistakes lands exactly at zero.
 */
export class TimeAndFailedMovesScoringStrategy implements ScoringStrategy {
  constructor(
    private readonly timeWeight: number = 0.5,
    private readonly failedMoveWeight: number = 0.5,
  ) {}

  score(input: ScoringInput): Score {
    const timeFraction =
      input.timeLimitSec > 0
        ? Math.min(input.timeUsedSec / input.timeLimitSec, 1)
        : 0;
    const failedFraction =
      input.maxMoves > 0 ? Math.min(input.failedMoves / input.maxMoves, 1) : 0;

    const penalty =
      input.maxPossibleScore *
      (this.timeWeight * timeFraction + this.failedMoveWeight * failedFraction);

    const remaining = Math.round(input.maxPossibleScore - penalty);
    const clamped = Math.max(0, Math.min(remaining, input.maxPossibleScore));
    return Score.of(clamped);
  }
}
