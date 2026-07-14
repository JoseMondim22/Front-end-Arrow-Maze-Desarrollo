import { DirectionFactory } from '@domain/level/DirectionFactory';
import { DomainError } from '@domain/shared/errors/DomainError';
import { GridDirection } from '@domain/shared/value-objects/GridDirection';
import { GridDirection3D } from '@domain/shared/value-objects/GridDirection3D';

describe('DirectionFactory', () => {
  it('should_resolve_a_2d_compass_direction_when_positionType_is_grid', () => {
    expect(DirectionFactory.create('right', 'grid')).toBe(GridDirection.Right);
  });

  it('should_resolve_a_2d_compass_direction_when_positionType_is_absent', () => {
    expect(DirectionFactory.create('right')).toBe(GridDirection.Right);
  });

  it('should_resolve_a_3d_direction_when_positionType_is_grid3d', () => {
    expect(DirectionFactory.create('forward', 'grid3d')).toBe(GridDirection3D.Forward);
  });

  it('should_fail_when_positionType_is_unknown', () => {
    expect(() => DirectionFactory.create('up', 'hexagon')).toThrow(DomainError);
  });
});
