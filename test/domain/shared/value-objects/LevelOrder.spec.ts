import { DomainError } from '@domain/shared/errors/DomainError';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';

describe('LevelOrder', () => {
  it('should_fail_when_below_one', () => {
    expect(() => LevelOrder.of(0)).toThrow(DomainError);
  });

  it('should_fail_when_non_integer', () => {
    expect(() => LevelOrder.of(1.5)).toThrow(DomainError);
  });

  it('should_be_first_when_one', () => {
    expect(LevelOrder.of(1).isFirst()).toBe(true);
    expect(LevelOrder.of(2).isFirst()).toBe(false);
  });

  it('should_return_previous_when_not_first', () => {
    expect(LevelOrder.of(3).previous().sequence).toBe(2);
  });

  it('should_fail_when_previous_of_first', () => {
    expect(() => LevelOrder.of(1).previous()).toThrow(DomainError);
  });

  it('should_be_equal_when_same_sequence', () => {
    expect(LevelOrder.of(2).equals(LevelOrder.of(2))).toBe(true);
    expect(LevelOrder.of(2).equals(LevelOrder.of(3))).toBe(false);
  });
});
