import { DomainError } from '../errors/DomainError';

/**
 * Position of a Level within the progression sequence (1-based).
 * Value Object: immutable. Drives the unlock invariant in PlayerProgress.
 */
export class LevelOrder {
  private constructor(private readonly value: number) {}

  static of(value: number): LevelOrder {
    if (!Number.isInteger(value)) {
      throw new DomainError('LevelOrder must be an integer');
    }
    if (value < 1) {
      throw new DomainError('LevelOrder must be 1 or greater');
    }
    return new LevelOrder(value);
  }

  get sequence(): number {
    return this.value;
  }

  isFirst(): boolean {
    return this.value === 1;
  }

  previous(): LevelOrder {
    if (this.isFirst()) {
      throw new DomainError('The first level has no previous order');
    }
    return new LevelOrder(this.value - 1);
  }

  equals(other: LevelOrder): boolean {
    return this.value === other.value;
  }
}
