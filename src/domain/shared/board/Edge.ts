import { NodeId } from '../value-objects/NodeId';

/**
 * An undirected adjacency between two nodes of the board graph. It states that two
 * nodes touch on the grid; it does NOT say which compass direction that is —
 * BoardBuilder derives the direction once from the endpoints' positions.
 * Value Object: immutable, compared by value.
 */
export class Edge {
  constructor(
    private readonly fromId: NodeId,
    private readonly toId: NodeId,
  ) {}

  get from(): NodeId {
    return this.fromId;
  }

  get to(): NodeId {
    return this.toId;
  }

  connects(nodeId: NodeId): boolean {
    return this.fromId.equals(nodeId) || this.toId.equals(nodeId);
  }
}
