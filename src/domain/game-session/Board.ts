import { CellNode } from '../shared/board/CellNode';
import { CellType } from '../shared/board/cells/CellType';
import { DomainError } from '../shared/errors/DomainError';
import { ChainId } from '../shared/value-objects/ChainId';
import { Direction } from '../shared/value-objects/Direction';
import { GridPosition } from '../shared/value-objects/GridPosition';
import { NodeId } from '../shared/value-objects/NodeId';
import { Position } from '../shared/value-objects/Position';
import { ArrowChain } from './ArrowChain';
import { BoardView, CellView, ChainView } from './BoardView';

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
    private readonly positions: ReadonlyMap<string, Position>,
    private readonly adjacency: ReadonlyMap<string, DirectionalAdjacency>,
    private readonly activeChains: readonly ArrowChain[],
  ) {}

  static create(params: {
    nodes: readonly CellNode[];
    adjacency: ReadonlyMap<string, DirectionalAdjacency>;
    chains: readonly ArrowChain[];
  }): Board {
    const terrain = new Map<string, CellType>();
    const positions = new Map<string, Position>();
    for (const node of params.nodes) {
      terrain.set(node.id.toString(), node.terrain);
      positions.set(node.id.toString(), node.at);
    }
    return new Board(terrain, positions, params.adjacency, [...params.chains]);
  }

  get chains(): readonly ArrowChain[] {
    return this.activeChains;
  }

  /**
   * Read-only render snapshot (§6.5 GameSession.view). Positions are ONLY used here
   * — this is the one place in the domain allowed to require a concrete GridPosition,
   * because a BoardView exists purely to be painted, never to resolve a rule.
   */
  toView(): BoardView {
    const cells = [...this.terrain.entries()].map(
      ([id, terrain]) =>
        new CellView(NodeId.of(id), this.gridPositionAt(id), terrain.id),
    );
    const chains = this.activeChains.map(
      (chain) =>
        new ChainView(
          chain.id,
          chain.nodeIds.map((nodeId) => this.gridPositionAt(nodeId.toString())),
          chain.direction,
        ),
    );
    return new BoardView(cells, chains);
  }

  private gridPositionAt(nodeKey: string): GridPosition {
    const position = this.positions.get(nodeKey);
    if (position === undefined) {
      throw new DomainError(`No position for node: ${nodeKey}`);
    }
    if (!(position instanceof GridPosition)) {
      throw new DomainError(`Node ${nodeKey} needs a GridPosition to render`);
    }
    return position;
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
          board: new Board(this.terrain, this.positions, this.adjacency, remaining),
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

  /**
   * Rotate one chain's head 90 clockwise, returning a new board. A chain with a
   * body (length > 1) can never face its own neck — that orientation would point
   * the arrow straight into itself, which is not a real move option — so that one
   * direction out of the four is skipped, landing on the next clockwise heading.
   */
  rotateChain(chainId: ChainId): Board {
    const chain = this.findChain(chainId);
    const neck = chain.nodeIds.length > 1 ? chain.nodeIds[chain.nodeIds.length - 2] : null;

    let rotated = chain.rotate();
    if (neck !== null) {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const facing = this.neighbourOf(chain.head, rotated.direction);
        if (facing === null || !facing.equals(neck)) {
          break;
        }
        rotated = rotated.rotate();
      }
    }

    const updatedChains = this.activeChains.map((c) => (c.id.equals(chainId) ? rotated : c));
    return new Board(this.terrain, this.positions, this.adjacency, updatedChains);
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
