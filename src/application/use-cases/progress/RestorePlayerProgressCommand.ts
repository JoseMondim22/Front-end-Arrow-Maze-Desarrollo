/** Parameter object for RestorePlayerProgressUseCase. Empty on purpose —
 * there is nothing to parametrize, it always restores the caller's own
 * progress (the backend identifies the account from the auth token). */
export type RestorePlayerProgressCommand = Record<string, never>;
