import { CellTypeId } from '../shared/board/cells/CellType';
import { ChainId } from '../shared/value-objects/ChainId';
import { Direction } from '../shared/value-objects/Direction';
import { NodeId } from '../shared/value-objects/NodeId';
import { Position } from '../shared/value-objects/Position';

/**
 * Read-only render leaf: one terrain node, where to paint it (§6.1) and what kind
 * of ground it is. A grid_arrow seed never reaches here — BoardBuilder already
 * projects it to plain empty floor (§6.2), so terrain is always wall/empty/exit.
 * position is generic (any geometry) — the UI narrows it via BoardView.boardKind.
 */
export class CellView {
  constructor(
    readonly nodeId: NodeId,
    readonly position: Position,
    readonly terrain: CellTypeId,
  ) {}
}

/**
 * Read-only render composite: one ArrowChain's train of segments, tail -> head
 * (mirrors ArrowChain.nodeIds), plus the direction the head currently points to.
 */
export class ChainView {
  constructor(
    readonly chainId: ChainId,
    readonly segments: readonly Position[],
    readonly headDirection: Direction,
  ) {}

  get headPosition(): Position {
    return this.segments[this.segments.length - 1];
  }
}

/**
 * GoF Composite (§11, §6.5 GameSession.view): a uniform, read-only snapshot of the
 * board for the UI to paint — single cells and multi-node chains are both just
 * "things with positions", so BoardView/CellView/ChainView is all the UI needs to
 * render a frame; it never touches Board/ArrowChain/GameSession directly.
 *
 * Immutable and framework-free: no React, no Zustand — a pure domain read model.
 */
export class BoardView {
  constructor(
    readonly cells: readonly CellView[],
    readonly chains: readonly ChainView[],
  ) {}

  /** Self-describing discriminator (e.g. 'grid2d', 'grid3d') so the UI can pick a
   * renderer. Derived from any cell's position — every node in a board shares the
   * same geometry. Defaults to 'grid2d' for an (impossible in practice) empty board. */
  get boardKind(): string {
    return this.cells[0]?.position.kind ?? 'grid2d';
  }
}
