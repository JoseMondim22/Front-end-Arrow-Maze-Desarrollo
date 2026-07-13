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
});
