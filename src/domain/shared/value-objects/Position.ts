/**
 * Marker abstraction for a board position.
 *
 * The game rules NEVER read a concrete position during play: movement is resolved
 * against the precomputed directional adjacency. A Position exists only so the UI
 * can paint a node somewhere. Keeping it behind an interface means the domain does
 * not commit to a grid representation.
 */
export interface Position {
  equals(other: Position): boolean;
}
