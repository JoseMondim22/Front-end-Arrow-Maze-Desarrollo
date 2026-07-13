import { GameSession } from '../../domain/game-session/GameSession';
import { ChainId } from '../../domain/shared/value-objects/ChainId';
import { GameCommand } from './GameCommand';

/** Re-aims a chain's head 90 clockwise. A no-op (returns the same session instance)
 * if the session cannot currently act — see GameSession.rotateArrow. */
export class RotateArrowCommand implements GameCommand {
  constructor(private readonly chainId: ChainId) {}

  execute(session: GameSession): GameSession {
    return session.rotateArrow(this.chainId);
  }
}
