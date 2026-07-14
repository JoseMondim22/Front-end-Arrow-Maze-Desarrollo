import { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic config (instead of a static app.json) so apiBaseUrl can vary per
 * environment via API_BASE_URL, without touching code — HttpClient (Capa 4)
 * reads it back via expo-constants (§14).
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Arrow Maze',
  slug: 'arrow-maze',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.josemondim.arrowmaze',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-secure-store', 'expo-sqlite', 'expo-localization', 'expo-audio', 'expo-asset'],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000',
    eas: {
      projectId: '8ed3700e-bda9-44c6-b686-c2c431b34da9',
    },
  },
});
