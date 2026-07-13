/**
 * Technical port over i18n (i18next + react-i18next + expo-localization).
 * translate() is synchronous: by the time the app renders, i18next has already
 * loaded its resources.
 */
export interface ILocalizationService {
  translate(key: string, params?: Record<string, string | number>): string;
  getLocale(): string;
  setLocale(locale: string): Promise<void>;
}
