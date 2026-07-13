import { CellType, CellTypeId } from './CellType';

/** Impassable terrain. A chain head that advances into a wall reverts. */
export class WallCell implements CellType {
  readonly id: CellTypeId = 'wall';

  isPassable(): boolean {
    return false;
  }
}
