import { DomainError } from '../shared/errors/DomainError';
import { Direction } from '../shared/value-objects/Direction';
import { GridDirection } from '../shared/value-objects/GridDirection';
import { GridDirection3D } from '../shared/value-objects/GridDirection3D';

/**
 * Factory Method (DOMINIO — igual que CellFactory/PositionFactory): resolves a raw
 * direction id into the Direction implementation that matches the node's own
 * positionType. A grid_arrow's direction vocabulary depends on its geometry (2D's
 * 4 compass ids vs 3D's 6), so this dispatches on the same discriminator PositionFactory
 * uses ('grid' for 2D, absent for pre-migration levels) — adding a new board shape
 * is one new case here, nothing else changes.
 */
export class DirectionFactory {
  static create(id: string, positionType?: string): Direction {
    switch (positionType ?? 'grid') {
      case 'grid':
        return GridDirection.of(id);
      case 'grid3d':
        return GridDirection3D.of(id);
      default:
        throw new DomainError(`Unknown position type: ${positionType as string}`);
    }
  }
}
