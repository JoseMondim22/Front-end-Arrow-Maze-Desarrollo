import { DomainError } from '../shared/errors/DomainError';
import { ChainId } from '../shared/value-objects/ChainId';
import { Direction } from '../shared/value-objects/Direction';
import { NodeId } from '../shared/value-objects/NodeId';
import { IRotatable } from './IRotatable';

/**
 * Internal entity of the GameSession aggregate: an arrow, modelled as a train of
 * nodes ordered tail -> head, plus the direction its head points to.
 *
 * Immutable: rotate() returns a new chain. The chain is only reachable through the
 * Board, which is only reachable through GameSession.
 */
export class ArrowChain implements IRotatable {
  private constructor(
    private readonly chainId: ChainId,
    private readonly orderedNodeIds: readonly NodeId[],
    private readonly headDirection: Direction,
  ) {}

  static create(
    chainId: ChainId,
    nodeIds: readonly NodeId[],
    direction: Direction,
  ): ArrowChain {
    if (nodeIds.length === 0) {
      throw new DomainError('ArrowChain must occupy at least one node');
    }
    return new ArrowChain(chainId, [...nodeIds], direction);
  }

  get id(): ChainId {
    return this.chainId;
  }

  /** Ordered tail -> head. The last element is the head. */
  get nodeIds(): readonly NodeId[] {
    return this.orderedNodeIds;
  }

  get head(): NodeId {
    return this.orderedNodeIds[this.orderedNodeIds.length - 1];
  }

  get tail(): NodeId {
    return this.orderedNodeIds[0];
  }

  get direction(): Direction {
    return this.headDirection;
  }

  /** Re-aim the head 90 clockwise. Body shape and position are untouched. */
  rotate(): ArrowChain {
    return new ArrowChain(
      this.chainId,
      this.orderedNodeIds,
      this.headDirection.rotateClockwise(),
    );
  }

  occupies(nodeId: NodeId): boolean {
    return this.orderedNodeIds.some((id) => id.equals(nodeId));
  }
}
