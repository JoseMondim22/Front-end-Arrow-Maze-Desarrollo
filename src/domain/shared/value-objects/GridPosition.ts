import { DomainError } from '../errors/DomainError';
import { Direction } from './Direction';
import { GridDirection } from './GridDirection';
import { Position } from './Position';

/**
 * A position on a 2D grid, expressed as row/column.
 * Value Object: immutable, compared by value.
 *
 * row/column are used ONLY to paint the node on screen and, once, by BoardBuilder
 * (via directionTo) to derive directional adjacency. No movement rule reads them
 * during play.
 */
export class GridPosition implements Position {
  readonly kind = 'grid2d';

  private constructor(
    private readonly row: number,
    private readonly column: number,
  ) {}

  static of(row: number, column: number): GridPosition {
    if (!Number.isInteger(row) || !Number.isInteger(column)) {
      throw new DomainError('GridPosition row/column must be integers');
    }
    if (row < 0 || column < 0) {
      throw new DomainError('GridPosition row/column must be non-negative');
    }
    return new GridPosition(row, column);
  }

  get rowIndex(): number {
    return this.row;
  }

  get columnIndex(): number {
    return this.column;
  }

  equals(other: Position): boolean {
    return (
      other instanceof GridPosition &&
      this.row === other.row &&
      this.column === other.column
    );
  }

  /** Exactly one grid step in a compass direction, or null otherwise (§6.1 assumption). */
  directionTo(other: Position): Direction | null {
    if (!(other instanceof GridPosition)) {
      return null;
    }
    const deltaRow = other.row - this.row;
    const deltaColumn = other.column - this.column;
    if (deltaRow === -1 && deltaColumn === 0) {
      return GridDirection.Up;
    }
    if (deltaRow === 1 && deltaColumn === 0) {
      return GridDirection.Down;
    }
    if (deltaRow === 0 && deltaColumn === 1) {
      return GridDirection.Right;
    }
    if (deltaRow === 0 && deltaColumn === -1) {
      return GridDirection.Left;
    }
    return null;
  }
}
