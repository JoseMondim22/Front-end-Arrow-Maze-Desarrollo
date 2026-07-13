import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Defeat'>;

// GameScreen owns starting a session for a level (it does so on every mount), so
// retrying here is just a fresh navigation — no need to call startGame twice.
export function DefeatScreen({ route, navigation }: Props): React.JSX.Element {
  const { level } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💥</Text>
      <Text style={styles.title}>Defeat</Text>
      <Text style={styles.subtitle}>No more legal moves left</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Game', { level })}
      >
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('LevelSelect')}>
        <Text style={styles.link}>Back to levels</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.title, color: colors.danger },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.danger,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: { ...typography.button, color: colors.surface },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
});
