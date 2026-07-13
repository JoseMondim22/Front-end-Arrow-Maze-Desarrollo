import { DomainError } from '@domain/shared/errors/DomainError';
import { ChainId } from '@domain/shared/value-objects/ChainId';

describe('ChainId', () => {
  it('should_fail_when_empty', () => {
    expect(() => ChainId.of('')).toThrow(DomainError);
    expect(() => ChainId.of('   ')).toThrow(DomainError);
  });

  it('should_be_equal_when_same_value', () => {
    expect(ChainId.of('c1').equals(ChainId.of('c1'))).toBe(true);
    expect(ChainId.of('c1').equals(ChainId.of('c2'))).toBe(false);
  });

  it('should_expose_value_via_toString', () => {
    expect(ChainId.of('c1').toString()).toBe('c1');
  });
});
