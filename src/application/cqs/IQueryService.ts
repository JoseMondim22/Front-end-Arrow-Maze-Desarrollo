/**
 * CQS query port: a use case that READS through a technical port and returns a
 * result, without mutating anything. Implementations may be wrapped by AOP
 * decorators (Logging, AuthGuard, Performance, Caching, ...).
 */
export interface IQueryService<TQuery, TResult> {
  execute(query: TQuery): Promise<TResult>;
}
