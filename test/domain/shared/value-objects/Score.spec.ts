import { DomainError } from '@domain/shared/errors/DomainError';
import { Score } from '@domain/shared/value-objects/Score';

describe('Score', () => {
  it('should_fail_when_negative', () => {
    expect(() => Score.of(-1)).toThrow(DomainError);
  });

  it('should_fail_when_non_integer', () => {
    expect(() => Score.of(1.5)).toThrow(DomainError);
  });

  it('should_be_zero_when_zero_factory', () => {
    expect(Score.zero().points).toBe(0);
  });

  it('should_compare_with_isGreaterThan', () => {
    expect(Score.of(5).isGreaterThan(Score.of(3))).toBe(true);
    expect(Score.of(3).isGreaterThan(Score.of(5))).toBe(false);
  });

  it('should_be_equal_when_same_points', () => {
    expect(Score.of(4).equals(Score.of(4))).toBe(true);
    expect(Score.of(4).equals(Score.of(5))).toBe(false);
  });
});
