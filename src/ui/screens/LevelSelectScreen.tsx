import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLevelsStore } from '../../infrastructure/di/container';
import { Level } from '../../domain/level/Level';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

/** §16: progress + locked levels. Zero game logic — unlock/completed/best score
 * all come straight from PlayerProgress via useLevelsStore. */
export function LevelSelectScreen({ navigation }: Props): React.JSX.Element {
  const levels = useLevelsStore((state) => state.levels);
  const progress = useLevelsStore((state) => state.progress);
  const isLoading = useLevelsStore((state) => state.isLoading);
  const error = useLevelsStore((state) => state.error);
  const loadLevels = useLevelsStore((state) => state.loadLevels);
  const isUnlocked = useLevelsStore((state) => state.isUnlocked);

  useEffect(() => {
    void loadLevels();
  }, [loadLevels]);

  const renderItem = ({ item }: { item: Level }): React.JSX.Element => {
    const unlocked = isUnlocked(item.order);
    const completed = progress?.isCompleted(item.id) ?? false;
    const bestScore = progress?.bestScoreOf(item.id).points ?? 0;

    return (
      <TouchableOpacity
        style={[styles.card, !unlocked && styles.cardLocked]}
        disabled={!unlocked}
        onPress={() => navigation.navigate('Game', { level: item })}
      >
        <Text style={styles.cardTitle}>Level {item.order.sequence}</Text>
        {!unlocked && <Text style={styles.cardSubtitle}>Locked</Text>}
        {unlocked && completed && (
          <Text style={styles.cardSubtitle}>Best score: {bestScore}</Text>
        )}
        {unlocked && !completed && <Text style={styles.cardSubtitle}>Tap to play</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {error !== null && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={levels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshing={isLoading}
        onRefresh={() => void loadLevels()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLocked: { opacity: 0.5 },
  cardTitle: { ...typography.heading, color: colors.text },
  cardSubtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    padding: spacing.md,
  },
});
