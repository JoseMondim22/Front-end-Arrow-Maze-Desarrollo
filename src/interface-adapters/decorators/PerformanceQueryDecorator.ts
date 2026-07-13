import { IQueryService } from '../../application/cqs/IQueryService';
import { ILogger } from '../../application/ports/ILogger';
import { ITimeProvider } from '../../application/ports/ITimeProvider';

/**
 * AOP: measures how long an expensive query takes (e.g. loading and building a
 * level) and warns only when it crosses slowThresholdMs. Distinct from
 * LoggingQueryDecorator, which logs every call unconditionally for traceability —
 * this one's single concern is flagging SLOW calls, not narrating every call.
 */
export class PerformanceQueryDecorator<TQuery, TResult>
  implements IQueryService<TQuery, TResult>
{
  constructor(
    private readonly decoratee: IQueryService<TQuery, TResult>,
    private readonly logger: ILogger,
    private readonly timeProvider: ITimeProvider,
    private readonly useCaseName: string,
    private readonly slowThresholdMs: number = 1000,
  ) {}

  async execute(query: TQuery): Promise<TResult> {
    const startedAt = this.timeProvider.now();
    const result = await this.decoratee.execute(query);
    const durationMs = this.timeProvider.now() - startedAt;
    if (durationMs > this.slowThresholdMs) {
      this.logger.warn(`${this.useCaseName} took ${durationMs}ms`, { durationMs });
    }
    return result;
  }
}
