import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

interface Props {
  movesUsed: number;
  maxMoves: number;
  activeChainCount: number;
  timeUsedSeconds: number;
  timeLimitSeconds: number;
}

function formatSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Read-only strip above the board (§4 checklist) — no game logic, just numbers
 * already computed by GameSession, handed down by GameScreen. */
export function HUD({
  movesUsed,
  maxMoves,
  activeChainCount,
  timeUsedSeconds,
  timeLimitSeconds,
}: Props): React.JSX.Element {
  const timeLeft = timeLimitSeconds - timeUsedSeconds;

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.label}>Moves</Text>
        <Text style={styles.value}>
          {movesUsed}/{maxMoves}
        </Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Time left</Text>
        <Text style={styles.value}>{formatSeconds(timeLeft)}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Chains left</Text>
        <Text style={styles.value}>{activeChainCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: { alignItems: 'center' },
  label: { ...typography.body, color: colors.textMuted, fontSize: 12 },
  value: { ...typography.heading, color: colors.text },
});
