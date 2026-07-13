/**
 * Local port owned by interface-adapters: what a repository needs from an HTTP
 * client, nothing more. The concrete HttpClient (Capa 4, wraps fetch, injects the
 * Authorization header via ITokenStore, normalizes HTTP errors) implements this —
 * interface-adapters never imports infrastructure directly (§8 dependency rule).
 */
export interface IHttpClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
}
