import { useLayoutEffect, useMemo, useRef } from 'react';
import { InstancedMesh, Object3D } from 'three';
import type { CellView as CellViewModel } from '../../../domain/game-session/BoardView';
import type { GridPosition3D } from '../../../domain/shared/value-objects/GridPosition3D';
import { colors } from '../../theme';
import { BoardDimensions, CELL_SPACING, positionToVector3 } from './axisMapping';

// Exactly CELL_SPACING (the distance between adjacent node centers): two
// neighboring wall cells' faces meet exactly, so a run of walls reads as one
// solid block instead of separate cubes with a visible gap between them.
const WALL_SIZE = CELL_SPACING;

// Safe here: Grid3DTerrain is only ever mounted for a grid3d BoardView, which
// guarantees every cell position is a GridPosition3D.
function asGrid3D(position: CellViewModel['position']): GridPosition3D {
  return position as GridPosition3D;
}

interface InstancedTerrainProps {
  cells: readonly CellViewModel[];
  dims: BoardDimensions;
  color: string;
  opacity: number;
}

/** One InstancedMesh (one draw call) for every cell of a single terrain kind,
 * regardless of how many there are — the test level has 343 nodes. */
function InstancedTerrain({ cells, dims, color, opacity }: InstancedTerrainProps): React.JSX.Element | null {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (mesh === null) {
      return;
    }
    cells.forEach((cell, index) => {
      const [x, y, z] = positionToVector3(asGrid3D(cell.position), dims);
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [cells, dims, dummy]);

  if (cells.length === 0) {
    return null;
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cells.length]} frustumCulled={false}>
      <boxGeometry args={[WALL_SIZE, WALL_SIZE, WALL_SIZE]} />
      <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} />
    </instancedMesh>
  );
}

export interface Grid3DTerrainProps {
  cells: readonly CellViewModel[];
  dims: BoardDimensions;
}

/**
 * Static, non-interactive terrain: only walls render as an InstancedMesh.
 * Empty cells and exits render nothing — the hole lets the cube's interior
 * structure show through. Deliberately carries no pointer handlers anywhere
 * in this file: exits (and walls) must never be tappable, only ArrowChain
 * segments are (ChainSegment3D).
 */
export function Grid3DTerrain({ cells, dims }: Grid3DTerrainProps): React.JSX.Element {
  const walls = cells.filter((cell) => cell.terrain === 'wall');

  return <InstancedTerrain cells={walls} dims={dims} color={colors.wall} opacity={1} />;
}
