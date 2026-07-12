import { DomainError } from '../../shared/errors/DomainError';
import { ChainId } from '../../shared/value-objects/ChainId';
import { NodeId } from '../../shared/value-objects/NodeId';

/**
 * The static definition of one chain inside a level: its identity and the ordered
 * nodes it occupies, tail -> head. The LAST node is the head.
 *
 * This ordering is authoritative and comes explicitly from the backend: it cannot
 * be re-derived from edges, because a folded (U-shaped) chain forms a cycle in the
 * edge subgraph and the order becomes ambiguous.
 *
 * Value Object: immutable. Deep structural validation against the graph adjacency
 * is BoardBuilder's job; here we only guard the intrinsic invariants.
 */
export class ChainDefinition {
  private constructor(
    private readonly chainId: ChainId,
    private readonly orderedNodeIds: readonly NodeId[],
  ) {}

  static of(chainId: ChainId, nodeIds: readonly NodeId[]): ChainDefinition {
    if (nodeIds.length === 0) {
      throw new DomainError('ChainDefinition must reference at least one node');
    }
    if (ChainDefinition.hasDuplicates(nodeIds)) {
      throw new DomainError('ChainDefinition cannot repeat a node');
    }
    return new ChainDefinition(chainId, [...nodeIds]);
  }

  private static hasDuplicates(nodeIds: readonly NodeId[]): boolean {
    const seen = new Set<string>();
    for (const nodeId of nodeIds) {
      const key = nodeId.toString();
      if (seen.has(key)) {
        return true;
      }
      seen.add(key);
    }
    return false;
  }

  get id(): ChainId {
    return this.chainId;
  }

  /** Ordered tail -> head. */
  get nodeIds(): readonly NodeId[] {
    return this.orderedNodeIds;
  }

  get head(): NodeId {
    return this.orderedNodeIds[this.orderedNodeIds.length - 1];
  }

  get tail(): NodeId {
    return this.orderedNodeIds[0];
  }
}
