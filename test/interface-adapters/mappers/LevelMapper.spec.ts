import { DomainError } from '@domain/shared/errors/DomainError';
import { GridPosition } from '@domain/shared/value-objects/GridPosition';
import { GridPosition3D } from '@domain/shared/value-objects/GridPosition3D';
import { LevelDTO } from '../../../src/interface-adapters/dtos/output/LevelDTO';
import { LevelMapper } from '../../../src/interface-adapters/mappers/LevelMapper';

function dto(overrides: Partial<LevelDTO> = {}): LevelDTO {
  return {
    id: 'level-1',
    board: {
      nodes: [
        { id: 'n0', type: 'grid_arrow', row: 0, column: 0, direction: 'right' },
        { id: 'exit', type: 'exit', row: 0, column: 1 },
      ],
      edges: [{ from: 'n0', to: 'exit' }],
      chains: [{ id: 'c1', nodeIds: ['n0'] }],
    },
    timeLimit: 60,
    maxMoves: 20,
    maxPossibleScore: 1000,
    difficulty: 'easy',
    order: 1,
    ...overrides,
  };
}

describe('LevelMapper', () => {
  it('should_build_grid_positions_when_positionType_is_absent', () => {
    const level = LevelMapper.toDomain(dto());

    const nodePositions = level.board.nodes.map((node) => node.at);
    expect(nodePositions.every((position) => position instanceof GridPosition)).toBe(true);
    expect(nodePositions[0].kind).toBe('grid2d');
  });

  it('should_build_grid_positions_when_positionType_is_the_backend_wire_value_grid', () => {
    // Real backend contract: 2D nodes carry positionType: 'grid' explicitly, not
    // 'grid2d' and not just an absent field.
    const level = LevelMapper.toDomain(
      dto({
        board: {
          nodes: [
            { id: 'n0', type: 'grid_arrow', row: 0, column: 0, positionType: 'grid', direction: 'right' },
            { id: 'exit', type: 'exit', row: 0, column: 1, positionType: 'grid' },
          ],
          edges: [{ from: 'n0', to: 'exit' }],
          chains: [{ id: 'c1', nodeIds: ['n0'] }],
        },
      }),
    );

    const nodePositions = level.board.nodes.map((node) => node.at);
    expect(nodePositions.every((position) => position instanceof GridPosition)).toBe(true);
  });

  it('should_build_3d_grid_positions_when_positionType_is_grid3d', () => {
    const level = LevelMapper.toDomain(
      dto({
        board: {
          nodes: [
            {
              id: 'n0',
              type: 'grid_arrow',
              row: 0,
              column: 0,
              layer: 0,
              positionType: 'grid3d',
              direction: 'forward',
            },
            { id: 'exit', type: 'exit', row: 0, column: 1, layer: 0, positionType: 'grid3d' },
          ],
          edges: [{ from: 'n0', to: 'exit' }],
          chains: [{ id: 'c1', nodeIds: ['n0'] }],
        },
      }),
    );

    const nodePositions = level.board.nodes.map((node) => node.at);
    expect(nodePositions.every((position) => position instanceof GridPosition3D)).toBe(true);
    expect(nodePositions[0].kind).toBe('grid3d');
  });

  it('should_fail_when_positionType_is_grid3d_but_layer_is_missing', () => {
    expect(() =>
      LevelMapper.toDomain(
        dto({
          board: {
            nodes: [
              {
                id: 'n0',
                type: 'grid_arrow',
                row: 0,
                column: 0,
                positionType: 'grid3d',
                direction: 'forward',
              },
              { id: 'exit', type: 'exit', row: 0, column: 1, positionType: 'grid3d' },
            ],
            edges: [{ from: 'n0', to: 'exit' }],
            chains: [{ id: 'c1', nodeIds: ['n0'] }],
          },
        }),
      ),
    ).toThrow(DomainError);
  });

  it('should_fail_when_positionType_is_unknown', () => {
    expect(() =>
      LevelMapper.toDomain(
        dto({
          board: {
            nodes: [
              { id: 'n0', type: 'grid_arrow', row: 0, column: 0, positionType: 'hexagon', direction: 'up' },
              { id: 'exit', type: 'exit', row: 0, column: 1, positionType: 'hexagon' },
            ],
            edges: [{ from: 'n0', to: 'exit' }],
            chains: [{ id: 'c1', nodeIds: ['n0'] }],
          },
        }),
      ),
    ).toThrow(DomainError);
  });
});
