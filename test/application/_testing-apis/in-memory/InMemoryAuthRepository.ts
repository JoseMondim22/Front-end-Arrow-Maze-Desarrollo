import { IAuthRepository, LoginResult } from '@application/ports/IAuthRepository';

interface StoredUser {
  email: string;
  password: string;
  username: string;
  userId: string;
}

/** In-memory fake for IAuthRepository. Models real registration/login rules
 * (duplicate email, wrong password) instead of just returning canned values. */
export class InMemoryAuthRepository implements IAuthRepository {
  private readonly usersByEmail = new Map<string, StoredUser>();
  private nextUserId = 1;

  async register(params: {
    email: string;
    password: string;
    username: string;
  }): Promise<void> {
    if (this.usersByEmail.has(params.email)) {
      throw new Error(`Email already registered: ${params.email}`);
    }
    this.usersByEmail.set(params.email, {
      ...params,
      userId: `user-${this.nextUserId++}`,
    });
  }

  async login(params: { email: string; password: string }): Promise<LoginResult> {
    const user = this.usersByEmail.get(params.email);
    if (user === undefined || user.password !== params.password) {
      throw new Error('Invalid credentials');
    }
    return { accessToken: `token-for-${user.userId}`, userId: user.userId };
  }

  seed(user: {
    email: string;
    password: string;
    username: string;
    userId: string;
  }): void {
    this.usersByEmail.set(user.email, user);
  }

  isRegistered(email: string): boolean {
    return this.usersByEmail.has(email);
  }
}
