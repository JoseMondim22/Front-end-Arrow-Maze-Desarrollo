import { ILocalizationService } from '../../application/ports/ILocalizationService';
import i18next from './index';

/** Concrete ILocalizationService backed by i18next + expo-localization. */
export class I18nLocalizationService implements ILocalizationService {
  translate(key: string, params?: Record<string, string | number>): string {
    return i18next.t(key, params);
  }

  getLocale(): string {
    return i18next.language;
  }

  async setLocale(locale: string): Promise<void> {
    await i18next.changeLanguage(locale);
  }
}
