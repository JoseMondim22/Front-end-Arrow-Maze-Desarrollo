import { ICommandService } from '../../application/cqs/ICommandService';
import { ITokenStore } from '../../application/ports/ITokenStore';

/** AOP: verifies an active session before running a protected command. The use
 * case never checks auth itself — SRP: this is its only concern. */
export class AuthGuardCommandDecorator<TCommand> implements ICommandService<TCommand> {
  constructor(
    private readonly decoratee: ICommandService<TCommand>,
    private readonly tokenStore: ITokenStore,
  ) {}

  async execute(command: TCommand): Promise<void> {
    const hasSession = await this.tokenStore.hasActiveSession();
    if (!hasSession) {
      throw new Error('Not authenticated');
    }
    await this.decoratee.execute(command);
  }
}
