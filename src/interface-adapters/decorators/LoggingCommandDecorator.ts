import { ICommandService } from '../../application/cqs/ICommandService';
import { ILogger } from '../../application/ports/ILogger';
import { ITimeProvider } from '../../application/ports/ITimeProvider';

/** AOP: logs entry, exit and duration of every execute() call. The wrapped use
 * case never calls the logger itself — SRP: this is its only concern. */
export class LoggingCommandDecorator<TCommand> implements ICommandService<TCommand> {
  constructor(
    private readonly decoratee: ICommandService<TCommand>,
    private readonly logger: ILogger,
    private readonly timeProvider: ITimeProvider,
    private readonly useCaseName: string,
  ) {}

  async execute(command: TCommand): Promise<void> {
    const startedAt = this.timeProvider.now();
    this.logger.info(`${this.useCaseName} started`, { command });
    try {
      await this.decoratee.execute(command);
      this.logger.info(`${this.useCaseName} completed`, {
        durationMs: this.timeProvider.now() - startedAt,
      });
    } catch (error) {
      this.logger.error(`${this.useCaseName} failed`, {
        durationMs: this.timeProvider.now() - startedAt,
        error,
      });
      throw error;
    }
  }
}
