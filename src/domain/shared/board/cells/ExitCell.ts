import { CellType, CellTypeId } from './CellType';

/** The escape tile. A chain whose head reaches it leaves the board entirely. */
export class ExitCell implements CellType {
  readonly id: CellTypeId = 'exit';

  isPassable(): boolean {
    return true;
  }
}
