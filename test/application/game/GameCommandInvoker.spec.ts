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
  });

  it('should_not_change_session_when_it_cannot_act', () => {
    const paused = GameSessionMother.paused();
    const invoker = new GameCommandInvoker(paused);

    invoker.execute(new MoveArrowCommand(ChainId.of('c1')));

    expect(invoker.session).toBe(paused);
    expect(invoker.session.movesUsed).toBe(0);
  });

  it('should_rotate_without_counting_a_move', () => {
    const session = GameSessionMother.playingWithClearPathToExit();
    const invoker = new GameCommandInvoker(session);

    invoker.execute(new RotateArrowCommand(ChainId.of('c1')));

    expect(invoker.session.movesUsed).toBe(0);
  });

  it('should_advance_time_when_ticking', () => {
    const session = GameSessionMother.playingWithClearPathToExit();
    const invoker = new GameCommandInvoker(session);

    invoker.tick(10);

    expect(invoker.session.timeUsed).toBe(10);
  });
});
