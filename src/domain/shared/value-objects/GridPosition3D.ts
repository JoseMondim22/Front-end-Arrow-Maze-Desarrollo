import { DomainError } from '../errors/DomainError';
import { Direction } from './Direction';
import { GridDirection3D } from './GridDirection3D';
import { Position } from './Position';

/**
 * A position on a 3D grid, expressed as row/column/layer. Independent from
 * GridPosition (2D) — adding this never touches 2D behaviour.
 *
 * Axis-to-heading mapping (confirmed against the backend contract):
 *   row    -1 -> left,     row    +1 -> right
 *   column -1 -> backward, column +1 -> forward
 *   layer  -1 -> up,       layer  +1 -> down
 *
 * Value Object: immutable, compared by value.
 */
export class GridPosition3D implements Position {
  readonly kind = 'grid3d';

  private constructor(
    private readonly row: number,
    private readonly column: number,
    private readonly layer: number,
  ) {}

  static of(row: number, column: number, layer: number): GridPosition3D {
    if (!Number.isInteger(row) || !Number.isInteger(column) || !Number.isInteger(layer)) {
      throw new DomainError('GridPosition3D row/column/layer must be integers');
    }
    if (row < 0 || column < 0 || layer < 0) {
      throw new DomainError('GridPosition3D row/column/layer must be non-negative');
    }
    return new GridPosition3D(row, column, layer);
  }

  get rowIndex(): number {
    return this.row;
  }

  get columnIndex(): number {
    return this.column;
  }

  get layerIndex(): number {
    return this.layer;
  }

  equals(other: Position): boolean {
    return (
      other instanceof GridPosition3D &&
      this.row === other.row &&
      this.column === other.column &&
      this.layer === other.layer
    );
  }

  /** Exactly one grid step along a single axis, or null otherwise. */
  directionTo(other: Position): Direction | null {
    if (!(other instanceof GridPosition3D)) {
      return null;
    }
    const deltaRow = other.row - this.row;
    const deltaColumn = other.column - this.column;
    const deltaLayer = other.layer - this.layer;

    if (deltaRow === -1 && deltaColumn === 0 && deltaLayer === 0) {
      return GridDirection3D.Left;
    }
    if (deltaRow === 1 && deltaColumn === 0 && deltaLayer === 0) {
      return GridDirection3D.Right;
    }
    if (deltaRow === 0 && deltaColumn === -1 && deltaLayer === 0) {
      return GridDirection3D.Backward;
    }
    if (deltaRow === 0 && deltaColumn === 1 && deltaLayer === 0) {
      return GridDirection3D.Forward;
    }
    if (deltaRow === 0 && deltaColumn === 0 && deltaLayer === -1) {
      return GridDirection3D.Up;
    }
    if (deltaRow === 0 && deltaColumn === 0 && deltaLayer === 1) {
      return GridDirection3D.Down;
    }
    return null;
  }
}
