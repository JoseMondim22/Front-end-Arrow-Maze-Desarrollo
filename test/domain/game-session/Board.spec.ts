import { ChainId } from '@domain/shared/value-objects/ChainId';
import { BoardMother } from '@mothers/BoardMother';

describe('Board', () => {
  it('should_move_entire_chain_when_path_is_clear', () => {
    const board = BoardMother.straightPathToExit();

    const result = board.slideChain(ChainId.of('c1'));

    // All-or-nothing: a clear path leads the whole train out through the exit.
    expect(result.outcome).toBe('Exited');
    expect(result.board.chains).toHaveLength(0);
  });

  it('should_slide_across_empty_cells_before_exiting', () => {
    const board = BoardMother.slidesThroughGapToExit();

    const result = board.slideChain(ChainId.of('c1'));

    expect(result.outcome).toBe('Exited');
    expect(result.board.chains).toHaveLength(0);
  });

  it('should_fail_when_sliding_an_unknown_chain', () => {
    const board = BoardMother.straightPathToExit();

    expect(() => board.slideChain(ChainId.of('ghost'))).toThrow();
  });

  it('should_exit_chain_when_head_reaches_exit_cell', () => {
    const board = BoardMother.headOneStepFromExit();

    const result = board.slideChain(ChainId.of('c1'));

    expect(result.outcome).toBe('Exited');
    expect(result.board.chains).toHaveLength(0);
  });

  it('should_revert_entire_chain_when_head_hits_wall', () => {
    const board = BoardMother.headFacingWall();

    const result = board.slideChain(ChainId.of('c1'));

    expect(result.outcome).toBe('Reverted');
    expect(result.board.chains).toHaveLength(1);
  });

  it('should_revert_entire_chain_when_head_hits_another_chain', () => {
    const board = BoardMother.twoChainsColliding();

    const result = board.slideChain(ChainId.of('A'));

    expect(result.outcome).toBe('Reverted');
    expect(result.board.chains).toHaveLength(2);
  });

  it('should_preserve_chain_order_when_chain_folds_back_on_itself', () => {
    const board = BoardMother.uShapedChainFacingWall();

    const order = board.chains[0].nodeIds.map((id) => id.toString());

    expect(order).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should_report_no_legal_move_when_chain_is_boxed_in', () => {
    const board = BoardMother.boxedInDeadlock();

    expect(board.hasLegalMove(ChainId.of('c1'))).toBe(false);
  });

  it('should_resolve_neighbours_in_every_direction_when_sliding', () => {
    const board = BoardMother.straightPathToExit();

    const facingDown = board.rotateChain(ChainId.of('c1')); // Right -> Down
    expect(facingDown.slideChain(ChainId.of('c1')).outcome).toBe('Reverted');

    const facingLeft = facingDown.rotateChain(ChainId.of('c1')); // Down -> Left
    expect(facingLeft.slideChain(ChainId.of('c1')).outcome).toBe('Reverted');
  });

  it('should_rotate_only_the_targeted_chain_when_rotating', () => {
    const board = BoardMother.twoChainsColliding();

    const rotated = board.rotateChain(ChainId.of('A'));

    const chainA = rotated.chains.find((chain) => chain.id.equals(ChainId.of('A')));
    const chainB = rotated.chains.find((chain) => chain.id.equals(ChainId.of('B')));
    expect(chainA?.direction.id).toBe('down'); // Right rotated clockwise
    expect(chainB?.direction.id).toBe('right'); // untouched
  });
});
