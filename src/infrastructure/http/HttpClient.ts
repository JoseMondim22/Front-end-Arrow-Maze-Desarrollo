import Constants from 'expo-constants';
import { ITokenStore } from '../../application/ports/ITokenStore';
import { IHttpClient } from '../../interface-adapters/ports/IHttpClient';

/** Thrown for any non-2xx response, normalized across the whole app. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Concrete IHttpClient (§4, §14): adapts fetch, injects Authorization: Bearer by
 * reading ITokenStore on every call, and normalizes non-2xx responses into
 * HttpError. Base URL comes from app.config.ts's extra.apiBaseUrl.
 */
export class HttpClient implements IHttpClient {
  private readonly baseUrl: string;

  constructor(private readonly tokenStore: ITokenStore) {
    const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
    if (typeof apiBaseUrl !== 'string') {
      throw new Error('Missing extra.apiBaseUrl in app config');
    }
    this.baseUrl = apiBaseUrl;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const accessToken = await this.tokenStore.getAccessToken();
    if (accessToken !== null) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new HttpError(
        response.status,
        `Request failed: ${method} ${path} (${response.status})`,
      );
    }

    const text = await response.text();
    return (text.length === 0 ? undefined : JSON.parse(text)) as T;
  }
}
