import { DomainError } from '../shared/errors/DomainError';
import { GridPosition } from '../shared/value-objects/GridPosition';
import { GridPosition3D } from '../shared/value-objects/GridPosition3D';
import { Position } from '../shared/value-objects/Position';

/**
 * Domain-local input shape for PositionFactory. Same resolution CellFactory uses for
 * CellRawData: LevelMapper translates the raw board data into this shape, the domain
 * never sees the adapters' DTO directly (§8).
 */
export interface PositionRawData {
  positionType?: string;
  row: number;
  column: number;
  layer?: number;
}

/**
 * Factory Method (DOMINIO — igual que CellFactory): decides the concrete Position
 * subclass for a raw node description. The backend's wire discriminator for a 2D
 * board is 'grid'; an absent positionType (pre-migration levels) also means 2D.
 * Adding a new board shape (circular, hexagonal, ...) is one new case here plus a
 * new Position implementation — Board/BoardBuilder never change.
 */
export class PositionFactory {
  static create(data: PositionRawData): Position {
    switch (data.positionType ?? 'grid') {
      case 'grid':
        return GridPosition.of(data.row, data.column);
      case 'grid3d':
        if (data.layer === undefined) {
          throw new DomainError('grid3d node requires a layer');
        }
        return GridPosition3D.of(data.row, data.column, data.layer);
      default:
        throw new DomainError(`Unknown position type: ${data.positionType as string}`);
    }
  }
}
