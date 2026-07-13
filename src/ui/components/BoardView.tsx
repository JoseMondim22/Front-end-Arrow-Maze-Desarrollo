import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { BoardView as BoardViewModel } from '../../domain/game-session/BoardView';
import type { ChainId } from '../../domain/shared/value-objects/ChainId';
import { colors, radii, spacing } from '../theme';
import { CellView } from './CellView';
import { ChainView } from './ChainView';

interface Props {
  view: BoardViewModel;
  onMoveChain: (chainId: ChainId) => void;
  onRotateChain: (chainId: ChainId) => void;
}

const MAX_CELL_SIZE = 56;
const HORIZONTAL_MARGIN = spacing.lg * 2;

/**
 * GoF Composite (§11): renders the read-only BoardView projection — a uniform
 * list of terrain cells and chain trains, both just "things with grid positions".
 * Carries zero game logic; taps are forwarded up so GameScreen can call
 * useGameStore's moveArrow/rotateArrow.
 */
export function BoardView({ view, onMoveChain, onRotateChain }: Props): React.JSX.Element {
  const { width } = useWindowDimensions();
  const rows = Math.max(0, ...view.cells.map((cell) => cell.position.rowIndex)) + 1;
  const columns = Math.max(0, ...view.cells.map((cell) => cell.position.columnIndex)) + 1;
  const cellSize = Math.min(MAX_CELL_SIZE, Math.floor((width - HORIZONTAL_MARGIN) / columns));

  return (
    <View style={[styles.board, { width: columns * cellSize, height: rows * cellSize }]}>
      {view.cells.map((cell) => (
        <CellView key={cell.nodeId.toString()} cell={cell} cellSize={cellSize} />
      ))}
      {view.chains.map((chain) => (
        <ChainView
          key={chain.chainId.toString()}
          chain={chain}
          cellSize={cellSize}
          onMove={() => onMoveChain(chain.chainId)}
          onRotate={() => onRotateChain(chain.chainId)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
});
