/** Same literal set as CellFactory's CellRawData.type — no import between them:
 * the mapper is what bridges the two independently-declared shapes. */
export type CellTypeIdRaw = 'grid_arrow' | 'wall' | 'empty' | 'exit';

/** One node of a level's board, as the backend sends it (part of BoardDTO,
 * received via GET /levels — the front never sends board data). positionType
 * self-describes the node's geometry ('grid3d', ...); absent means a legacy 2D
 * board. layer is the third coordinate, present only on non-2D nodes. */
export interface NodeRawData {
  id: string;
  type: CellTypeIdRaw;
  row: number;
  column: number;
  layer?: number;
  positionType?: string;
  direction?: string;
}
