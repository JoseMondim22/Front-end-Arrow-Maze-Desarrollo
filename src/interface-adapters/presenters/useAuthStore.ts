import { create, StoreApi, UseBoundStore } from 'zustand';
import { AuthSession, ITokenStore } from '../../application/ports/ITokenStore';
import { LoginQuery } from '../../application/use-cases/auth/LoginQuery';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { RegisterUserCommand } from '../../application/use-cases/auth/RegisterUserCommand';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';

export interface AuthStoreState {
  session: AuthSession | null;
  isAuthenticating: boolean;
  error: string | null;
  register(command: RegisterUserCommand): Promise<void>;
  login(query: LoginQuery): Promise<void>;
  logout(): Promise<void>;
  restoreSession(): Promise<void>;
}

export interface AuthStoreDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUseCase: LoginUseCase;
  tokenStore: ITokenStore;
}

/**
 * Presenter for auth screens. restoreSession() reads the persisted session at app
 * start (ITokenStore, Capa 4) so the player never has to log in again after
 * closing the app — see the ITokenStore/secure-store discussion.
 */
export function createAuthStore(
  deps: AuthStoreDependencies,
): UseBoundStore<StoreApi<AuthStoreState>> {
  return create<AuthStoreState>((set) => ({
    session: null,
    isAuthenticating: false,
    error: null,

    async register(command) {
      set({ isAuthenticating: true, error: null });
      try {
        await deps.registerUserUseCase.execute(command);
        set({ isAuthenticating: false });
      } catch (error) {
        set({ isAuthenticating: false, error: (error as Error).message });
      }
    },

    async login(query) {
      set({ isAuthenticating: true, error: null });
      try {
        const session = await deps.loginUseCase.execute(query);
        set({ session, isAuthenticating: false });
      } catch (error) {
        set({ isAuthenticating: false, error: (error as Error).message });
      }
    },

    async logout() {
      await deps.tokenStore.clearSession();
      set({ session: null });
    },

    async restoreSession() {
      const hasSession = await deps.tokenStore.hasActiveSession();
      if (!hasSession) {
        return;
      }
      const accessToken = await deps.tokenStore.getAccessToken();
      const userId = await deps.tokenStore.getUserId();
      if (accessToken !== null && userId !== null) {
        set({ session: { accessToken, userId } });
      }
    },
  }));
}
