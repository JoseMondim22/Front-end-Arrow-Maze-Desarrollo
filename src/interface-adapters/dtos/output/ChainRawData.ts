/** nodeIds is ordered tail -> head (§6.3) — the explicit order the backend sends,
 * never re-derived from edges. */
export interface ChainRawData {
  id: string;
  nodeIds: string[];
}
