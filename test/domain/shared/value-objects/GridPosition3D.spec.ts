import { DomainError } from '@domain/shared/errors/DomainError';
import { GridPosition } from '@domain/shared/value-objects/GridPosition';
import { GridPosition3D } from '@domain/shared/value-objects/GridPosition3D';

describe('GridPosition3D', () => {
  it('should_fail_when_negative', () => {
    expect(() => GridPosition3D.of(-1, 0, 0)).toThrow(DomainError);
    expect(() => GridPosition3D.of(0, -1, 0)).toThrow(DomainError);
    expect(() => GridPosition3D.of(0, 0, -1)).toThrow(DomainError);
  });

  it('should_fail_when_non_integer', () => {
    expect(() => GridPosition3D.of(1.5, 0, 0)).toThrow(DomainError);
  });

  it('should_be_equal_when_same_coordinates', () => {
    expect(GridPosition3D.of(1, 2, 3).equals(GridPosition3D.of(1, 2, 3))).toBe(true);
    expect(GridPosition3D.of(1, 2, 3).equals(GridPosition3D.of(1, 2, 0))).toBe(false);
  });

  it('should_resolve_row_axis_to_left_and_right', () => {
    const origin = GridPosition3D.of(1, 1, 1);
    expect(origin.directionTo(GridPosition3D.of(0, 1, 1))?.id).toBe('left');
    expect(origin.directionTo(GridPosition3D.of(2, 1, 1))?.id).toBe('right');
  });

  it('should_resolve_column_axis_to_backward_and_forward', () => {
    const origin = GridPosition3D.of(1, 1, 1);
    expect(origin.directionTo(GridPosition3D.of(1, 0, 1))?.id).toBe('backward');
    expect(origin.directionTo(GridPosition3D.of(1, 2, 1))?.id).toBe('forward');
  });

  it('should_resolve_layer_axis_to_up_and_down', () => {
    const origin = GridPosition3D.of(1, 1, 1);
    expect(origin.directionTo(GridPosition3D.of(1, 1, 0))?.id).toBe('up');
    expect(origin.directionTo(GridPosition3D.of(1, 1, 2))?.id).toBe('down');
  });

  it('should_return_null_when_not_a_single_step_apart', () => {
    const origin = GridPosition3D.of(1, 1, 1);
    expect(origin.directionTo(GridPosition3D.of(3, 1, 1))).toBeNull();
    expect(origin.directionTo(GridPosition3D.of(2, 2, 1))).toBeNull();
  });

  it('should_return_null_when_compared_against_a_different_position_kind', () => {
    const origin = GridPosition3D.of(1, 1, 1);
    expect(origin.directionTo(GridPosition.of(1, 1))).toBeNull();
  });

  it('should_report_grid3d_as_its_kind', () => {
    expect(GridPosition3D.of(0, 0, 0).kind).toBe('grid3d');
  });
});
