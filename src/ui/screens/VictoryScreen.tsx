import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLeaderboardStore, useLevelsStore } from '../../infrastructure/di/container';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Victory'>;

const LEADERBOARD_LIMIT = 10;

export function VictoryScreen({ route, navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { score, level } = route.params;
  const loadLevels = useLevelsStore((state) => state.loadLevels);
  const entries = useLeaderboardStore((state) => state.entries);
  const isLoadingLeaderboard = useLeaderboardStore((state) => state.isLoading);
  const loadLeaderboard = useLeaderboardStore((state) => state.loadLeaderboard);

  useEffect(() => {
    void loadLeaderboard({ levelId: level.id, limit: LEADERBOARD_LIMIT });
  }, [level, loadLeaderboard]);

  const handleNext = async (): Promise<void> => {
    await loadLevels();
    navigation.navigate('LevelSelect');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>{t('victory.title')}</Text>
      <Text style={styles.score}>{t('victory.points', { score })}</Text>

      <View style={styles.leaderboard}>
        <Text style={styles.leaderboardTitle}>{t('leaderboard.title')}</Text>
        {isLoadingLeaderboard ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : entries.length === 0 ? (
          <Text style={styles.leaderboardEmpty}>{t('leaderboard.empty')}</Text>
        ) : (
          entries.map((entry) => (
            <Text key={entry.position} style={styles.leaderboardRow}>
              {t('leaderboard.row', {
                position: entry.position,
                username: entry.username,
                score: entry.score.points,
              })}
            </Text>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => void handleNext()}>
        <Text style={styles.buttonText}>{t('victory.next')}</Text>
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
  title: { ...typography.title, color: colors.success },
  score: {
    ...typography.heading,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  leaderboard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  leaderboardTitle: {
    ...typography.heading,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  leaderboardEmpty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  leaderboardRow: {
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  button: {
    backgroundColor: colors.success,
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
});
