import { CellType } from './cells/CellType';
import { NodeId } from '../value-objects/NodeId';
import { Position } from '../value-objects/Position';

/**
 * A single node of the board graph: its identity, where to paint it, and the
 * terrain that sits on it. Value Object: immutable, compared by identity + terrain.
 */
export class CellNode {
  constructor(
    private readonly nodeId: NodeId,
    private readonly position: Position,
    private readonly cellType: CellType,
  ) {}

  get id(): NodeId {
    return this.nodeId;
  }

  get at(): Position {
    return this.position;
  }

  get terrain(): CellType {
    return this.cellType;
  }

  isExit(): boolean {
    return this.cellType.id === 'exit';
  }

  isArrowSeed(): boolean {
    return this.cellType.id === 'grid_arrow';
  }
}
