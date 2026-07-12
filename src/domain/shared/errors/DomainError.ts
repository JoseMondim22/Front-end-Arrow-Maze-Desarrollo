/**
 * Base error for every invariant violation raised inside the domain layer.
 * The domain never throws generic Errors: a broken rule is always a DomainError,
 * so outer layers can distinguish a business-rule failure from a technical one.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    // Restore prototype chain (required when targeting ES5/ES2015 with class extends).
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
