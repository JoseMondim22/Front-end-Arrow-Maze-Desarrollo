import { TimeAndFailedMovesScoringStrategy } from '@domain/shared/services/TimeAndFailedMovesScoringStrategy';
import { ScoringInput } from '@domain/shared/services/ScoringStrategy';

const strategy = new TimeAndFailedMovesScoringStrategy();
const base: ScoringInput = {
  maxPossibleScore: 1000,
  movesUsed: 0,
  maxMoves: 10,
  failedMoves: 0,
  timeUsedSec: 0,
  timeLimitSec: 100,
};

describe('TimeAndFailedMovesScoringStrategy', () => {
  it('should_award_full_score_when_no_penalty', () => {
    expect(strategy.score(base).points).toBe(1000);
  });

  it('should_floor_at_zero_when_time_and_moves_exhausted', () => {
    expect(
      strategy.score({ ...base, failedMoves: 10, timeUsedSec: 100 }).points,
    ).toBe(0);
  });

  it('should_stay_within_bounds_when_penalized', () => {
    const points = strategy.score({ ...base, failedMoves: 5, timeUsedSec: 50 }).points;

    expect(points).toBeGreaterThanOrEqual(0);
    expect(points).toBeLessThanOrEqual(1000);
  });

  it('should_decrease_monotonically_when_failed_moves_increase', () => {
    const few = strategy.score({ ...base, failedMoves: 2 }).points;
    const many = strategy.score({ ...base, failedMoves: 6 }).points;

    expect(many).toBeLessThan(few);
  });

  it('should_award_full_score_when_budgets_are_zero', () => {
    expect(
      strategy.score({ ...base, maxMoves: 0, timeLimitSec: 0 }).points,
    ).toBe(1000);
  });
});
