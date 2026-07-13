import { DomainError } from '@domain/shared/errors/DomainError';
import { LevelId } from '@domain/shared/value-objects/LevelId';

describe('LevelId', () => {
  it('should_fail_when_empty', () => {
    expect(() => LevelId.of('')).toThrow(DomainError);
    expect(() => LevelId.of('   ')).toThrow(DomainError);
  });

  it('should_be_equal_when_same_value', () => {
    expect(LevelId.of('lvl-1').equals(LevelId.of('lvl-1'))).toBe(true);
    expect(LevelId.of('lvl-1').equals(LevelId.of('lvl-2'))).toBe(false);
  });

  it('should_expose_value_via_toString', () => {
    expect(LevelId.of('lvl-1').toString()).toBe('lvl-1');
  });
});
