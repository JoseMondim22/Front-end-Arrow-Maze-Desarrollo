import { useFrame } from '@react-three/fiber/native';
import { useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import { Quaternion, Vector3 } from 'three';
import type { ChainView as ChainViewModel } from '../../../domain/game-session/BoardView';
import type { ChainId } from '../../../domain/shared/value-objects/ChainId';
import type { GridPosition3D } from '../../../domain/shared/value-objects/GridPosition3D';
import { useTapOrDoubleTap } from '../../hooks/useTapOrDoubleTap';
import { chainPalette } from '../../theme';
import { BoardDimensions, CELL_SPACING, DIRECTION_TO_VECTOR, positionToVector3 } from './axisMapping';

const BODY_RADIUS = CELL_SPACING * 0.3;
const HEAD_RADIUS = BODY_RADIUS * 1.15;
const CONE_OFFSET = HEAD_RADIUS * 1.6;
// Same slide duration as the 2D ChainView, so both renderers feel identical.
const SLIDE_DURATION_MS = 180;
const UP = new Vector3(0, 1, 0);

/** Picks once per chain instance, same pattern as the 2D ChainView's
 * useRandomChainColor — stable across re-renders, keyed by chainId upstream.
 * Must be called once per CHAIN, not per node: ArrowChain3D is the component
 * BoardView3DScene keys by chainId, so every node it renders shares this. */
function useRandomChainColor(): string {
  const colorRef = useRef(chainPalette[Math.floor(Math.random() * chainPalette.length)]);
  return colorRef.current;
}

function DirectionCone({ directionId, color }: { directionId: string; color: string }): React.JSX.Element {
  const vector = DIRECTION_TO_VECTOR[directionId] ?? DIRECTION_TO_VECTOR.forward;

  // Plain arrays, not Vector3/Quaternion instances: R3F's applyProps identifies
  // the target's own three.js class by constructor before calling copy()/set(),
  // which fails across duplicate three module instances (see "Multiple instances
  // of Three.js being imported" warning) and falls back to a direct assignment —
  // Object3D.position/quaternion are read-only accessors, so that throws.
  const quaternion = useMemo((): [number, number, number, number] => {
    const target = new Vector3(...vector).normalize();
    const q = new Quaternion().setFromUnitVectors(UP, target);
    return [q.x, q.y, q.z, q.w];
  }, [vector]);

  const position = useMemo((): [number, number, number] => {
    const v = new Vector3(...vector).multiplyScalar(CONE_OFFSET);
    return [v.x, v.y, v.z];
  }, [vector]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <coneGeometry args={[HEAD_RADIUS * 0.7, HEAD_RADIUS * 1.6, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export interface ArrowChain3DProps {
  chain: ChainViewModel;
  dims: BoardDimensions;
  onMove: (chainId: ChainId) => void;
  onRotate: (chainId: ChainId) => void;
}

/**
 * One whole ArrowChain rendered as a continuous snake: a sphere per node
 * (tail to head) linked by same-radius, same-colored cylinders, plus a small
 * cone on the head pointing toward headDirection — the 3D equivalent of the
 * 2D ▲ glyph. Rendered once per chain (not once per node) so the random
 * color picked by useRandomChainColor is shared by every node and link
 * instead of re-rolling per segment.
 *
 * Movement is animated imperatively via useFrame instead of React
 * state/props: on a valid moveArrow, chain.segments changes to a new array
 * of grid positions, and — for a single-step slide — segment i's new
 * position is exactly where segment i+1 used to be. Sliding each node in a
 * straight line from its own previous position to its own new one therefore
 * reproduces "every node follows the node ahead of it" automatically, no
 * path-following bookkeeping needed. Node/link transforms live in refs
 * mutated per-frame (not React state) so this runs at the render's frame
 * rate without re-rendering React on every tick.
 */
export function ArrowChain3D({ chain, dims, onMove, onRotate }: ArrowChain3DProps): React.JSX.Element {
  const color = useRandomChainColor();
  const targetPositions = useMemo(
    () => chain.segments.map((position) => positionToVector3(position as GridPosition3D, dims)),
    [chain.segments, dims],
  );

  const nodeRefs = useRef<Array<Group | null>>([]);
  const linkRefs = useRef<Array<Mesh | null>>([]);
  const current = useRef<Vector3[] | null>(null);
  const from = useRef<Vector3[]>([]);
  const to = useRef<Vector3[]>([]);
  const animatingSince = useRef<number | null>(null);

  // Runs synchronously during render (not a useEffect, so there's no gap
  // between this commit and the next useFrame tick where a stale "not yet
  // animating" state could show through). Compares by VALUE, not by
  // chain.segments' array reference: GameSession is immutable (§7.4), so
  // even a no-op GameSession.tick() (GameScreen polls it every second for
  // the countdown) produces a brand new segments array with the same
  // numbers — reference equality would misfire an animation every tick.
  if (current.current === null || current.current.length !== targetPositions.length) {
    // A node-count change (mount, or a chain that grew/shrank) snaps
    // directly, since there's no "previous" position to slide from.
    current.current = targetPositions.map((position) => new Vector3(...position));
    from.current = current.current.map((vector) => vector.clone());
    to.current = current.current.map((vector) => vector.clone());
    animatingSince.current = null;
  } else {
    const changed = targetPositions.some((position, index) => {
      const target = to.current[index];
      return target.x !== position[0] || target.y !== position[1] || target.z !== position[2];
    });
    if (changed) {
      from.current = current.current.map((vector) => vector.clone());
      to.current = targetPositions.map((position) => new Vector3(...position));
      animatingSince.current = Date.now();
    }
  }

  useFrame(() => {
    const positions = current.current;
    if (positions === null) {
      return;
    }

    const startedAt = animatingSince.current;
    if (startedAt !== null) {
      const t = Math.min(1, (Date.now() - startedAt) / SLIDE_DURATION_MS);
      positions.forEach((position, index) => position.lerpVectors(from.current[index], to.current[index], t));
      if (t >= 1) {
        animatingSince.current = null;
      }
    }

    positions.forEach((position, index) => {
      nodeRefs.current[index]?.position.copy(position);
    });

    for (let index = 0; index < positions.length - 1; index += 1) {
      const link = linkRefs.current[index];
      if (link === null || link === undefined) {
        continue;
      }
      const start = positions[index];
      const end = positions[index + 1];
      const direction = end.clone().sub(start);
      const length = direction.length();
      link.position.copy(start).add(end).multiplyScalar(0.5);
      if (length > 0) {
        link.quaternion.setFromUnitVectors(UP, direction.normalize());
      }
      link.scale.set(1, length, 1);
    }
  });

  const handlePress = useTapOrDoubleTap(
    () => onMove(chain.chainId),
    () => onRotate(chain.chainId),
  );

  return (
    <group>
      {targetPositions.slice(1).map((_, index) => (
        <mesh
          key={`link-${index}`}
          ref={(instance) => {
            linkRefs.current[index] = instance;
          }}
        >
          {/* Unit height: the real length is applied every frame via scale.y in useFrame. */}
          <cylinderGeometry args={[BODY_RADIUS, BODY_RADIUS, 1, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {targetPositions.map((_, index) => {
        const isHead = index === targetPositions.length - 1;
        return (
          <group
            key={`node-${index}`}
            ref={(instance) => {
              nodeRefs.current[index] = instance;
            }}
          >
            <mesh onPointerDown={handlePress}>
              <sphereGeometry args={[isHead ? HEAD_RADIUS : BODY_RADIUS, 16, 12]} />
              <meshStandardMaterial color={color} />
            </mesh>
            {isHead && <DirectionCone directionId={chain.headDirection.id} color={color} />}
          </group>
        );
      })}
    </group>
  );
}
