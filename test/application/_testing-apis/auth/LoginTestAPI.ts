import { LoginQuery } from '@application/use-cases/auth/LoginQuery';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { InMemoryAuthRepository } from '../in-memory/InMemoryAuthRepository';
import { InMemoryTokenStore } from '../in-memory/InMemoryTokenStore';

/** Testing API for LoginUseCase. Both ports are persistence-like, so both are
 * in-memory fakes, not jest mocks. */
export class LoginTestAPI {
  private readonly authRepository = new InMemoryAuthRepository();
  private readonly tokenStore = new InMemoryTokenStore();
  private sessionUserId: string | undefined;
  private thrownError: unknown;

  givenRegisteredUser(user: {
    email: string;
    password: string;
    username: string;
    userId: string;
  }): void {
    this.authRepository.seed(user);
  }

  async whenLoggingIn(query: LoginQuery): Promise<void> {
    const useCase = new LoginUseCase(this.authRepository, this.tokenStore);
    try {
      const result = await useCase.execute(query);
      this.sessionUserId = result.userId;
    } catch (error) {
      this.thrownError = error;
    }
  }

  thenSessionUserIdIs(expectedUserId: string): void {
    expect(this.sessionUserId).toBe(expectedUserId);
  }

  async thenSessionWasSaved(): Promise<void> {
    expect(await this.tokenStore.hasActiveSession()).toBe(true);
  }

  async thenSessionWasNotSaved(): Promise<void> {
    expect(await this.tokenStore.hasActiveSession()).toBe(false);
  }

  thenErrorWasThrown(message: string): void {
    expect(this.thrownError).toBeInstanceOf(Error);
    expect((this.thrownError as Error).message).toBe(message);
  }
}
