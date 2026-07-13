import { DomainError } from '../errors/DomainError';

/**
 * A game score.
 * Value Object: immutable, non-negative integer, compared by value.
 */
export class Score {
  private constructor(private readonly value: number) {}

  static of(value: number): Score {
    if (!Number.isInteger(value)) {
      throw new DomainError('Score must be an integer');
    }
    if (value < 0) {
      throw new DomainError('Score cannot be negative');
    }
    return new Score(value);
  }

  static zero(): Score {
    return new Score(0);
  }

  get points(): number {
    return this.value;
  }

  isGreaterThan(other: Score): boolean {
    return this.value > other.value;
  }

  equals(other: Score): boolean {
    return this.value === other.value;
  }
}
