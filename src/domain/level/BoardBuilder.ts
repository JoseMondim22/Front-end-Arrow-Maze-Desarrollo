import { ArrowChain } from '../game-session/ArrowChain';
import { Board } from '../game-session/Board';
import { CellNode } from '../shared/board/CellNode';
import { ArrowCell } from '../shared/board/cells/ArrowCell';
import { CellType } from '../shared/board/cells/CellType';
import { EmptyCell } from '../shared/board/cells/EmptyCell';
import { DomainError } from '../shared/errors/DomainError';
import { Direction } from '../shared/value-objects/Direction';
import { NodeId } from '../shared/value-objects/NodeId';
import { BoardDefinition } from './value-objects/BoardDefinition';
import { ChainDefinition } from './value-objects/ChainDefinition';

/** Adjacency being assembled for one node, keyed by Direction.id. Mutable while
 * building; handed to Board (which only needs read access) once complete. */
type MutableAdjacency = Map<string, NodeId | null>;

/** A grid_arrow terrain always implements ArrowCell (it carries a direction). */
function isArrowCell(cell: CellType): cell is ArrowCell {
  return cell.id === 'grid_arrow';
}

/**
 * Builder (DOMINIO): turns a static BoardDefinition (the level blueprint) into a
 * runtime Board (the live board a GameSession plays on). Invoked by
 * Level.startSession — the runtime Board is born only when you actually play.
 *
 * Assembles the Board in steps:
 *  1. index nodes by id,
 *  2. precompute directional adjacency ONCE from edges + node positions, via
 *     Position.directionTo (§6.1) — geometry-agnostic, works for any Position kind,
 *  3. rebuild every ArrowChain from the explicit chain order (§6.3), validating it,
 *  4. project terrain (a grid_arrow seed becomes plain EmptyCell floor, §6.2).
 *
 * From here on the game never reads row/column/layer again: movement runs on the
 * precomputed adjacency.
 */
export class BoardBuilder {
  constructor(private readonly definition: BoardDefinition) {}

  build(): Board {
    const nodes = this.indexNodes();
    const adjacency = this.buildAdjacency(nodes);
    const chains = this.buildChains(nodes, adjacency);
    const terrain = this.projectTerrain();
    return Board.create({ nodes: terrain, adjacency, chains });
  }

  private indexNodes(): Map<string, CellNode> {
    const index = new Map<string, CellNode>();
    for (const node of this.definition.nodes) {
      index.set(node.id.toString(), node);
    }
    return index;
  }

  /**
   * Directional adjacency from undirected edges: each edge is read in BOTH ways
   * (if `to` is up of `from`, then `from` is down of `to`, via Direction.opposite).
   * Endpoints must be exactly one step apart in their own geometry (Position.directionTo
   * returns null otherwise) — anything else is a malformed board. Geometry-agnostic:
   * works for GridPosition (4 headings), GridPosition3D (6), or any future Position.
   */
  private buildAdjacency(nodes: Map<string, CellNode>): Map<string, MutableAdjacency> {
    const adjacency = new Map<string, MutableAdjacency>();
    for (const node of this.definition.nodes) {
      adjacency.set(node.id.toString(), new Map<string, NodeId | null>());
    }

    for (const edge of this.definition.edges) {
      const fromNode = this.nodeOf(nodes, edge.from);
      const toNode = this.nodeOf(nodes, edge.to);
      const direction = fromNode.at.directionTo(toNode.at);
      if (direction === null) {
        throw new DomainError(
          `Edge ${edge.from.toString()} -> ${edge.to.toString()} connects non-adjacent nodes`,
        );
      }

      this.adjacencyEntry(adjacency, edge.from).set(direction.id, edge.to);
      this.adjacencyEntry(adjacency, edge.to).set(direction.opposite().id, edge.from);
    }

    return adjacency;
  }

  private buildChains(
    nodes: Map<string, CellNode>,
    adjacency: Map<string, MutableAdjacency>,
  ): ArrowChain[] {
    return this.definition.chains.map((chain) =>
      this.buildChain(chain, nodes, adjacency),
    );
  }

  private buildChain(
    chain: ChainDefinition,
    nodes: Map<string, CellNode>,
    adjacency: Map<string, MutableAdjacency>,
  ): ArrowChain {
    const ids = chain.nodeIds;

    // Head is the only grid_arrow; the body is plain empty floor (§6.3).
    ids.forEach((nodeId, index) => {
      const terrain = this.nodeOf(nodes, nodeId).terrain;
      const isHead = index === ids.length - 1;
      if (isHead && terrain.id !== 'grid_arrow') {
        throw new DomainError(
          `Chain ${chain.id.toString()} head ${nodeId.toString()} must be a grid_arrow cell`,
        );
      }
      if (!isHead && terrain.id !== 'empty') {
        throw new DomainError(
          `Chain ${chain.id.toString()} body node ${nodeId.toString()} must be an empty cell`,
        );
      }
    });

    // Consecutive nodes must be neighbours in the precomputed adjacency (§6.3).
    for (let index = 0; index < ids.length - 1; index += 1) {
      if (!this.areAdjacent(ids[index], ids[index + 1], adjacency)) {
        throw new DomainError(
          `Chain ${chain.id.toString()} nodes ${ids[index].toString()} and ${ids[
            index + 1
          ].toString()} are not adjacent`,
        );
      }
    }

    const direction = this.headDirectionOf(this.nodeOf(nodes, chain.head), chain);
    return ArrowChain.create(chain.id, ids, direction);
  }

  private headDirectionOf(headNode: CellNode, chain: ChainDefinition): Direction {
    const terrain = headNode.terrain;
    if (!isArrowCell(terrain)) {
      throw new DomainError(
        `Chain ${chain.id.toString()} head ${headNode.id.toString()} has no direction`,
      );
    }
    return terrain.direction;
  }

  /** A grid_arrow seed is only a level marker; underneath it is walkable floor. */
  private projectTerrain(): CellNode[] {
    return this.definition.nodes.map((node) =>
      node.isArrowSeed() ? new CellNode(node.id, node.at, new EmptyCell()) : node,
    );
  }

  private areAdjacent(a: NodeId, b: NodeId, adjacency: Map<string, MutableAdjacency>): boolean {
    const entry = adjacency.get(a.toString());
    if (entry === undefined) {
      return false;
    }
    return Array.from(entry.values()).some(
      (neighbour) => neighbour !== null && neighbour.equals(b),
    );
  }

  private nodeOf(nodes: Map<string, CellNode>, id: NodeId): CellNode {
    const node = nodes.get(id.toString());
    if (node === undefined) {
      throw new DomainError(`Unknown node referenced: ${id.toString()}`);
    }
    return node;
  }

  private adjacencyEntry(
    adjacency: Map<string, MutableAdjacency>,
    id: NodeId,
  ): MutableAdjacency {
    const entry = adjacency.get(id.toString());
    if (entry === undefined) {
      throw new DomainError(`No adjacency slot for node: ${id.toString()}`);
    }
    return entry;
  }
}
