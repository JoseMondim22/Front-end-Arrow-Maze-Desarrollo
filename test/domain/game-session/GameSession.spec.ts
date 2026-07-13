import { DomainError } from '@domain/shared/errors/DomainError';
import { ChainId } from '@domain/shared/value-objects/ChainId';
import { GameSessionMother } from '@mothers/GameSessionMother';

describe('GameSession', () => {
  it('should_increment_moves_used_when_move_is_reverted', () => {
    const session = GameSessionMother.withHeadFacingWall().moveArrow(ChainId.of('c1'));

    expect(session.movesUsed).toBe(1);
    expect(session.failedMoves).toBe(1);
    expect(session.status.name).toBe('Playing');
  });

  it('should_not_increment_moves_used_when_rotating', () => {
    const session = GameSessionMother.playingWithClearPathToExit().rotateArrow(
      ChainId.of('c1'),
    );

    expect(session.movesUsed).toBe(0);
  });

  it('should_reach_victory_when_no_chains_remain_on_board', () => {
    const session = GameSessionMother.oneMoveFromVictory().moveArrow(ChainId.of('c1'));

    expect(session.status.name).toBe('Victory');
    expect(session.finalScore).not.toBeNull();
  });

  it('should_reach_defeat_when_no_chain_has_a_legal_move', () => {
    const session = GameSessionMother.deadlocked();

    expect(session.status.name).toBe('Defeat');
  });

  it('should_award_final_score_only_at_victory', () => {
    const playing = GameSessionMother.oneMoveFromVictory();
    expect(playing.finalScore).toBeNull();

    const won = playing.moveArrow(ChainId.of('c1'));

    expect(won.finalScore).not.toBeNull();
    expect(won.pullEvents().some((event) => event.name === 'LevelCompleted')).toBe(
      true,
    );
  });

  it('should_emit_arrow_chain_exited_event_when_a_chain_exits', () => {
    const session = GameSessionMother.withTwoChainsColliding().moveArrow(
      ChainId.of('B'),
    );

    expect(session.pullEvents().some((event) => event.name === 'ArrowChainExited')).toBe(
      true,
    );
    expect(session.status.name).toBe('Playing');
  });

  it('should_be_no_op_when_acting_after_terminal_or_paused', () => {
    const won = GameSessionMother.oneMoveFromVictory().moveArrow(ChainId.of('c1'));

    const after = won.moveArrow(ChainId.of('c1'));

    expect(after).toBe(won);
    expect(after.movesUsed).toBe(won.movesUsed);
  });

  it('should_reach_defeat_when_move_budget_is_exhausted', () => {
    const session = GameSessionMother.withMoveBudget(1).moveArrow(ChainId.of('c1'));

    expect(session.status.name).toBe('Defeat');
  });

  it('should_reject_negative_tick', () => {
    const session = GameSessionMother.playingWithClearPathToExit();

    expect(() => session.tick(-1)).toThrow(DomainError);
  });

  it('should_pause_and_resume_the_session', () => {
    const paused = GameSessionMother.playingWithClearPathToExit().pause();
    expect(paused.status.name).toBe('Paused');

    const resumed = paused.resume();
    expect(resumed.status.name).toBe('Playing');
  });

  it('should_ignore_move_while_paused', () => {
    const paused = GameSessionMother.paused();

    const after = paused.moveArrow(ChainId.of('c1'));

    expect(after).toBe(paused);
    expect(after.movesUsed).toBe(0);
  });

  it('should_advance_time_when_ticking_within_the_limit', () => {
    const session = GameSessionMother.playingWithClearPathToExit().tick(10);

    expect(session.timeUsed).toBe(10);
    expect(session.status.name).toBe('Playing');
  });

  it('should_reach_defeat_when_time_runs_out', () => {
    const session = GameSessionMother.playingWithClearPathToExit().tick(300);

    expect(session.status.name).toBe('Defeat');
  });

  it('should_keep_terminal_status_when_pausing_a_finished_game', () => {
    const won = GameSessionMother.oneMoveFromVictory().moveArrow(ChainId.of('c1'));

    expect(won.pause().status.name).toBe('Victory');
  });

  it('should_reflect_the_current_board_in_its_render_view', () => {
    const session = GameSessionMother.playingWithClearPathToExit();

    expect(session.view.chains).toHaveLength(1);

    const after = session.moveArrow(ChainId.of('c1'));

    // The chain exited: the view drops it, mirroring the board it delegates to.
    expect(after.view.chains).toHaveLength(0);
  });
});
