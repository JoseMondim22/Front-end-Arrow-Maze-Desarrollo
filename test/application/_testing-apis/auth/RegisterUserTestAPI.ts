import { IAuthRepository } from '@application/ports/IAuthRepository';
import { RegisterUserCommand } from '@application/use-cases/auth/RegisterUserCommand';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUserUseCase';
import { mock, MockProxy } from 'jest-mock-extended';

/**
 * Testing API for RegisterUserUseCase. The only place that instantiates the use
 * case and its mocked port; the spec never touches jest-mock-extended directly.
 */
export class RegisterUserTestAPI {
  private readonly authRepository: MockProxy<IAuthRepository> = mock<IAuthRepository>();
  private thrownError: unknown;

  givenRegistrationSucceeds(): void {
    this.authRepository.register.mockResolvedValue(undefined);
  }

  givenRegistrationFailsWith(error: Error): void {
    this.authRepository.register.mockRejectedValue(error);
  }

  async whenRegistering(command: RegisterUserCommand): Promise<void> {
    const useCase = new RegisterUserUseCase(this.authRepository);
    try {
      await useCase.execute(command);
    } catch (error) {
      this.thrownError = error;
    }
  }

  thenUserWasRegisteredWith(command: RegisterUserCommand): void {
    expect(this.authRepository.register).toHaveBeenCalledWith(command);
  }

  thenNoErrorWasThrown(): void {
    expect(this.thrownError).toBeUndefined();
  }

  thenErrorWasThrown(message: string): void {
    expect(this.thrownError).toBeInstanceOf(Error);
    expect((this.thrownError as Error).message).toBe(message);
  }
}
