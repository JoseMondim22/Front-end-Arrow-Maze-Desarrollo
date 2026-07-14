import type { ComponentType } from 'react';
import type { BoardView as BoardViewModel } from '../../domain/game-session/BoardView';
import type { ChainId } from '../../domain/shared/value-objects/ChainId';
import { BoardView } from './BoardView';
import type { Grid2DBoardView } from './grid2dTypes';
import { BoardView3DScene } from './three/BoardView3DScene';

export interface BoardRendererProps {
  view: BoardViewModel;
  onMoveChain: (chainId: ChainId) => void;
  onRotateChain: (chainId: ChainId) => void;
}

/**
 * Picks the concrete renderer for view.boardKind (same "raw discriminator -> switch,
 * default to the known case" shape as CellFactory/CellView's TERRAIN_COLOR table).
 * Adding a new board shape's renderer later is one new registry entry here — the
 * existing 2D renderer never changes.
 *
 * BoardView.cells[].position/ChainView.segments are the domain's generic Position
 * now (any geometry). This is the single boundary in the UI where we narrow that
 * back to GridPosition for the 2D renderer — safe because boardKind === 'grid2d'
 * guarantees every position in this view actually is one.
 */
const RENDERERS: Record<string, ComponentType<BoardRendererProps>> = {
  grid2d: (props) => <BoardView {...props} view={props.view as unknown as Grid2DBoardView} />,
  grid3d: BoardView3DScene,
};

export function BoardRenderer(props: BoardRendererProps): React.JSX.Element {
  const Renderer = RENDERERS[props.view.boardKind] ?? RENDERERS.grid2d;
  return <Renderer {...props} />;
}
