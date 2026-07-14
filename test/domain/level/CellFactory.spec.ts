import { CellFactory } from '@domain/level/CellFactory';
import { DomainError } from '@domain/shared/errors/DomainError';

describe('CellFactory', () => {
  it('should_create_a_grid_arrow_cell_with_its_direction', () => {
    const cell = CellFactory.create({ type: 'grid_arrow', direction: 'up' });

    expect(cell.id).toBe('grid_arrow');
    expect(cell.isPassable()).toBe(true);
  });

  it('should_create_a_wall_cell', () => {
    const cell = CellFactory.create({ type: 'wall' });

    expect(cell.id).toBe('wall');
    expect(cell.isPassable()).toBe(false);
  });

  it('should_create_an_empty_cell', () => {
    const cell = CellFactory.create({ type: 'empty' });

    expect(cell.id).toBe('empty');
    expect(cell.isPassable()).toBe(true);
  });

  it('should_create_an_exit_cell', () => {
    const cell = CellFactory.create({ type: 'exit' });

    expect(cell.id).toBe('exit');
    expect(cell.isPassable()).toBe(true);
  });

  it('should_fail_when_grid_arrow_has_no_direction', () => {
    expect(() => CellFactory.create({ type: 'grid_arrow' })).toThrow(DomainError);
  });

  it('should_fail_when_direction_is_not_a_known_compass_id', () => {
    expect(() =>
      CellFactory.create({ type: 'grid_arrow', direction: 'north' }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_type_is_unknown', () => {
    expect(() =>
      CellFactory.create({ type: 'lava' as never }),
    ).toThrow(DomainError);
  });

  it('should_create_a_grid_arrow_cell_with_a_3d_direction_when_positionType_is_grid3d', () => {
    const cell = CellFactory.create({
      type: 'grid_arrow',
      direction: 'forward',
      positionType: 'grid3d',
    });

    expect(cell.id).toBe('grid_arrow');
    expect(cell.isPassable()).toBe(true);
  });

  it('should_fail_when_direction_is_not_a_known_3d_id', () => {
    expect(() =>
      CellFactory.create({ type: 'grid_arrow', direction: 'north', positionType: 'grid3d' }),
    ).toThrow(DomainError);
  });

  it('should_fail_when_positionType_is_unknown', () => {
    expect(() =>
      CellFactory.create({ type: 'grid_arrow', direction: 'up', positionType: 'hexagon' }),
    ).toThrow(DomainError);
  });
});
