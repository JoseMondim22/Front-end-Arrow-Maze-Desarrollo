import { DomainError } from '@domain/shared/errors/DomainError';
import { NodeId } from '@domain/shared/value-objects/NodeId';

describe('NodeId', () => {
  it('should_fail_when_empty', () => {
    expect(() => NodeId.of('')).toThrow(DomainError);
    expect(() => NodeId.of('   ')).toThrow(DomainError);
  });

  it('should_be_equal_when_same_value', () => {
    expect(NodeId.of('a').equals(NodeId.of('a'))).toBe(true);
    expect(NodeId.of('a').equals(NodeId.of('b'))).toBe(false);
  });

  it('should_expose_value_via_toString', () => {
    expect(NodeId.of('abc').toString()).toBe('abc');
  });
});
