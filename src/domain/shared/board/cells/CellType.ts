/**
 * The discriminator carried by every cell. Lets the domain branch on terrain kind
 * without leaking concrete classes or resorting to instanceof.
 */
export type CellTypeId = 'grid_arrow' | 'wall' | 'empty' | 'exit';

/**
 * Static terrain of a single node.
 *
 * Deliberately minimal (Interface Segregation): a cell only knows its kind and
 * whether it structurally blocks movement. Rotation is NOT here — that is a chain
 * concern (see IRotatable), not a terrain concern.
 */
export interface CellType {
  readonly id: CellTypeId;
  isPassable(): boolean;
}
