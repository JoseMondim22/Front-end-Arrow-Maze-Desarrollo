import { FailedMovesScoringStrategy } from '@domain/shared/services/FailedMovesScoringStrategy';
import { ScoringInput } from '@domain/shared/services/ScoringStrategy';

const strategy = new FailedMovesScoringStrategy();
const base: ScoringInput = {
  maxPossibleScore: 1000,
  movesUsed: 0,
  maxMoves: 10,
  failedMoves: 0,
  timeUsedSec: 0,
  timeLimitSec: 100,
};

describe('FailedMovesScoringStrategy', () => {
  it('should_award_full_score_when_no_failed_moves', () => {
    expect(strategy.score(base).points).toBe(1000);
  });

  it('should_floor_at_zero_when_all_moves_failed', () => {
    expect(strategy.score({ ...base, failedMoves: 10 }).points).toBe(0);
  });

  it('should_ignore_time_when_scoring', () => {
    expect(strategy.score({ ...base, timeUsedSec: 100 }).points).toBe(1000);
  });

  it('should_decrease_monotonically_when_failed_moves_increase', () => {
    const few = strategy.score({ ...base, failedMoves: 2 }).points;
    const many = strategy.score({ ...base, failedMoves: 6 }).points;

    expect(many).toBeLessThan(few);
  });

  it('should_award_full_score_when_move_budget_is_zero', () => {
    expect(strategy.score({ ...base, maxMoves: 0 }).points).toBe(1000);
  });
});
