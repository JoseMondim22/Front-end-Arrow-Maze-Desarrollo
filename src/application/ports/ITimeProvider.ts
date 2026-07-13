/**
 * Technical port for reading the current time. The domain never calls Date.now()
 * directly (see GameSession.tick) — the application layer reads it here and passes
 * the elapsed seconds in, keeping the domain deterministic and testable.
 */
export interface ITimeProvider {
  now(): number;
}
