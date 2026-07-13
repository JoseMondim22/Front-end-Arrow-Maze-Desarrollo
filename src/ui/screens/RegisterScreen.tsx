import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../infrastructure/di/container';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const error = useAuthStore((state) => state.error);

  // Registration only creates the account (§4) — log in right after so the
  // player doesn't have to re-type their credentials on a second screen.
  const handleRegister = async (): Promise<void> => {
    await register({ email, password, username });
    if (useAuthStore.getState().error === null) {
      await login({ email, password });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.register.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('auth.register.usernamePlaceholder')}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.register.emailPlaceholder')}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.register.passwordPlaceholder')}
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error !== null && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, isAuthenticating && styles.buttonDisabled]}
        disabled={isAuthenticating}
        onPress={() => void handleRegister()}
      >
        <Text style={styles.buttonText}>
          {isAuthenticating ? t('common.loading') : t('auth.register.submit')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>{t('auth.register.hasAccount')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: radii.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.button,
    color: colors.surface,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
