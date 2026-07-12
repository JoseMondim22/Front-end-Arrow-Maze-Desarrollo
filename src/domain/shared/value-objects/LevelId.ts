import { DomainError } from '../errors/DomainError';

/**
 * Identity of a Level.
 * Value Object: immutable, compared by value, never empty.
 */
export class LevelId {
  private constructor(private readonly value: string) {}

  static of(value: string): LevelId {
    if (value.trim().length === 0) {
      throw new DomainError('LevelId cannot be empty');
    }
    return new LevelId(value);
  }

  equals(other: LevelId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
