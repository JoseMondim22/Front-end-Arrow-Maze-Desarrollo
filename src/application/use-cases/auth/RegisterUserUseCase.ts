import { ICommandService } from '../../cqs/ICommandService';
import { IAuthRepository } from '../../ports/IAuthRepository';
import { RegisterUserCommand } from './RegisterUserCommand';

/** Creates a new account through IAuthRepository. No local user aggregate exists
 * (§15): the client only ever holds a session token, never a User entity. */
export class RegisterUserUseCase implements ICommandService<RegisterUserCommand> {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    await this.authRepository.register(command);
  }
}
