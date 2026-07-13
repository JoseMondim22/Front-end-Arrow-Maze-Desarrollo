import { DomainError } from '@domain/shared/errors/DomainError';
import { GridPosition } from '@domain/shared/value-objects/GridPosition';

describe('GridPosition', () => {
  it('should_fail_when_negative', () => {
    expect(() => GridPosition.of(-1, 0)).toThrow(DomainError);
    expect(() => GridPosition.of(0, -1)).toThrow(DomainError);
  });

  it('should_fail_when_non_integer', () => {
    expect(() => GridPosition.of(1.5, 0)).toThrow(DomainError);
  });

  it('should_be_equal_when_same_coordinates', () => {
    expect(GridPosition.of(1, 2).equals(GridPosition.of(1, 2))).toBe(true);
    expect(GridPosition.of(1, 2).equals(GridPosition.of(2, 1))).toBe(false);
  });
});
