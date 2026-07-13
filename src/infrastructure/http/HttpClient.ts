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
      const bodyText = await response.text().catch(() => '');
      const detail = extractErrorDetail(bodyText);
      throw new HttpError(
        response.status,
        `Request failed: ${method} ${path} (${response.status})${detail !== null ? ` — ${detail}` : ''}`,
      );
    }

    const text = await response.text();
    return (text.length === 0 ? undefined : JSON.parse(text)) as T;
  }
}

/** Backend error bodies (Nest's default ValidationPipe/HttpException shape) carry
 * the actual reason under `message` — a string or, for validation failures, an
 * array of per-field messages. Without this, every failed request only ever
 * surfaced its HTTP status, never why the backend rejected it. */
function extractErrorDetail(bodyText: string): string | null {
  if (bodyText.length === 0) {
    return null;
  }
  try {
    const parsed = JSON.parse(bodyText) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) {
      return parsed.message.join(', ');
    }
    if (typeof parsed.message === 'string') {
      return parsed.message;
    }
  } catch {
    // Not JSON — fall through to the raw body below.
  }
  return bodyText;
}
