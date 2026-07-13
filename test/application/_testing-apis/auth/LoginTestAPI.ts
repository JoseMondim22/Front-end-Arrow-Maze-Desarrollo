import { IAuthRepository, LoginResult } from '@application/ports/IAuthRepository';
import { ITokenStore } from '@application/ports/ITokenStore';
import { LoginQuery } from '@application/use-cases/auth/LoginQuery';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { mock, MockProxy } from 'jest-mock-extended';

/**
 * Testing API for LoginUseCase. The only place that instantiates the use case and
 * its two mocked ports (IAuthRepository, ITokenStore).
 */
export class LoginTestAPI {
  private readonly authRepository: MockProxy<IAuthRepository> = mock<IAuthRepository>();
  private readonly tokenStore: MockProxy<ITokenStore> = mock<ITokenStore>();
  private result: LoginResult | undefined;
  private thrownError: unknown;

  givenCredentialsYield(session: LoginResult): void {
    this.authRepository.login.mockResolvedValue(session);
  }

  givenLoginFailsWith(error: Error): void {
    this.authRepository.login.mockRejectedValue(error);
  }

  async whenLoggingIn(query: LoginQuery): Promise<void> {
    const useCase = new LoginUseCase(this.authRepository, this.tokenStore);
    try {
      this.result = await useCase.execute(query);
    } catch (error) {
      this.thrownError = error;
    }
  }

  thenSessionWasReturned(expected: LoginResult): void {
    expect(this.result).toEqual(expected);
  }

  thenSessionWasSaved(expected: LoginResult): void {
    expect(this.tokenStore.saveSession).toHaveBeenCalledWith(expected);
  }

  thenSessionWasNotSaved(): void {
    expect(this.tokenStore.saveSession).not.toHaveBeenCalled();
  }

  thenErrorWasThrown(message: string): void {
    expect(this.thrownError).toBeInstanceOf(Error);
    expect((this.thrownError as Error).message).toBe(message);
  }
}
