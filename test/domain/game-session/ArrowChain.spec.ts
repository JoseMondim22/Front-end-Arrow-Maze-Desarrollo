import { ArrowChain } from '@domain/game-session/ArrowChain';
import { DomainError } from '@domain/shared/errors/DomainError';
import { ChainId } from '@domain/shared/value-objects/ChainId';
import { GridDirection } from '@domain/shared/value-objects/GridDirection';
import { NodeId } from '@domain/shared/value-objects/NodeId';
import { ArrowChainMother } from '@mothers/ArrowChainMother';

describe('ArrowChain', () => {
  it('should_expose_last_node_as_head_and_first_as_tail', () => {
    const chain = ArrowChainMother.straightPair();

    expect(chain.head.toString()).toBe('n1');
    expect(chain.tail.toString()).toBe('n0');
  });

  it('should_advance_direction_clockwise_when_rotating', () => {
    const chain = ArrowChainMother.singleNode(GridDirection.Up);

    expect(chain.rotate().direction.id).toBe('right');
  });

  it('should_fail_when_created_with_no_nodes', () => {
    expect(() => ArrowChain.create(ChainId.of('c1'), [], GridDirection.Up)).toThrow(
      DomainError,
    );
  });

  it('should_report_occupancy_for_its_nodes', () => {
    const chain = ArrowChainMother.straightPair();

    expect(chain.occupies(NodeId.of('n0'))).toBe(true);
    expect(chain.occupies(NodeId.of('zzz'))).toBe(false);
  });
});
