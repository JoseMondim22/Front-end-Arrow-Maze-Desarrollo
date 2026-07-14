import { DomainError } from '@domain/shared/errors/DomainError';
import { GridDirection } from '@domain/shared/value-objects/GridDirection';
import { GridPosition } from '@domain/shared/value-objects/GridPosition';
import { GridPosition3D } from '@domain/shared/value-objects/GridPosition3D';

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

  it('should_resolve_the_compass_direction_to_an_adjacent_position', () => {
    const origin = GridPosition.of(1, 1);
    expect(origin.directionTo(GridPosition.of(0, 1))).toBe(GridDirection.Up);
    expect(origin.directionTo(GridPosition.of(2, 1))).toBe(GridDirection.Down);
    expect(origin.directionTo(GridPosition.of(1, 2))).toBe(GridDirection.Right);
    expect(origin.directionTo(GridPosition.of(1, 0))).toBe(GridDirection.Left);
  });

  it('should_return_null_when_not_a_single_grid_step_apart', () => {
    expect(GridPosition.of(1, 1).directionTo(GridPosition.of(3, 1))).toBeNull();
  });

  it('should_return_null_when_compared_against_a_different_position_kind', () => {
    expect(GridPosition.of(1, 1).directionTo(GridPosition3D.of(1, 0, 0))).toBeNull();
  });

  it('should_report_grid2d_as_its_kind', () => {
    expect(GridPosition.of(0, 0).kind).toBe('grid2d');
  });
});
