import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../infrastructure/di/container';
import { BoardView } from '../components/BoardView';
import { HUD } from '../components/HUD';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

/** Owns the session lifecycle for this level: starts it on mount, plays it via
 * useGameStore (moveArrow/rotateArrow, §4 Command pattern under the hood), and
 * hands off to Victory/Defeat the moment GameSession reaches a terminal status. */
export function GameScreen({ route, navigation }: Props): React.JSX.Element {
  const { level } = route.params;
  const session = useGameStore((state) => state.session);
  const isLoading = useGameStore((state) => state.isLoading);
  const error = useGameStore((state) => state.error);
  const startGame = useGameStore((state) => state.startGame);
  const moveArrow = useGameStore((state) => state.moveArrow);
  const rotateArrow = useGameStore((state) => state.rotateArrow);

  useEffect(() => {
    void startGame(level);
  }, [level, startGame]);

  useEffect(() => {
    if (session === null) {
      return;
    }
    if (session.status.name === 'Victory' && session.finalScore !== null) {
      navigation.replace('Victory', { score: session.finalScore.points });
    } else if (session.status.name === 'Defeat') {
      navigation.replace('Defeat', { level });
    }
  }, [session, navigation, level]);

  if (error !== null) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (isLoading || session === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HUD
        movesUsed={session.movesUsed}
        maxMoves={level.rules.maxMoves}
        activeChainCount={session.activeChainCount}
      />
      <BoardView
        view={session.view}
        onMoveChain={moveArrow}
        onRotateChain={rotateArrow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  error: { ...typography.body, color: colors.danger, textAlign: 'center' },
});
