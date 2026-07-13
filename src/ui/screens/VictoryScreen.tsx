import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLevelsStore } from '../../infrastructure/di/container';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Victory'>;

export function VictoryScreen({ route, navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { score } = route.params;
  const loadLevels = useLevelsStore((state) => state.loadLevels);

  const handleNext = async (): Promise<void> => {
    await loadLevels();
    navigation.navigate('LevelSelect');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>{t('victory.title')}</Text>
      <Text style={styles.score}>{t('victory.points', { score })}</Text>

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
    marginBottom: spacing.xl,
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
