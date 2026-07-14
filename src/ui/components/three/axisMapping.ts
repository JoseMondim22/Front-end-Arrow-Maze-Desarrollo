import type { GridPosition3D } from '../../../domain/shared/value-objects/GridPosition3D';

/** How many nodes a grid3d board spans along each axis — derived once from
 * the render projection, shared by terrain and chain segments so everything
 * lands in the same coordinate space. */
export interface BoardDimensions {
  rows: number;
  columns: number;
  layers: number;
}

/** World-space distance between adjacent voxel centers. */
export const CELL_SPACING = 1.1;

/**
 * Node position -> world-space [x, y, z], centered on the board's own bounds.
 * Mirrors the axis mapping documented on GridPosition3D itself (§ domain):
 *   row    -> X (left/right)
 *   column -> Z (backward/forward, depth)
 *   layer  -> Y, inverted (layer 0 on top, like the earlier 2D-stack placeholder)
 */
export function positionToVector3(
  position: GridPosition3D,
  dims: BoardDimensions,
): [number, number, number] {
  const x = (position.rowIndex - (dims.rows - 1) / 2) * CELL_SPACING;
  const y = ((dims.layers - 1) / 2 - position.layerIndex) * CELL_SPACING;
  const z = (position.columnIndex - (dims.columns - 1) / 2) * CELL_SPACING;
  return [x, y, z];
}

/** Unit vector for each 3D heading, using the same axis mapping above — the
 * 3D equivalent of the 2D ▲ glyph rotation, used to orient the head's cone. */
export const DIRECTION_TO_VECTOR: Record<string, [number, number, number]> = {
  up: [0, 1, 0],
  down: [0, -1, 0],
  left: [-1, 0, 0],
  right: [1, 0, 0],
  backward: [0, 0, -1],
  forward: [0, 0, 1],
};
