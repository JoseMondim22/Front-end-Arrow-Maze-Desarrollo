import { DomainError } from '../errors/DomainError';

/**
 * Identity of a node in the board graph.
 * Value Object: immutable, compared by value, never empty.
 */
export class NodeId {
  private constructor(private readonly value: string) {}

  static of(value: string): NodeId {
    if (value.trim().length === 0) {
      throw new DomainError('NodeId cannot be empty');
    }
    return new NodeId(value);
  }

  equals(other: NodeId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
