import { useRef } from 'react';

const DOUBLE_TAP_WINDOW_MS = 300;

/**
 * §6.4: a single tap slides a chain (moveArrow), a double tap (within
 * DOUBLE_TAP_WINDOW_MS) rotates its head instead (rotateArrow). Neither React
 * Native nor React Three Fiber's pointer events have a built-in double-tap
 * gesture, so the first tap is held back briefly to see if a second one
 * arrives before committing to a move. Shared by the 2D (ChainView) and 3D
 * (ChainSegment3D) chain renderers — same rule, same timing, one place.
 */
export function useTapOrDoubleTap(
  onMove: () => void,
  onRotate: () => void,
  disabled = false,
): () => void {
  const lastTapAt = useRef(0);
  const pendingMove = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (): void => {
    if (disabled) {
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
}
