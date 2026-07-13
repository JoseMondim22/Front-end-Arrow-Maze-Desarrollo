/** The session data produced by a successful login and kept by ITokenStore. */
export interface AuthSession {
  accessToken: string;
  userId: string;
}

/**
 * Technical port over secure local storage of the auth session (expo-secure-store).
 * Consumed by LoginUseCase (to persist) and by AuthGuard decorators (to check).
 */
export interface ITokenStore {
  saveSession(session: AuthSession): Promise<void>;
  getAccessToken(): Promise<string | null>;
  getUserId(): Promise<string | null>;
  hasActiveSession(): Promise<boolean>;
  clearSession(): Promise<void>;
}
