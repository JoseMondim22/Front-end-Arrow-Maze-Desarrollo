import { CellType } from '../shared/board/cells/CellType';
import { EmptyCell } from '../shared/board/cells/EmptyCell';
import { ExitCell } from '../shared/board/cells/ExitCell';
import { GridArrowCell } from '../shared/board/cells/GridArrowCell';
import { WallCell } from '../shared/board/cells/WallCell';
import { DomainError } from '../shared/errors/DomainError';
import { DirectionFactory } from './DirectionFactory';

/**
 * Domain-local input shape for CellFactory. Deliberately NOT the adapters' DTO
 * (NodeRawData): the domain must not import anything from Capa 3 (§8). LevelMapper
 * translates its raw board data into this shape before calling the factory, so the
 * domain never sees an external DTO directly — same resolution the backend uses.
 * positionType is forwarded to DirectionFactory: a grid_arrow's direction vocabulary
 * depends on the node's geometry (2D compass vs 3D compass).
 */
export interface CellRawData {
  type: 'grid_arrow' | 'wall' | 'empty' | 'exit';
  direction?: string;
  positionType?: string;
}

/**
 * Factory Method (DOMINIO — igual que el backend): decides the concrete CellType
 * subclass for a raw cell description. Callers never need to know WallCell,
 * EmptyCell, etc. exist — they just ask "give me the CellType for this raw data."
 */
export class CellFactory {
  static create(data: CellRawData): CellType {
    switch (data.type) {
      case 'grid_arrow':
        return new GridArrowCell(
          DirectionFactory.create(CellFactory.requireDirection(data), data.positionType),
        );
      case 'wall':
        return new WallCell();
      case 'empty':
        return new EmptyCell();
      case 'exit':
        return new ExitCell();
      default:
        throw new DomainError(`Unknown cell type: ${data.type as string}`);
    }
  }

  private static requireDirection(data: CellRawData): string {
    if (data.direction === undefined) {
      throw new DomainError('grid_arrow cell requires a direction');
    }
    return data.direction;
  }
}
