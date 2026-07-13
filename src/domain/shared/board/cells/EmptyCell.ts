import { CellType, CellTypeId } from './CellType';

/** Passable floor. A chain can slide across it (if no other chain occupies it). */
export class EmptyCell implements CellType {
  readonly id: CellTypeId = 'empty';

  isPassable(): boolean {
    return true;
  }
}
