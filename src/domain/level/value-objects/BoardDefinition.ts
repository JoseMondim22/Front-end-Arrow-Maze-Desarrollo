import { CellNode } from '../../shared/board/CellNode';
import { Edge } from '../../shared/board/Edge';
import { DomainError } from '../../shared/errors/DomainError';
import { NodeId } from '../../shared/value-objects/NodeId';
import { ChainDefinition } from './ChainDefinition';

/**
 * The immutable, static blueprint of a board: its nodes, the adjacency edges, and
 * the ordered chain definitions. This is what a Level stores; it is NOT the runtime
 * Board (that mutable entity is built by BoardBuilder when a session starts).
 *
 * Guards the structural invariants that must hold regardless of runtime:
 *  - at least one node,
 *  - at least one exit,
 *  - every edge endpoint references an existing node,
 *  - every chain node references an existing node,
 *  - at least one chain (a level with no arrows is unplayable).
 *
 * The deeper check "consecutive chain nodes are adjacent in the graph" needs the
 * precomputed directional adjacency and therefore belongs to BoardBuilder.
 */
export class BoardDefinition {
  private constructor(
    private readonly boardNodes: readonly CellNode[],
    private readonly boardEdges: readonly Edge[],
    private readonly boardChains: readonly ChainDefinition[],
  ) {}

  static of(params: {
    nodes: readonly CellNode[];
    edges: readonly Edge[];
    chains: readonly ChainDefinition[];
  }): BoardDefinition {
    const { nodes, edges, chains } = params;

    if (nodes.length === 0) {
      throw new DomainError('BoardDefinition must have at least one node');
    }
    if (chains.length === 0) {
      throw new DomainError('BoardDefinition must have at least one chain');
    }

    const knownIds = BoardDefinition.indexNodeIds(nodes);

    if (!nodes.some((node) => node.isExit())) {
      throw new DomainError('BoardDefinition must have at least one exit cell');
    }

    BoardDefinition.assertEdgesReferenceKnownNodes(edges, knownIds);
    BoardDefinition.assertChainsReferenceKnownNodes(chains, knownIds);

    return new BoardDefinition([...nodes], [...edges], [...chains]);
  }

  private static indexNodeIds(nodes: readonly CellNode[]): Set<string> {
    const ids = new Set<string>();
    for (const node of nodes) {
      const key = node.id.toString();
      if (ids.has(key)) {
        throw new DomainError(`BoardDefinition has a duplicated node id: ${key}`);
      }
      ids.add(key);
    }
    return ids;
  }

  private static assertEdgesReferenceKnownNodes(
    edges: readonly Edge[],
    knownIds: Set<string>,
  ): void {
    for (const edge of edges) {
      BoardDefinition.assertKnown(edge.from, knownIds, 'Edge');
      BoardDefinition.assertKnown(edge.to, knownIds, 'Edge');
    }
  }

  private static assertChainsReferenceKnownNodes(
    chains: readonly ChainDefinition[],
    knownIds: Set<string>,
  ): void {
    for (const chain of chains) {
      for (const nodeId of chain.nodeIds) {
        BoardDefinition.assertKnown(nodeId, knownIds, 'Chain');
      }
    }
  }

  private static assertKnown(
    nodeId: NodeId,
    knownIds: Set<string>,
    context: string,
  ): void {
    if (!knownIds.has(nodeId.toString())) {
      throw new DomainError(
        `${context} references an unknown node id: ${nodeId.toString()}`,
      );
    }
  }

  get nodes(): readonly CellNode[] {
    return this.boardNodes;
  }

  get edges(): readonly Edge[] {
    return this.boardEdges;
  }

  get chains(): readonly ChainDefinition[] {
    return this.boardChains;
  }
}
