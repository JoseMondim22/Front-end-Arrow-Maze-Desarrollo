import { DomainError } from '../errors/DomainError';

/**
 * Identity of an ArrowChain.
 * Value Object: immutable, compared by value, never empty.
 */
export class ChainId {
  private constructor(private readonly value: string) {}

  static of(value: string): ChainId {
    if (value.trim().length === 0) {
      throw new DomainError('ChainId cannot be empty');
    }
    return new ChainId(value);
  }

  equals(other: ChainId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
