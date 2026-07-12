import { Direction } from '../../value-objects/Direction';
import { CellType } from './CellType';

/**
 * A cell that carries an initial heading. It only appears in a level DEFINITION:
 * BoardBuilder reads its direction to seed a chain head, then projects the terrain
 * underneath as an EmptyCell. Extends CellType (a heading cell is still terrain)
 * and adds the direction on top.
 */
export interface ArrowCell extends CellType {
  readonly direction: Direction;
}
