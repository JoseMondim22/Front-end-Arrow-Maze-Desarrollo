import { GameSession } from '../../domain/game-session/GameSession';
import { ChainId } from '../../domain/shared/value-objects/ChainId';
import { GameCommand } from './GameCommand';

/** Slides a chain. A no-op (returns the same session instance) if the session
 * cannot currently act (paused or terminal) — see GameSession.moveArrow. */
export class MoveArrowCommand implements GameCommand {
  constructor(private readonly chainId: ChainId) {}

  execute(session: GameSession): GameSession {
    return session.moveArrow(this.chainId);
  }
}
