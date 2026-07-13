import { IAuthRepository, LoginResult } from '../../application/ports/IAuthRepository';
import { LoginDTO } from '../dtos/input/LoginDTO';
import { RegisterDTO } from '../dtos/input/RegisterDTO';
import { TokenDTO } from '../dtos/output/TokenDTO';
import { IHttpClient } from '../ports/IHttpClient';

/** Implements IAuthRepository against POST /auth/register and POST /auth/login (§14). */
export class HttpAuthRepository implements IAuthRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async register(params: {
    email: string;
    password: string;
    username: string;
  }): Promise<void> {
    const body: RegisterDTO = params;
    await this.httpClient.post<void>('/auth/register', body);
  }

  async login(params: { email: string; password: string }): Promise<LoginResult> {
    const body: LoginDTO = params;
    const token = await this.httpClient.post<TokenDTO>('/auth/login', body);
    return { accessToken: token.accessToken, userId: token.userId };
  }
}
