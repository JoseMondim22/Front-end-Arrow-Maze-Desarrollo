/** Response body for POST /auth/login. */
export interface TokenDTO {
  accessToken: string;
  userId: string;
}
