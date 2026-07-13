import { ILogger } from '../../application/ports/ILogger';

/** Concrete ILogger backed by console.*. Swappable later (Sentry, Bugsnag, etc.)
 * without touching the AOP decorators — they depend on the interface, not this class. */
export class ConsoleLogger implements ILogger {
  info(message: string, context?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, context ?? '');
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context ?? '');
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, context ?? '');
  }
}
