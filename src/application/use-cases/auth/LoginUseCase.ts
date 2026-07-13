import { IQueryService } from '../../cqs/IQueryService';
import { IAuthRepository, LoginResult } from '../../ports/IAuthRepository';
import { ITokenStore } from '../../ports/ITokenStore';
import { LoginQuery } from './LoginQuery';

/**
 * Authenticates through IAuthRepository and persists the resulting session via
 * ITokenStore before returning it. Per §4's port table this query is intentionally
 * paired with a side effect (saving the token) — logging in without persisting the
 * session would be useless, so the "read" here always carries that one write.
 */
export class LoginUseCase implements IQueryService<LoginQuery, LoginResult> {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly tokenStore: ITokenStore,
  ) {}

  async execute(query: LoginQuery): Promise<LoginResult> {
    const result = await this.authRepository.login(query);
    await this.tokenStore.saveSession(result);
    return result;
  }
}
