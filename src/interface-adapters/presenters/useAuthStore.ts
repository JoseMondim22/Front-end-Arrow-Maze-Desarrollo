import { create, StoreApi, UseBoundStore } from 'zustand';
import { ICommandService } from '../../application/cqs/ICommandService';
import { IQueryService } from '../../application/cqs/IQueryService';
import { AuthSession, ITokenStore } from '../../application/ports/ITokenStore';
import { LoginResult } from '../../application/ports/IAuthRepository';
import { LoginQuery } from '../../application/use-cases/auth/LoginQuery';
import { RegisterUserCommand } from '../../application/use-cases/auth/RegisterUserCommand';
import { ClearLocalProgressCommand } from '../../application/use-cases/progress/ClearLocalProgressCommand';

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
  registerUserUseCase: ICommandService<RegisterUserCommand>;
  loginUseCase: IQueryService<LoginQuery, LoginResult>;
  clearLocalProgressUseCase: ICommandService<ClearLocalProgressCommand>;
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
      // Local progress has no per-account scoping (§15) — wipe it here so the
      // next account to log in on this device never sees a leftover user's
      // progress (see ClearLocalProgressUseCase).
      await deps.clearLocalProgressUseCase.execute({});
      set({ session: null });
    },

    async restoreSession() {
      // Checking for a persisted session must never block app boot: if the
      // platform's secure store is unavailable for any reason, fall back to
      // "not logged in" instead of crashing the startup gate.
      try {
        const hasSession = await deps.tokenStore.hasActiveSession();
        if (!hasSession) {
          return;
        }
        const accessToken = await deps.tokenStore.getAccessToken();
        const userId = await deps.tokenStore.getUserId();
        if (accessToken !== null && userId !== null) {
          set({ session: { accessToken, userId } });
        }
      } catch {
        // Treated as "no session" — see comment above.
      }
    },
  }));
}
