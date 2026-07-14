import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../infrastructure/di/container';
import { BoardRenderer } from '../components/BoardRenderer';
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
  const tick = useGameStore((state) => state.tick);

  // Gates the terminal-status effect below until THIS mount's startGame() has
  // actually resolved. Without it, on first mount both effects fire in the
  // same commit against the store's *previous* session (e.g. a leftover
  // Victory from the last level) — startGame's set({session: null, ...}) only
  // schedules a re-render, it doesn't happen before the sibling effect below
  // runs, so that effect would still see the stale terminal session and
  // redirect immediately, before the new level even loads.
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    hasLoadedRef.current = false;
    void startGame(level).then(() => {
      hasLoadedRef.current = true;
    });
  }, [level, startGame]);

  // GameSession.tick() no-ops once the session leaves Playing (§6.5), so this can
  // run unconditionally; the interval is cleared the moment the screen unmounts,
  // which happens right away on the Victory/Defeat replace below.
  useEffect(() => {
    const interval = setInterval(() => tick(1), 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    if (!hasLoadedRef.current || session === null) {
      return;
    }
    if (session.status.name === 'Victory' && session.finalScore !== null) {
      navigation.replace('Victory', { score: session.finalScore.points, level });
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
        timeUsedSeconds={session.timeUsed}
        timeLimitSeconds={level.rules.timeLimit}
      />
      <BoardRenderer
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
