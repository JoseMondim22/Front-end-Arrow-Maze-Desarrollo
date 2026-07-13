import { IQueryService } from '../../application/cqs/IQueryService';
import { ITokenStore } from '../../application/ports/ITokenStore';

/** AOP: verifies an active session before running a protected query. Mirrors
 * AuthGuardCommandDecorator for the query side of CQS. */
export class AuthGuardQueryDecorator<TQuery, TResult>
  implements IQueryService<TQuery, TResult>
{
  constructor(
    private readonly decoratee: IQueryService<TQuery, TResult>,
    private readonly tokenStore: ITokenStore,
  ) {}

  async execute(query: TQuery): Promise<TResult> {
    const hasSession = await this.tokenStore.hasActiveSession();
    if (!hasSession) {
      throw new Error('Not authenticated');
    }
    return this.decoratee.execute(query);
  }
}
