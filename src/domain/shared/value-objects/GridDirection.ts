import { DomainError } from '../errors/DomainError';
import { Direction } from './Direction';

/**
 * The four compass directions on a grid, as a fixed set of flyweight instances.
 * Value Object: immutable. Rotation walks the cycle Up -> Right -> Down -> Left -> Up.
 */
export class GridDirection implements Direction {
  static readonly Up = new GridDirection('up');
  static readonly Right = new GridDirection('right');
  static readonly Down = new GridDirection('down');
  static readonly Left = new GridDirection('left');

  private constructor(readonly id: 'up' | 'right' | 'down' | 'left') {}

  /** Resolve a raw direction string (e.g. from a level's raw board data) into the
   * matching singleton. Throws on anything that isn't one of the four compass ids. */
  static of(id: string): GridDirection {
    switch (id) {
      case 'up':
        return GridDirection.Up;
      case 'right':
        return GridDirection.Right;
      case 'down':
        return GridDirection.Down;
      case 'left':
        return GridDirection.Left;
      default:
        throw new DomainError(`Unknown direction: ${id}`);
    }
  }

  /** Cyclic clockwise order: Up -> Right -> Down -> Left -> Up. */
  private static readonly clockwiseOrder: readonly GridDirection[] = [
    GridDirection.Up,
    GridDirection.Right,
    GridDirection.Down,
    GridDirection.Left,
  ];

  rotateClockwise(): Direction {
    const order = GridDirection.clockwiseOrder;
    const next = (order.indexOf(this) + 1) % order.length;
    return order[next];
  }

  opposite(): Direction {
    switch (this) {
      case GridDirection.Up:
        return GridDirection.Down;
      case GridDirection.Down:
        return GridDirection.Up;
      case GridDirection.Right:
        return GridDirection.Left;
      default:
        // GridDirection.Left is the only remaining case (4 flyweight instances total).
        return GridDirection.Right;
    }
  }

  equals(other: Direction): boolean {
    return this.id === other.id;
  }
}
