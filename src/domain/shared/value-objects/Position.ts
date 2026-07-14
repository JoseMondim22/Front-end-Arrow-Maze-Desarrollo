import { Direction } from './Direction';

/**
 * Marker abstraction for a board position.
 *
 * The game rules NEVER read a concrete position during play: movement is resolved
 * against the precomputed directional adjacency. A Position exists only so the UI
 * can paint a node somewhere, and so BoardBuilder can derive that adjacency once,
 * at build time. Keeping it behind an interface means the domain does not commit
 * to a single grid representation — 2D, 3D and future shapes (circular, hexagonal)
 * are all just Position implementations.
 */
export interface Position {
  equals(other: Position): boolean;

  /** How self reaches other in a single step, or null if they are not neighbours
   * in this geometry. BoardBuilder uses this to derive adjacency once from edges. */
  directionTo(other: Position): Direction | null;

  /** Self-describing discriminator (e.g. 'grid2d', 'grid3d'). Exists only so the UI
   * can pick a renderer for a BoardView — never read by game rules. */
  readonly kind: string;
}
