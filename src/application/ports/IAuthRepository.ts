import { AuthSession } from './ITokenStore';

/** A successful login yields the same session shape ITokenStore persists. */
export type LoginResult = AuthSession;

/**
 * Technical port over the backend's auth endpoints (POST /auth/register,
 * POST /auth/login). Consumed by RegisterUserUseCase and LoginUseCase.
 */
export interface IAuthRepository {
  register(params: {
    email: string;
    password: string;
    username: string;
  }): Promise<void>;

  login(params: { email: string; password: string }): Promise<LoginResult>;
}
