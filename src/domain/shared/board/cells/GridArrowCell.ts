import { Direction } from '../../value-objects/Direction';
import { ArrowCell } from './ArrowCell';
import { CellTypeId } from './CellType';

/**
 * A heading cell in a level definition. Carries the chain head's initial direction.
 * It reports itself as passable because the terrain underneath a head is walkable
 * floor: BoardBuilder splits it into an EmptyCell terrain plus a chain-head seed.
 */
export class GridArrowCell implements ArrowCell {
  readonly id: CellTypeId = 'grid_arrow';

  constructor(readonly direction: Direction) {}

  isPassable(): boolean {
    return true;
  }
}
