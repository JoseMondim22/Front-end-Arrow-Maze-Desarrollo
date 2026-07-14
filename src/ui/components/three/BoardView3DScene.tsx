import { Canvas, useThree } from '@react-three/fiber/native';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { CellView as CellViewModel } from '../../../domain/game-session/BoardView';
import type { GridPosition3D } from '../../../domain/shared/value-objects/GridPosition3D';
import { colors, radii, spacing } from '../../theme';
import type { BoardRendererProps } from '../BoardRenderer';
import { ArrowChain3D } from './ArrowChain3D';
import { BoardDimensions } from './axisMapping';
import { Grid3DTerrain } from './Grid3DTerrain';

const MAX_CANVAS_SIZE = 420;
const HORIZONTAL_MARGIN = spacing.lg * 2;
const ROTATE_STEP = Math.PI / 8;
// Keeps the camera from crossing the poles, where azimuth becomes meaningless
// and the view flips.
const POLAR_MIN = 0.15;
const POLAR_MAX = Math.PI - 0.15;
// Reproduces the original fixed [d, d, d] camera position in spherical terms.
const INITIAL_AZIMUTH = Math.PI / 4;
const INITIAL_POLAR = Math.acos(1 / Math.sqrt(3));

// Safe here: BoardView3DScene is only ever mounted for a grid3d BoardView.
function asGrid3D(position: CellViewModel['position']): GridPosition3D {
  return position as GridPosition3D;
}

function computeDimensions(cells: readonly CellViewModel[]): BoardDimensions {
  let rows = 0;
  let columns = 0;
  let layers = 0;
  for (const cell of cells) {
    const position = asGrid3D(cell.position);
    rows = Math.max(rows, position.rowIndex + 1);
    columns = Math.max(columns, position.columnIndex + 1);
    layers = Math.max(layers, position.layerIndex + 1);
  }
  return { rows, columns, layers };
}

interface CameraRigProps {
  azimuth: number;
  polar: number;
  distance: number;
}

/** Repositions the camera on a sphere around the board's center whenever the
 * azimuth/polar state (driven by the D-pad below the canvas) changes. Lives
 * inside Canvas because only there does useThree() expose the live camera. */
function CameraRig({ azimuth, polar, distance }: CameraRigProps): null {
  const { camera } = useThree();

  useEffect(() => {
    const x = distance * Math.sin(polar) * Math.cos(azimuth);
    const y = distance * Math.cos(polar);
    const z = distance * Math.sin(polar) * Math.sin(azimuth);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, [camera, azimuth, polar, distance]);

  return null;
}

/**
 * Real 3D renderer for grid3d boards: a cube of voxels viewed from an
 * orbiting camera. Camera rotation is driven by the D-pad below the canvas
 * (not touch-drag on the canvas itself): React Three Fiber's native Canvas
 * unconditionally wins the RN gesture responder over any ancestor View
 * (pmndrs/react-three-fiber#3332), so a drag-to-orbit gesture on the same
 * surface as tappable chain segments isn't viable here. Only ArrowChain
 * segments are tappable: Grid3DTerrain never registers a pointer handler, so
 * walls are purely visual and can never be tapped by mistake.
 */
export function BoardView3DScene({ view, onMoveChain, onRotateChain }: BoardRendererProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const dims = useMemo(() => computeDimensions(view.cells), [view.cells]);
  const [azimuth, setAzimuth] = useState(INITIAL_AZIMUTH);
  const [polar, setPolar] = useState(INITIAL_POLAR);

  const size = Math.min(MAX_CANVAS_SIZE, width - HORIZONTAL_MARGIN);
  const maxDim = Math.max(dims.rows, dims.columns, dims.layers, 1);
  const cameraDistance = maxDim * 1.6;

  const rotateLeft = (): void => setAzimuth((current) => current - ROTATE_STEP);
  const rotateRight = (): void => setAzimuth((current) => current + ROTATE_STEP);
  const rotateUp = (): void => setPolar((current) => Math.max(POLAR_MIN, current - ROTATE_STEP));
  const rotateDown = (): void => setPolar((current) => Math.min(POLAR_MAX, current + ROTATE_STEP));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size }]}>
        <Canvas camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} />
          <CameraRig azimuth={azimuth} polar={polar} distance={cameraDistance} />
          <Grid3DTerrain cells={view.cells} dims={dims} />
          {view.chains.map((chain) => (
            <ArrowChain3D
              key={chain.chainId.toString()}
              chain={chain}
              dims={dims}
              onMove={onMoveChain}
              onRotate={onRotateChain}
            />
          ))}
        </Canvas>
      </View>

      <View style={styles.dPad}>
        <TouchableOpacity style={styles.dPadButton} onPress={rotateUp}>
          <Text style={styles.dPadGlyph}>▲</Text>
        </TouchableOpacity>
        <View style={styles.dPadMiddleRow}>
          <TouchableOpacity style={styles.dPadButton} onPress={rotateLeft}>
            <Text style={styles.dPadGlyph}>◀</Text>
          </TouchableOpacity>
          <View style={styles.dPadSpacer} />
          <TouchableOpacity style={styles.dPadButton} onPress={rotateRight}>
            <Text style={styles.dPadGlyph}>▶</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.dPadButton} onPress={rotateDown}>
          <Text style={styles.dPadGlyph}>▼</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const D_PAD_BUTTON_SIZE = 44;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  dPad: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  dPadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dPadSpacer: {
    width: D_PAD_BUTTON_SIZE,
  },
  dPadButton: {
    width: D_PAD_BUTTON_SIZE,
    height: D_PAD_BUTTON_SIZE,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xs,
  },
  dPadGlyph: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
});
