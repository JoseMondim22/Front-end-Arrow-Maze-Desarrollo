import { PositionFactory } from '@domain/level/PositionFactory';
import { DomainError } from '@domain/shared/errors/DomainError';
import { GridPosition } from '@domain/shared/value-objects/GridPosition';
import { GridPosition3D } from '@domain/shared/value-objects/GridPosition3D';

describe('PositionFactory', () => {
  it('should_build_a_grid_position_when_positionType_is_grid', () => {
    const position = PositionFactory.create({ positionType: 'grid', row: 1, column: 2 });

    expect(position).toBeInstanceOf(GridPosition);
  });

  it('should_build_a_grid_position_when_positionType_is_absent', () => {
    const position = PositionFactory.create({ row: 1, column: 2 });

    expect(position).toBeInstanceOf(GridPosition);
  });

  it('should_build_a_3d_grid_position_when_positionType_is_grid3d', () => {
    const position = PositionFactory.create({
      positionType: 'grid3d',
      row: 1,
      column: 2,
      layer: 3,
    });

    expect(position).toBeInstanceOf(GridPosition3D);
  });

  it('should_fail_when_positionType_is_grid3d_but_layer_is_missing', () => {
    expect(() =>
      PositionFactory.create({ positionType: 'grid3d', row: 1, column: 2 }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_positionType_is_unknown', () => {
    expect(() =>
      PositionFactory.create({ positionType: 'hexagon', row: 1, column: 2 }),
    ).toThrow(DomainError);
  });
});
