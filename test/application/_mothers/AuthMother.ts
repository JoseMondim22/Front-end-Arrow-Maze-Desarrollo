import { LoginQuery } from '@application/use-cases/auth/LoginQuery';
import { RegisterUserCommand } from '@application/use-cases/auth/RegisterUserCommand';

/**
 * Object Mother for the auth use cases. There is no User aggregate on the front
 * (§15 — the client only ever holds a session token), so this Mother builds the
 * plain request shapes the auth ports exchange, always valid.
 */
export class AuthMother {
  static registerCommand(
    overrides: Partial<RegisterUserCommand> = {},
  ): RegisterUserCommand {
    return {
      email: 'player@example.com',
      password: 'super-secret-1',
      username: 'player_one',
      ...overrides,
    };
  }

  static loginQuery(overrides: Partial<LoginQuery> = {}): LoginQuery {
    return {
      email: 'player@example.com',
      password: 'super-secret-1',
      ...overrides,
    };
  }
}
