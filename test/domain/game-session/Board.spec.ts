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

  it('should_skip_the_heading_that_faces_its_own_neck_when_rotating', () => {
    // Folded chain a -> b -> c -> d, head at d, currently facing 'up'.
    // d's neighbours: 'right' = exit, 'down' = c (the neck), 'left' = a.
    const board = BoardMother.uShapedChainFacingWall();

    const facingExit = board.rotateChain(ChainId.of('c1')); // up -> right (exit)
    expect(facingExit.chains[0].direction.id).toBe('right');

    // Naive clockwise step would be right -> down, but down points straight into
    // the neck (c), so it must be skipped in favor of the next heading, left.
    const facingAway = facingExit.rotateChain(ChainId.of('c1'));
    expect(facingAway.chains[0].direction.id).toBe('left');
  });

  it('should_expose_every_node_position_and_terrain_kind_in_the_render_view', () => {
    const board = BoardMother.straightPathToExit();

    const view = board.toView();
    const byId = new Map(view.cells.map((cell) => [cell.nodeId.toString(), cell]));

    expect(view.cells).toHaveLength(3);
    // n1 is a grid_arrow seed in the definition, projected to empty floor (§6.2).
    expect(byId.get('n0')?.terrain).toBe('empty');
    expect(byId.get('n1')?.terrain).toBe('empty');
    expect(byId.get('exit')?.terrain).toBe('exit');
    expect(byId.get('n0')?.position.rowIndex).toBe(0);
    expect(byId.get('n0')?.position.columnIndex).toBe(0);
    expect(byId.get('n1')?.position.columnIndex).toBe(1);
  });

  it('should_expose_chain_segments_tail_to_head_with_the_current_direction', () => {
    const board = BoardMother.straightPathToExit();

    const view = board.toView();

    expect(view.chains).toHaveLength(1);
    const chainView = view.chains[0];
    expect(chainView.chainId.equals(ChainId.of('c1'))).toBe(true);
    expect(chainView.headDirection.id).toBe('right');
    expect(chainView.segments.map((p) => [p.rowIndex, p.columnIndex])).toEqual([
      [0, 0],
      [0, 1],
    ]);
    expect(chainView.headPosition.columnIndex).toBe(1);
  });

  it('should_drop_exited_chains_from_the_render_view', () => {
    const board = BoardMother.straightPathToExit();

    const { board: afterExit } = board.slideChain(ChainId.of('c1'));

    expect(afterExit.toView().chains).toHaveLength(0);
  });

  it('should_move_entire_chain_when_path_is_clear_on_a_3d_board', () => {
    const board = BoardMother.threeDeeStraightPathToExit();

    const result = board.slideChain(ChainId.of('c1'));

    expect(result.outcome).toBe('Exited');
    expect(result.board.chains).toHaveLength(0);
  });

  it('should_report_no_legal_move_when_a_3d_chain_is_boxed_in_on_all_six_headings', () => {
    const board = BoardMother.threeDeeBoxedInDeadlock();

    expect(board.hasLegalMove(ChainId.of('c1'))).toBe(false);
  });

  it('should_cycle_through_all_six_headings_when_rotating_a_bodyless_3d_chain', () => {
    // Single-node chain: no neck to skip, so this observes the raw 6-step cycle.
    let board = BoardMother.threeDeeLoneArrow();
    const headings: string[] = [board.chains[0].direction.id];

    for (let step = 0; step < 6; step += 1) {
      board = board.rotateChain(ChainId.of('c1'));
      headings.push(board.chains[0].direction.id);
    }

    // 6-step cycle: back to the starting heading after exactly 6 rotations.
    expect(headings).toEqual([
      'forward',
      'backward',
      'up',
      'right',
      'down',
      'left',
      'forward',
    ]);
  });

  it('should_skip_the_heading_that_faces_its_own_neck_when_rotating_a_3d_chain', () => {
    // 2-node train: 'backward' from the head always points at the tail (the neck),
    // so it must be skipped no matter where it falls in the 6-step cycle.
    const board = BoardMother.threeDeeStraightPathToExit();

    const rotated = board.rotateChain(ChainId.of('c1')); // forward -> (backward skipped) -> up
    expect(rotated.chains[0].direction.id).toBe('up');
  });

  it('should_expose_the_third_axis_in_the_render_view_of_a_3d_board', () => {
    const board = BoardMother.threeDeeStraightPathToExit();

    const view = board.toView();

    expect(view.boardKind).toBe('grid3d');
  });
});
