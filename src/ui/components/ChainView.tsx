import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { GridPosition } from '../../domain/shared/value-objects/GridPosition';
import type { ChainView as ChainViewModel } from '../../domain/game-session/BoardView';
import { colors, radii } from '../theme';

interface Props {
  chain: ChainViewModel;
  cellSize: number;
  onMove: () => void;
  onRotate: () => void;
  /** True for the ghost BoardView keeps mounted after a chain exits (§6.4:
   * ArrowChainExited removes it from GameSession.view in the same tick it
   * happens), so it can play an exit animation instead of vanishing. */
  isExiting?: boolean;
  /** How many extra cells to keep sliding straight past the exit tile, once
   * every segment has caught up to where the one ahead of it used to be.
   * BoardView sizes this from the board's own row/column count so the whole
   * chain is guaranteed to clear the visible (overflow: hidden) area. */
  exitTravelCells?: number;
  onExitAnimationEnd?: () => void;
}

const DOUBLE_TAP_WINDOW_MS = 300;
const SLIDE_DURATION_MS = 180;
const ROTATE_DURATION_MS = 150;
const EXIT_STEP_DURATION_MS = 130;

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

/** Unit step in the head's direction — used to keep extending the trail
 * straight past the exit tile once the chain has no more real nodes to follow. */
function directionDelta(directionId: string): { x: number; y: number } {
  switch (directionId) {
    case 'up':
      return { x: 0, y: -1 };
    case 'right':
      return { x: 1, y: 0 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

function pixelsOf(position: GridPosition, cellSize: number): { x: number; y: number } {
  return { x: position.columnIndex * cellSize, y: position.rowIndex * cellSize };
}

/** Animates each segment's ValueXY toward its new pixel position whenever the
 * chain slides — one Animated.ValueXY per segment index, kept in a ref because
 * segment count is invariant for a chain still on the board (only a whole-chain
 * exit removes it, which unmounts this component instead of resizing the list).
 * On first mount (or an actual length change) positions are set directly with
 * no animation, since there is no "previous" position to slide from. */
function useSegmentAnimations(segments: readonly GridPosition[], cellSize: number): Animated.ValueXY[] {
  const animsRef = useRef<Animated.ValueXY[] | null>(null);
  const targetsRef = useRef<Array<{ x: number; y: number }>>([]);

  // Synchronous init on mount (or a length change): mutating a ref inside
  // useEffect wouldn't trigger a re-render, so the very first paint needs
  // its ValueXYs to already exist when this render's JSX reads them.
  if (animsRef.current === null || animsRef.current.length !== segments.length) {
    const targets = segments.map((position) => pixelsOf(position, cellSize));
    animsRef.current = targets.map((target) => new Animated.ValueXY(target));
    targetsRef.current = targets;
  }

  useEffect(() => {
    const targets = segments.map((position) => pixelsOf(position, cellSize));
    const anims = animsRef.current;
    if (anims === null) {
      return;
    }

    const animations = targets
      .map((target, index) => ({ target, index, previous: targetsRef.current[index] }))
      .filter(({ target, previous }) => previous.x !== target.x || previous.y !== target.y)
      .map(({ target, index }) =>
        Animated.timing(anims[index], {
          toValue: target,
          duration: SLIDE_DURATION_MS,
          useNativeDriver: true,
        }),
      );

    targetsRef.current = targets;
    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [segments, cellSize]);

  return animsRef.current;
}

/** Animates the head's rotation glyph. Tracks an unbounded degree count (rather
 * than snapping to 0-270) so the 270 -> 0 wrap still spins forward one more
 * quarter-turn instead of visually spinning backward three. */
function useHeadRotationAnimation(directionId: string): Animated.Value {
  const rotationValue = useRef(new Animated.Value(rotationDegreesFor(directionId))).current;
  const continuousDegreesRef = useRef(rotationDegreesFor(directionId));
  const previousDirectionIdRef = useRef(directionId);

  useEffect(() => {
    if (previousDirectionIdRef.current === directionId) {
      return;
    }
    const from = rotationDegreesFor(previousDirectionIdRef.current);
    const to = rotationDegreesFor(directionId);
    const clockwiseStep = ((to - from) % 360 + 360) % 360;

    continuousDegreesRef.current += clockwiseStep;
    previousDirectionIdRef.current = directionId;

    Animated.timing(rotationValue, {
      toValue: continuousDegreesRef.current,
      duration: ROTATE_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [directionId, rotationValue]);

  return rotationValue;
}

/** Once a chain exits, there are no more real nodes to follow, so this fakes
 * the rest of the trail purely in pixels: segment `i` walks through the exact
 * spots segment `i + 1` used to occupy (the same "follow the one ahead" rule
 * moveArrow itself uses), then — once it runs out of real ancestors — keeps
 * going straight in the head's direction for `travelCells` more, guaranteeing
 * it clears the board's `overflow: hidden` area instead of stopping in view. */
function useExitAnimation(params: {
  isExiting: boolean;
  segments: readonly GridPosition[];
  headDirectionId: string;
  cellSize: number;
  travelCells: number;
  segmentAnimations: Animated.ValueXY[];
  onDone?: () => void;
}): void {
  const { isExiting, segments, headDirectionId, cellSize, travelCells, segmentAnimations, onDone } =
    params;

  useEffect(() => {
    if (!isExiting) {
      return;
    }
    const basePositions = segments.map((position) => pixelsOf(position, cellSize));
    const headBase = basePositions[basePositions.length - 1];
    const delta = directionDelta(headDirectionId);
    const deltaPx = { x: delta.x * cellSize, y: delta.y * cellSize };
    const extraSteps = Math.max(1, travelCells);

    const trails = segmentAnimations.map((anim, index) => {
      const waypoints: Array<{ x: number; y: number }> = [];
      for (let ahead = index + 1; ahead < basePositions.length; ahead += 1) {
        waypoints.push(basePositions[ahead]);
      }
      for (let step = 1; step <= extraSteps; step += 1) {
        waypoints.push({ x: headBase.x + deltaPx.x * step, y: headBase.y + deltaPx.y * step });
      }
      return Animated.sequence(
        waypoints.map((point) =>
          Animated.timing(anim, {
            toValue: point,
            duration: EXIT_STEP_DURATION_MS,
            useNativeDriver: true,
          }),
        ),
      );
    });

    Animated.parallel(trails).start(({ finished }) => {
      if (finished) {
        onDone?.();
      }
    });
    // Runs once, the moment this ghost instance mounts with isExiting=true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExiting]);
}

/**
 * §6.4: a single tap slides the chain (moveArrow), a double tap (within
 * DOUBLE_TAP_WINDOW_MS) rotates its head instead (rotateArrow). React Native has
 * no built-in double-tap gesture, so the first tap is held back briefly to see
 * if a second one arrives before committing to a move. Any segment (head or
 * body) can be tapped — the whole chain is one unit.
 */
export function ChainView({
  chain,
  cellSize,
  onMove,
  onRotate,
  isExiting = false,
  exitTravelCells = 0,
  onExitAnimationEnd,
}: Props): React.JSX.Element {
  const lastTapAt = useRef(0);
  const pendingMove = useRef<ReturnType<typeof setTimeout> | null>(null);
  const segmentAnimations = useSegmentAnimations(chain.segments, cellSize);
  const rotationDegrees = useHeadRotationAnimation(chain.headDirection.id);

  useExitAnimation({
    isExiting,
    segments: chain.segments,
    headDirectionId: chain.headDirection.id,
    cellSize,
    travelCells: exitTravelCells,
    segmentAnimations,
    onDone: onExitAnimationEnd,
  });

  const handlePress = (): void => {
    if (isExiting) {
      return;
    }
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
      {chain.segments.map((_, index) => {
        const isHead = index === chain.segments.length - 1;
        const anim = segmentAnimations[index];
        if (anim === undefined) {
          return null;
        }
        return (
          <Animated.View
            key={`${chain.chainId.toString()}-${index}`}
            style={[
              styles.segment,
              {
                width: cellSize,
                height: cellSize,
                transform: anim.getTranslateTransform(),
              },
            ]}
            pointerEvents={isExiting ? 'none' : 'auto'}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePress}
              disabled={isExiting}
              style={styles.touchArea}
            >
              <View style={styles.body}>
                {isHead && (
                  <Animated.Text
                    style={[
                      styles.arrow,
                      {
                        transform: [
                          {
                            rotate: rotationDegrees.interpolate({
                              inputRange: [0, 360],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    {'▲'}
                  </Animated.Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  segment: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 3,
  },
  touchArea: {
    flex: 1,
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
