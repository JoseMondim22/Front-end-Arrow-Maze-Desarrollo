import { RegisterUserCommand } from '@application/use-cases/auth/RegisterUserCommand';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUserUseCase';
import { InMemoryAuthRepository } from '../in-memory/InMemoryAuthRepository';

/** Testing API for RegisterUserUseCase. Uses an in-memory fake for IAuthRepository
 * (a persistence-like port), not a jest mock, so real registration rules apply. */
export class RegisterUserTestAPI {
  private readonly authRepository = new InMemoryAuthRepository();
  private thrownError: unknown;

  givenEmailAlreadyRegistered(email: string): void {
    this.authRepository.seed({
      email,
      password: 'irrelevant',
      username: 'irrelevant',
      userId: 'existing-user',
    });
  }

  async whenRegistering(command: RegisterUserCommand): Promise<void> {
    const useCase = new RegisterUserUseCase(this.authRepository);
    try {
      await useCase.execute(command);
    } catch (error) {
      this.thrownError = error;
    }
  }

  thenUserWasRegistered(email: string): void {
    expect(this.authRepository.isRegistered(email)).toBe(true);
  }

  thenNoErrorWasThrown(): void {
    expect(this.thrownError).toBeUndefined();
  }

  thenErrorWasThrown(message: string): void {
    expect(this.thrownError).toBeInstanceOf(Error);
    expect((this.thrownError as Error).message).toBe(message);
  }
}
