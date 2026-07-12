import { CellNode } from '../shared/board/CellNode';
import { CellType } from '../shared/board/cells/CellType';
import { DomainError } from '../shared/errors/DomainError';
import { ChainId } from '../shared/value-objects/ChainId';
import { Direction } from '../shared/value-objects/Direction';
import { NodeId } from '../shared/value-objects/NodeId';
import { ArrowChain } from './ArrowChain';

/**
 * Directional neighbours of a node, precomputed once by BoardBuilder from the grid
 * positions. null means "no node in that direction" (edge of the graph).
 */
export interface DirectionalAdjacency {
  up: NodeId | null;
  right: NodeId | null;
  down: NodeId | null;
  left: NodeId | null;
}

/** Result of attempting to slide a chain. See §6.4. 'Stopped' cannot happen under
 * the all-or-nothing rule: a chain either escapes or reverts wholesale. */
export type SlideOutcome = 'Exited' | 'Reverted';

/**
 * Internal, immutable entity of the GameSession aggregate. Holds the static terrain,
 * the precomputed directional adjacency (the game NEVER reads row/column again) and
 * the chains still on the board.
 *
 * "Mutable entity" in the domain sense (its state evolves across the session), but
 * implemented as a persistent structure: every operation returns a NEW Board, which
 * keeps the whole aggregate deterministic and testable in isolation.
 *
 * Because moves are all-or-nothing, a committed Board only ever changes by REMOVING
 * a chain that exited; a reverted chain is left exactly as it was.
 */
export class Board {
  private constructor(
    private readonly terrain: ReadonlyMap<string, CellType>,
    private readonly adjacency: ReadonlyMap<string, DirectionalAdjacency>,
    private readonly activeChains: readonly ArrowChain[],
  ) {}

  static create(params: {
    nodes: readonly CellNode[];
    adjacency: ReadonlyMap<string, DirectionalAdjacency>;
    chains: readonly ArrowChain[];
  }): Board {
    const terrain = new Map<string, CellType>();
    for (const node of params.nodes) {
      terrain.set(node.id.toString(), node.terrain);
    }
    return new Board(terrain, params.adjacency, [...params.chains]);
  }

  get chains(): readonly ArrowChain[] {
    return this.activeChains;
  }

  /** Is any chain standing on this node right now? */
  isOccupied(nodeId: NodeId): boolean {
    return this.activeChains.some((chain) => chain.occupies(nodeId));
  }

  /**
   * Slide a chain in its head direction until it escapes through an exit or is
   * blocked. Blocked (wall / edge / another chain / its own body) => the chain
   * reverts wholesale and the board is unchanged. Escaped => the board is returned
   * without that chain.
   */
  slideChain(chainId: ChainId): { board: Board; outcome: SlideOutcome } {
    const chain = this.findChain(chainId);
    const direction = chain.direction;

    // Simulated occupancy of THIS chain as its head walks forward, tail -> head.
    let occupied: readonly NodeId[] = chain.nodeIds;
    let head = chain.head;

    // The head can visit each node at most once, so the node count bounds the walk.
    const maxSteps = this.terrain.size;
    for (let step = 0; step < maxSteps; step += 1) {
      const next = this.neighbourOf(head, direction);
      if (next === null) {
        return { board: this, outcome: 'Reverted' };
      }

      const cell = this.terrainAt(next);
      if (!cell.isPassable()) {
        return { board: this, outcome: 'Reverted' };
      }
      if (cell.id === 'exit') {
        const remaining = this.activeChains.filter((c) => !c.id.equals(chainId));
        return {
          board: new Board(this.terrain, this.adjacency, remaining),
          outcome: 'Exited',
        };
      }

      // Empty floor: blocked by another chain, or by our own body that does not
      // vacate this step (the tail, occupied[0], is the only node we free).
      if (this.isOccupiedByOther(next, chainId)) {
        return { board: this, outcome: 'Reverted' };
      }
      if (occupied.slice(1).some((id) => id.equals(next))) {
        return { board: this, outcome: 'Reverted' };
      }

      occupied = [...occupied.slice(1), next];
      head = next;
    }

    // Unreachable in a finite graph, but stay safe rather than loop forever.
    return { board: this, outcome: 'Reverted' };
  }

  /** Rotate one chain's head 90 clockwise, returning a new board. */
  rotateChain(chainId: ChainId): Board {
    this.findChain(chainId);
    const rotated = this.activeChains.map((chain) =>
      chain.id.equals(chainId) ? chain.rotate() : chain,
    );
    return new Board(this.terrain, this.adjacency, rotated);
  }

  /**
   * Can this chain move at all? A move is legal if the FIRST step in ANY of the four
   * head directions is not blocked (rotating to that direction is free, so it counts
   * as an escape route). Used for deadlock detection. See §7 decision 9.
   */
  hasLegalMove(chainId: ChainId): boolean {
    const chain = this.findChain(chainId);
    const adjacency = this.adjacency.get(chain.head.toString());
    if (adjacency === undefined) {
      return false;
    }
    const neighbours: ReadonlyArray<NodeId | null> = [
      adjacency.up,
      adjacency.right,
      adjacency.down,
      adjacency.left,
    ];
    return neighbours.some((next) => this.isFirstStepLegal(next, chain));
  }

  private isFirstStepLegal(next: NodeId | null, chain: ArrowChain): boolean {
    if (next === null) {
      return false;
    }
    const cell = this.terrainAt(next);
    if (!cell.isPassable()) {
      return false;
    }
    if (cell.id === 'exit') {
      return true;
    }
    if (this.isOccupiedByOther(next, chain.id)) {
      return false;
    }
    // The tail vacates on the first step, so only the body ahead of it can block.
    return !chain.nodeIds.slice(1).some((id) => id.equals(next));
  }

  private isOccupiedByOther(nodeId: NodeId, exceptChainId: ChainId): boolean {
    return this.activeChains.some(
      (chain) => !chain.id.equals(exceptChainId) && chain.occupies(nodeId),
    );
  }

  private neighbourOf(nodeId: NodeId, direction: Direction): NodeId | null {
    const adjacency = this.adjacency.get(nodeId.toString());
    if (adjacency === undefined) {
      return null;
    }
    switch (direction.id) {
      case 'up':
        return adjacency.up;
      case 'right':
        return adjacency.right;
      case 'down':
        return adjacency.down;
      case 'left':
        return adjacency.left;
      default:
        throw new DomainError(`Unknown direction: ${direction.id}`);
    }
  }

  private terrainAt(nodeId: NodeId): CellType {
    const cell = this.terrain.get(nodeId.toString());
    if (cell === undefined) {
      throw new DomainError(`No terrain for node: ${nodeId.toString()}`);
    }
    return cell;
  }

  private findChain(chainId: ChainId): ArrowChain {
    const chain = this.activeChains.find((c) => c.id.equals(chainId));
    if (chain === undefined) {
      throw new DomainError(`No chain with id: ${chainId.toString()}`);
    }
    return chain;
  }
}
