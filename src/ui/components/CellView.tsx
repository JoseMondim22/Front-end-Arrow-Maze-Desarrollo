import { StyleSheet, View } from 'react-native';
import { CellTypeId } from '../../domain/shared/board/cells/CellType';
import type { CellView as CellViewModel } from '../../domain/game-session/BoardView';
import { colors } from '../theme';

interface Props {
  cell: CellViewModel;
  cellSize: number;
}

// 'grid_arrow' never reaches runtime terrain — BoardBuilder always projects an
// arrow seed to plain empty floor (§6.2) before a Board exists to render.
const TERRAIN_COLOR: Record<CellTypeId, string> = {
  wall: colors.wall,
  empty: colors.empty,
  exit: colors.exit,
  grid_arrow: colors.empty,
};

export function CellView({ cell, cellSize }: Props): React.JSX.Element {
  return (
    <View
      style={[
        styles.cell,
        {
          left: cell.position.columnIndex * cellSize,
          top: cell.position.rowIndex * cellSize,
          width: cellSize,
          height: cellSize,
          backgroundColor: TERRAIN_COLOR[cell.terrain],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
});
