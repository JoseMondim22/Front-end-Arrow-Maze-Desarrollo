import { DomainError } from '@domain/shared/errors/DomainError';
import { GridDirection } from '@domain/shared/value-objects/GridDirection';

describe('GridDirection', () => {
  it('should_cycle_Up_Right_Down_Left_Up_when_rotating', () => {
    expect(GridDirection.Up.rotateClockwise().id).toBe('right');
    expect(GridDirection.Right.rotateClockwise().id).toBe('down');
    expect(GridDirection.Down.rotateClockwise().id).toBe('left');
    expect(GridDirection.Left.rotateClockwise().id).toBe('up');
  });

  it('should_be_equal_when_same_id', () => {
    expect(GridDirection.Up.equals(GridDirection.Up)).toBe(true);
    expect(GridDirection.Up.equals(GridDirection.Down)).toBe(false);
  });

  it('should_resolve_a_singleton_when_id_is_valid', () => {
    expect(GridDirection.of('up')).toBe(GridDirection.Up);
    expect(GridDirection.of('right')).toBe(GridDirection.Right);
    expect(GridDirection.of('down')).toBe(GridDirection.Down);
    expect(GridDirection.of('left')).toBe(GridDirection.Left);
  });

  it('should_fail_when_id_is_not_a_known_direction', () => {
    expect(() => GridDirection.of('north')).toThrow(DomainError);
  });

  it('should_resolve_the_opposite_heading', () => {
    expect(GridDirection.Up.opposite().id).toBe('down');
    expect(GridDirection.Down.opposite().id).toBe('up');
    expect(GridDirection.Right.opposite().id).toBe('left');
    expect(GridDirection.Left.opposite().id).toBe('right');
  });
});
