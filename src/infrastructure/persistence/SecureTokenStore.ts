import * as SecureStore from 'expo-secure-store';
import { AuthSession, ITokenStore } from '../../application/ports/ITokenStore';

const ACCESS_TOKEN_KEY = 'accessToken';
const USER_ID_KEY = 'userId';

/**
 * Concrete ITokenStore backed by expo-secure-store: the session sits in the
 * OS-encrypted store (Keychain on iOS, Keystore/EncryptedSharedPreferences on
 * Android), not plain-text AsyncStorage — this is what lets the player skip
 * logging in again after closing the app.
 */
export class SecureTokenStore implements ITokenStore {
  async saveSession(session: AuthSession): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
    await SecureStore.setItemAsync(USER_ID_KEY, session.userId);
  }

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  async getUserId(): Promise<string | null> {
    return SecureStore.getItemAsync(USER_ID_KEY);
  }

  async hasActiveSession(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  async clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
  }
}
