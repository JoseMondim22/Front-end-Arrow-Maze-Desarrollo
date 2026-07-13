/**
 * Technical port for logging. Consumed exclusively by the LoggingCommandDecorator /
 * LoggingQueryDecorator (AOP) — use cases never log directly.
 */
export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
