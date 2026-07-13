import { GameCommandInvoker } from '@application/game/GameCommandInvoker';
import { MoveArrowCommand } from '@application/game/MoveArrowCommand';
import { RotateArrowCommand } from '@application/game/RotateArrowCommand';
import { ChainId } from '@domain/shared/value-objects/ChainId';
import { GameSessionMother } from '@mothers/GameSessionMother';

describe('GameCommandInvoker', () => {
  it('should_move_chain_when_session_can_act', () => {
    const session = GameSessionMother.playingWithClearPathToExit();
    const invoker = new GameCommandInvoker(session);

    invoker.execute(new MoveArrowCommand(ChainId.of('c1')));

    expect(invoker.session.status.name).toBe('Victory');
    expect(invoker.session.movesUsed).toBe(1);
    expect(invoker.canUndo()).toBe(true);
  });

  it('should_not_change_session_when_it_cannot_act', () => {
    const paused = GameSessionMother.paused();
    const invoker = new GameCommandInvoker(paused);

    invoker.execute(new MoveArrowCommand(ChainId.of('c1')));

    expect(invoker.session).toBe(paused);
    expect(invoker.session.movesUsed).toBe(0);
    expect(invoker.canUndo()).toBe(false);
  });

  it('should_undo_the_last_move_when_undo_is_called', () => {
    const session = GameSessionMother.withHeadFacingWall();
    const invoker = new GameCommandInvoker(session);
    invoker.execute(new MoveArrowCommand(ChainId.of('c1')));

    invoker.undo();

    expect(invoker.session).toBe(session);
    expect(invoker.session.movesUsed).toBe(0);
    expect(invoker.canUndo()).toBe(false);
  });

  it('should_rotate_without_counting_a_move', () => {
    const session = GameSessionMother.playingWithClearPathToExit();
    const invoker = new GameCommandInvoker(session);

    invoker.execute(new RotateArrowCommand(ChainId.of('c1')));

    expect(invoker.session.movesUsed).toBe(0);
    expect(invoker.canUndo()).toBe(true);
  });

  it('should_do_nothing_when_undo_is_called_with_empty_history', () => {
    const session = GameSessionMother.playingWithClearPathToExit();
    const invoker = new GameCommandInvoker(session);

    invoker.undo();

    expect(invoker.session).toBe(session);
    expect(invoker.canUndo()).toBe(false);
  });

  it('should_advance_time_without_creating_an_undo_point', () => {
    const session = GameSessionMother.playingWithClearPathToExit();
    const invoker = new GameCommandInvoker(session);

    invoker.tick(10);

    expect(invoker.session.timeUsed).toBe(10);
    // A tick must never become something undo can rewind through.
    expect(invoker.canUndo()).toBe(false);
  });

  it('should_still_undo_the_last_move_after_ticking', () => {
    const session = GameSessionMother.withHeadFacingWall();
    const invoker = new GameCommandInvoker(session);
    invoker.tick(5);
    invoker.execute(new MoveArrowCommand(ChainId.of('c1')));

    invoker.undo();

    expect(invoker.session.movesUsed).toBe(0);
    // The tick that happened before the move is not lost by the undo.
    expect(invoker.session.timeUsed).toBe(5);
  });
});
