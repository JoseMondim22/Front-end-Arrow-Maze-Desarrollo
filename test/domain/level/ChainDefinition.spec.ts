import { ChainDefinition } from '@domain/level/value-objects/ChainDefinition';
import { DomainError } from '@domain/shared/errors/DomainError';
import { ChainId } from '@domain/shared/value-objects/ChainId';
import { NodeId } from '@domain/shared/value-objects/NodeId';

const ids = (...values: string[]): NodeId[] => values.map((value) => NodeId.of(value));

describe('ChainDefinition', () => {
  it('should_fail_when_created_with_no_nodes', () => {
    expect(() => ChainDefinition.of(ChainId.of('c1'), [])).toThrow(DomainError);
  });

  it('should_fail_when_a_node_is_repeated', () => {
    expect(() => ChainDefinition.of(ChainId.of('c1'), ids('a', 'a'))).toThrow(
      DomainError,
    );
  });

  it('should_expose_last_node_as_head_and_first_as_tail', () => {
    const chain = ChainDefinition.of(ChainId.of('c1'), ids('a', 'b', 'c'));

    expect(chain.head.toString()).toBe('c');
    expect(chain.tail.toString()).toBe('a');
  });
});
