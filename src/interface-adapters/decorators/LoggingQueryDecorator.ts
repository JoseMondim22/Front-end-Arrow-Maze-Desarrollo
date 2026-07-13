import { IQueryService } from '../../application/cqs/IQueryService';
import { ILogger } from '../../application/ports/ILogger';
import { ITimeProvider } from '../../application/ports/ITimeProvider';

/** AOP: logs entry, exit and duration of every execute() call. Mirrors
 * LoggingCommandDecorator for the query side of CQS. */
export class LoggingQueryDecorator<TQuery, TResult>
  implements IQueryService<TQuery, TResult>
{
  constructor(
    private readonly decoratee: IQueryService<TQuery, TResult>,
    private readonly logger: ILogger,
    private readonly timeProvider: ITimeProvider,
    private readonly useCaseName: string,
  ) {}

  async execute(query: TQuery): Promise<TResult> {
    const startedAt = this.timeProvider.now();
    this.logger.info(`${this.useCaseName} started`, { query });
    try {
      const result = await this.decoratee.execute(query);
      this.logger.info(`${this.useCaseName} completed`, {
        durationMs: this.timeProvider.now() - startedAt,
      });
      return result;
    } catch (error) {
      this.logger.error(`${this.useCaseName} failed`, {
        durationMs: this.timeProvider.now() - startedAt,
        error,
      });
      throw error;
    }
  }
}
