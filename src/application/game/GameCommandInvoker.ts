import { GameSession } from '../../domain/game-session/GameSession';
import { GameCommand } from './GameCommand';

/**
 * Orchestrates game actions: the store calls the invoker, the invoker calls the
 * aggregate root (§4). Keeps the current GameSession and a history of prior
 * sessions for undo.
 *
 * Because GameSession is immutable, undo needs no per-command inverse: it is
 * simply rewinding to the previous snapshot. A command is only pushed to history
 * when it actually changed the session — GameSession returns the SAME instance
 * (identity, not just an equal one) for a no-op action (paused/terminal), so a
 * reference check is enough to tell a real transition from a no-op.
 */
export class GameCommandInvoker {
  private readonly history: GameSession[] = [];

  constructor(private current: GameSession) {}

  get session(): GameSession {
    return this.current;
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  execute(command: GameCommand): GameSession {
    const next = command.execute(this.current);
    if (next !== this.current) {
      this.history.push(this.current);
      this.current = next;
    }
    return this.current;
  }

  undo(): GameSession {
    const previous = this.history.pop();
    if (previous !== undefined) {
      this.current = previous;
    }
    return this.current;
  }

  /**
   * Advance the clock. Deliberately bypasses execute()/history: a tick is not a
   * player action, so it must never become an undo point — undo should always
   * rewind the last MOVE, not eat a second of elapsed time instead.
   */
  tick(elapsedSeconds: number): GameSession {
    this.current = this.current.tick(elapsedSeconds);
    return this.current;
  }
}
