import { DomainError } from '@domain/shared/errors/DomainError';
import { GridDirection3D } from '@domain/shared/value-objects/GridDirection3D';

describe('GridDirection3D', () => {
  it('should_cycle_through_all_six_headings_when_rotating', () => {
    expect(GridDirection3D.Up.rotateClockwise().id).toBe('right');
    expect(GridDirection3D.Right.rotateClockwise().id).toBe('down');
    expect(GridDirection3D.Down.rotateClockwise().id).toBe('left');
    expect(GridDirection3D.Left.rotateClockwise().id).toBe('forward');
    expect(GridDirection3D.Forward.rotateClockwise().id).toBe('backward');
    expect(GridDirection3D.Backward.rotateClockwise().id).toBe('up');
  });

  it('should_resolve_the_opposite_heading_for_each_axis', () => {
    expect(GridDirection3D.Up.opposite().id).toBe('down');
    expect(GridDirection3D.Down.opposite().id).toBe('up');
    expect(GridDirection3D.Left.opposite().id).toBe('right');
    expect(GridDirection3D.Right.opposite().id).toBe('left');
    expect(GridDirection3D.Forward.opposite().id).toBe('backward');
    expect(GridDirection3D.Backward.opposite().id).toBe('forward');
  });

  it('should_be_equal_when_same_id', () => {
    expect(GridDirection3D.Forward.equals(GridDirection3D.Forward)).toBe(true);
    expect(GridDirection3D.Forward.equals(GridDirection3D.Backward)).toBe(false);
  });

  it('should_resolve_a_singleton_when_id_is_valid', () => {
    expect(GridDirection3D.of('up')).toBe(GridDirection3D.Up);
    expect(GridDirection3D.of('right')).toBe(GridDirection3D.Right);
    expect(GridDirection3D.of('down')).toBe(GridDirection3D.Down);
    expect(GridDirection3D.of('left')).toBe(GridDirection3D.Left);
    expect(GridDirection3D.of('forward')).toBe(GridDirection3D.Forward);
    expect(GridDirection3D.of('backward')).toBe(GridDirection3D.Backward);
  });

  it('should_fail_when_id_is_not_a_known_3d_direction', () => {
    expect(() => GridDirection3D.of('north')).toThrow(DomainError);
  });
});
