/**
 * CQS command port: a use case that MUTATES state through a technical port and
 * returns nothing. Implementations may be wrapped by AOP decorators (Logging,
 * AuthGuard, ...) since they compose the same port by delegation.
 */
export interface ICommandService<TCommand> {
  execute(command: TCommand): Promise<void>;
}
