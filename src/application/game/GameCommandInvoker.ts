import { GameSession } from '../../domain/game-session/GameSession';
import { GameCommand } from './GameCommand';

/**
 * Orchestrates game actions: the store calls the invoker, the invoker calls the
 * aggregate root (§4). Holds the current GameSession and applies GameCommands to
 * it, keeping the mutable "current session" concern out of the store itself.
 */
export class GameCommandInvoker {
  constructor(private current: GameSession) {}

  get session(): GameSession {
    return this.current;
  }

  execute(command: GameCommand): GameSession {
    this.current = command.execute(this.current);
    return this.current;
  }

  /** Advance the clock. A tick is not a player action, so it goes through the
   * same simple assignment as execute() — there is no undo to worry about. */
  tick(elapsedSeconds: number): GameSession {
    this.current = this.current.tick(elapsedSeconds);
    return this.current;
  }
}
