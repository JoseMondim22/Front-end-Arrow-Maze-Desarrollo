import { IQueryService } from '../../application/cqs/IQueryService';
import { ITimeProvider } from '../../application/ports/ITimeProvider';

interface CacheEntry<TResult> {
  result: TResult;
  expiresAt: number;
}

/**
 * AOP: memoizes a query's result with a TTL. Generic over TQuery/TResult (OCP —
 * works for any future cacheable query, not hardcoded to one use case); the
 * composition root decides which query gets wrapped and how to build its cache
 * key (e.g. GetLeaderboardUseCase, keyed by levelId + limit).
 */
export class CachingQueryDecorator<TQuery, TResult>
  implements IQueryService<TQuery, TResult>
{
  private readonly cache = new Map<string, CacheEntry<TResult>>();

  constructor(
    private readonly decoratee: IQueryService<TQuery, TResult>,
    private readonly timeProvider: ITimeProvider,
    private readonly ttlMs: number,
    private readonly keyOf: (query: TQuery) => string,
  ) {}

  async execute(query: TQuery): Promise<TResult> {
    const key = this.keyOf(query);
    const now = this.timeProvider.now();
    const cached = this.cache.get(key);
    if (cached !== undefined && cached.expiresAt > now) {
      return cached.result;
    }
    const result = await this.decoratee.execute(query);
    this.cache.set(key, { result, expiresAt: now + this.ttlMs });
    return result;
  }
}
