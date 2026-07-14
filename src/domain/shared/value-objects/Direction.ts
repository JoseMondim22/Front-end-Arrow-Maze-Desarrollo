/**
 * Marker abstraction for the direction a chain head points to.
 *
 * A direction knows its own successor under a 90 clockwise rotation, because the
 * cyclic order of directions is a property of directions themselves, not of the
 * chain that happens to rotate. Kept behind an interface so the domain is not tied
 * to a compass/grid representation.
 */
export interface Direction {
  readonly id: string;
  rotateClockwise(): Direction;
  /** The heading that undoes this one (e.g. up <-> down). BoardBuilder uses this to
   * fill in the reverse adjacency entry for an edge's other endpoint. */
  opposite(): Direction;
  equals(other: Direction): boolean;
}
