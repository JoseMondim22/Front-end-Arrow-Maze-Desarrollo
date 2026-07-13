import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { audioService, localizationService, useAuthStore } from '../../infrastructure/di/container';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

// audioService/localizationService are consumed directly (per §4) — they are
// technical services, not use cases, so they don't belong behind a Zustand store.
// Toggling the locale calls i18next.changeLanguage() under the hood, so every
// useTranslation() consumer in the app (not just this screen) re-renders in sync.
export function SettingsScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [muted, setMuted] = useState(false);
  const [locale, setLocale] = useState(localizationService.getLocale());
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    void audioService.isMuted().then(setMuted);
  }, []);

  const toggleMuted = (value: boolean): void => {
    setMuted(value);
    void audioService.setMuted(value);
  };

  const toggleLocale = (): void => {
    const next = locale === 'es' ? 'en' : 'es';
    void localizationService.setLocale(next);
    setLocale(next);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>{t('settings.muteSound')}</Text>
        <Switch value={muted} onValueChange={toggleMuted} />
      </View>

      <TouchableOpacity style={styles.row} onPress={toggleLocale}>
        <Text style={styles.rowLabel}>{t('settings.language')}</Text>
        <Text style={styles.rowValue}>{locale.toUpperCase()}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => void handleLogout()}>
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rowLabel: { ...typography.body, color: colors.text },
  rowValue: { ...typography.body, color: colors.primary, fontWeight: '700' },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logoutText: { ...typography.button, color: colors.surface },
});
