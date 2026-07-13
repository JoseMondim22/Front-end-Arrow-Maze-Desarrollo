import { GameSession } from '../../domain/game-session/GameSession';

/**
 * GoF Command pattern: encapsulates a single game action (move/rotate a chain) as
 * an object. This is NOT a CQS command (§4): it touches no port, only the
 * GameSession aggregate directly — GameCommandInvoker is the one that owns history
 * and undo, not the individual command.
 */
export interface GameCommand {
  execute(session: GameSession): GameSession;
}
