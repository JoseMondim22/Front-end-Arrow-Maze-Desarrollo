import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ChainView as ChainViewModel } from '../../domain/game-session/BoardView';
import { colors, radii } from '../theme';

interface Props {
  chain: ChainViewModel;
  cellSize: number;
  onMove: () => void;
  onRotate: () => void;
}

const DOUBLE_TAP_WINDOW_MS = 300;

function rotationDegreesFor(directionId: string): number {
  switch (directionId) {
    case 'up':
      return 0;
    case 'right':
      return 90;
    case 'down':
      return 180;
    case 'left':
      return 270;
    default:
      return 0;
  }
}

/**
 * §6.4: a single tap slides the chain (moveArrow), a double tap (within
 * DOUBLE_TAP_WINDOW_MS) rotates its head instead (rotateArrow). React Native has
 * no built-in double-tap gesture, so the first tap is held back briefly to see
 * if a second one arrives before committing to a move.
 */
export function ChainView({ chain, cellSize, onMove, onRotate }: Props): React.JSX.Element {
  const lastTapAt = useRef(0);
  const pendingMove = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = (): void => {
    const now = Date.now();
    if (now - lastTapAt.current < DOUBLE_TAP_WINDOW_MS) {
      if (pendingMove.current !== null) {
        clearTimeout(pendingMove.current);
        pendingMove.current = null;
      }
      lastTapAt.current = 0;
      onRotate();
      return;
    }
    lastTapAt.current = now;
    pendingMove.current = setTimeout(() => {
      onMove();
    }, DOUBLE_TAP_WINDOW_MS);
  };

  return (
    <>
      {chain.segments.map((position, index) => {
        const isHead = index === chain.segments.length - 1;
        return (
          <TouchableOpacity
            key={`${chain.chainId.toString()}-${index}`}
            activeOpacity={0.7}
            onPress={handlePress}
            style={[
              styles.segment,
              {
                left: position.columnIndex * cellSize,
                top: position.rowIndex * cellSize,
                width: cellSize,
                height: cellSize,
              },
            ]}
          >
            <View style={styles.body}>
              {isHead && (
                <Text
                  style={[
                    styles.arrow,
                    { transform: [{ rotate: `${rotationDegreesFor(chain.headDirection.id)}deg` }] },
                  ]}
                >
                  {'▲'}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  segment: {
    position: 'absolute',
    padding: 3,
  },
  body: {
    flex: 1,
    backgroundColor: colors.chain,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: '700',
  },
});
