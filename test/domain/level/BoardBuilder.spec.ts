import { BoardBuilder } from '@domain/level/BoardBuilder';
import { DomainError } from '@domain/shared/errors/DomainError';
import { ChainId } from '@domain/shared/value-objects/ChainId';
import { BoardMother } from '@mothers/BoardMother';

describe('BoardBuilder', () => {
  it('should_build_a_valid_board_when_definition_is_well_formed', () => {
    const board = new BoardBuilder(
      BoardMother.straightPathToExitDefinition(),
    ).build();

    expect(board.chains).toHaveLength(1);
    expect(board.chains[0].direction.id).toBe('right');
    // The grid_arrow head was projected to empty floor, so the chain can slide out.
    expect(board.slideChain(ChainId.of('c1')).outcome).toBe('Exited');
  });

  it('should_fail_when_chain_node_ids_are_not_adjacent', () => {
    expect(() =>
      new BoardBuilder(BoardMother.chainNodesNotAdjacentDefinition()).build(),
    ).toThrow(DomainError);
  });

  it('should_fail_when_chain_head_has_no_direction', () => {
    expect(() =>
      new BoardBuilder(BoardMother.chainHeadNotArrowDefinition()).build(),
    ).toThrow(DomainError);
  });

  it('should_fail_when_edge_connects_non_adjacent_nodes', () => {
    expect(() =>
      new BoardBuilder(BoardMother.edgeConnectsNonAdjacentNodesDefinition()).build(),
    ).toThrow(DomainError);
  });
});
