import type {
  BoardView as BoardViewModel,
  CellView as CellViewModel,
  ChainView as ChainViewModel,
} from '../../domain/game-session/BoardView';
import type { GridPosition } from '../../domain/shared/value-objects/GridPosition';

/**
 * Type-only narrowing of the domain's generic render projection down to the 2D
 * grid shape the existing 2D components already know how to paint. Zero runtime
 * effect — the object handed in is a real BoardView instance; this only tells
 * TypeScript what BoardRenderer already knows at its boundary
 * (view.boardKind === 'grid2d' => every position is a GridPosition).
 */
export type Grid2DCellView = Omit<CellViewModel, 'position'> & { position: GridPosition };

export type Grid2DChainView = Omit<ChainViewModel, 'segments' | 'headPosition'> & {
  segments: readonly GridPosition[];
  headPosition: GridPosition;
};

export type Grid2DBoardView = Omit<BoardViewModel, 'cells' | 'chains'> & {
  cells: readonly Grid2DCellView[];
  chains: readonly Grid2DChainView[];
};
