import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type {
  BoardView as BoardViewModel,
  ChainView as ChainViewModel,
} from '../../domain/game-session/BoardView';
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

  // Upper bound on how many cells a chain must keep sliding straight past the
  // exit tile to fully clear the board's clipped (overflow: hidden) area,
  // regardless of which edge it left through.
  const exitTravelCells = rows + columns;

  const knownChainsRef = useRef<Map<string, ChainViewModel>>(new Map());
  const [exitingChains, setExitingChains] = useState<readonly ChainViewModel[]>([]);

  useEffect(() => {
    const currentIds = new Set(view.chains.map((chain) => chain.chainId.toString()));
    const justExited = [...knownChainsRef.current.entries()]
      .filter(([id]) => !currentIds.has(id))
      .map(([, chain]) => chain);
    knownChainsRef.current = new Map(
      view.chains.map((chain) => [chain.chainId.toString(), chain]),
    );
    if (justExited.length > 0) {
      setExitingChains((current) => [...current, ...justExited]);
    }
  }, [view.chains]);

  const handleExitAnimationEnd = (chainId: string): void => {
    setExitingChains((current) => current.filter((chain) => chain.chainId.toString() !== chainId));
  };

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
      {exitingChains.map((chain) => (
        <ChainView
          key={`exiting-${chain.chainId.toString()}`}
          chain={chain}
          cellSize={cellSize}
          onMove={() => {}}
          onRotate={() => {}}
          isExiting
          exitTravelCells={exitTravelCells}
          onExitAnimationEnd={() => handleExitAnimationEnd(chain.chainId.toString())}
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
