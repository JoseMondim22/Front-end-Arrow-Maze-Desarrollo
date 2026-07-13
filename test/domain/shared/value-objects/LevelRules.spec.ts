import { DomainError } from '@domain/shared/errors/DomainError';
import { LevelRules } from '@domain/shared/value-objects/LevelRules';

describe('LevelRules', () => {
  it('should_fail_when_time_limit_non_positive', () => {
    expect(() =>
      LevelRules.of({ timeLimitSeconds: 0, maxMoves: 5, maxPossibleScore: 100 }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_max_moves_non_positive', () => {
    expect(() =>
      LevelRules.of({ timeLimitSeconds: 60, maxMoves: 0, maxPossibleScore: 100 }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_max_possible_score_non_positive', () => {
    expect(() =>
      LevelRules.of({ timeLimitSeconds: 60, maxMoves: 5, maxPossibleScore: 0 }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_non_integer', () => {
    expect(() =>
      LevelRules.of({ timeLimitSeconds: 1.5, maxMoves: 5, maxPossibleScore: 100 }),
    ).toThrow(DomainError);
  });

  it('should_expose_limits_when_valid', () => {
    const rules = LevelRules.of({
      timeLimitSeconds: 60,
      maxMoves: 5,
      maxPossibleScore: 100,
    });

    expect(rules.timeLimit).toBe(60);
    expect(rules.maxMoves).toBe(5);
    expect(rules.maxPossibleScore).toBe(100);
  });
});
