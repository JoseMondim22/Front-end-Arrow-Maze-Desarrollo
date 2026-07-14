import { DomainError } from '../errors/DomainError';
import { Direction } from './Direction';

/**
 * The six headings on a 3D grid, as a fixed set of flyweight instances. Independent
 * from GridDirection (2D) — adding this never touches the 4-direction cycle.
 *
 * Rotation (double-tap) walks a single fixed 6-step cycle across all six headings:
 * Up -> Right -> Down -> Left -> Forward -> Backward -> Up. This order is a design
 * policy isolated to this file; changing it never affects GridDirection or Board.
 */
export class GridDirection3D implements Direction {
  static readonly Up = new GridDirection3D('up');
  static readonly Right = new GridDirection3D('right');
  static readonly Down = new GridDirection3D('down');
  static readonly Left = new GridDirection3D('left');
  static readonly Forward = new GridDirection3D('forward');
  static readonly Backward = new GridDirection3D('backward');

  private constructor(
    readonly id: 'up' | 'right' | 'down' | 'left' | 'forward' | 'backward',
  ) {}

  /** Resolve a raw direction string (from a level's raw board data) into the
   * matching singleton. Throws on anything outside the six known ids. */
  static of(id: string): GridDirection3D {
    switch (id) {
      case 'up':
        return GridDirection3D.Up;
      case 'right':
        return GridDirection3D.Right;
      case 'down':
        return GridDirection3D.Down;
      case 'left':
        return GridDirection3D.Left;
      case 'forward':
        return GridDirection3D.Forward;
      case 'backward':
        return GridDirection3D.Backward;
      default:
        throw new DomainError(`Unknown 3D direction: ${id}`);
    }
  }

  private static readonly clockwiseOrder: readonly GridDirection3D[] = [
    GridDirection3D.Up,
    GridDirection3D.Right,
    GridDirection3D.Down,
    GridDirection3D.Left,
    GridDirection3D.Forward,
    GridDirection3D.Backward,
  ];

  rotateClockwise(): Direction {
    const order = GridDirection3D.clockwiseOrder;
    const next = (order.indexOf(this) + 1) % order.length;
    return order[next];
  }

  opposite(): Direction {
    switch (this) {
      case GridDirection3D.Up:
        return GridDirection3D.Down;
      case GridDirection3D.Down:
        return GridDirection3D.Up;
      case GridDirection3D.Left:
        return GridDirection3D.Right;
      case GridDirection3D.Right:
        return GridDirection3D.Left;
      case GridDirection3D.Forward:
        return GridDirection3D.Backward;
      default:
        // GridDirection3D.Backward is the only remaining case.
        return GridDirection3D.Forward;
    }
  }

  equals(other: Direction): boolean {
    return this.id === other.id;
  }
}
