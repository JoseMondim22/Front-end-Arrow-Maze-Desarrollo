import { AuthSession, ITokenStore } from '@application/ports/ITokenStore';

/** In-memory fake for ITokenStore. Models real save/clear/query behavior. */
export class InMemoryTokenStore implements ITokenStore {
  private session: AuthSession | null = null;

  async saveSession(session: AuthSession): Promise<void> {
    this.session = session;
  }

  async getAccessToken(): Promise<string | null> {
    return this.session?.accessToken ?? null;
  }

  async getUserId(): Promise<string | null> {
    return this.session?.userId ?? null;
  }

  async hasActiveSession(): Promise<boolean> {
    return this.session !== null;
  }

  async clearSession(): Promise<void> {
    this.session = null;
  }
}
