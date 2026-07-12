/**
 * Lifecycle of a game session, modelled with the State pattern.
 *
 * Each concrete state answers the same questions the same way a switch would, but
 * without the switch: the session asks its status "can I act?" instead of branching
 * on an enum. pause()/resume() are state transitions that only make sense in some
 * states; the terminal states (Victory/Defeat) ignore them.
 *
 * Transitions to Victory/Defeat are NOT triggered here: they depend on the board,
 * the moves used and the elapsed time, so the GameSession root computes them and
 * selects the corresponding singleton.
 */
export interface GameStatus {
  readonly name: 'Playing' | 'Paused' | 'Victory' | 'Defeat';
  isPlaying(): boolean;
  isPaused(): boolean;
  isTerminal(): boolean;
  /** Whether move/rotate actions are accepted. Only true while Playing. */
  canAct(): boolean;
  pause(): GameStatus;
  resume(): GameStatus;
}

class PlayingStatus implements GameStatus {
  readonly name = 'Playing' as const;
  isPlaying(): boolean {
    return true;
  }
  isPaused(): boolean {
    return false;
  }
  isTerminal(): boolean {
    return false;
  }
  canAct(): boolean {
    return true;
  }
  pause(): GameStatus {
    return GameStatus.Paused;
  }
  resume(): GameStatus {
    return this;
  }
}

class PausedStatus implements GameStatus {
  readonly name = 'Paused' as const;
  isPlaying(): boolean {
    return false;
  }
  isPaused(): boolean {
    return true;
  }
  isTerminal(): boolean {
    return false;
  }
  canAct(): boolean {
    return false;
  }
  pause(): GameStatus {
    return this;
  }
  resume(): GameStatus {
    return GameStatus.Playing;
  }
}

class VictoryStatus implements GameStatus {
  readonly name = 'Victory' as const;
  isPlaying(): boolean {
    return false;
  }
  isPaused(): boolean {
    return false;
  }
  isTerminal(): boolean {
    return true;
  }
  canAct(): boolean {
    return false;
  }
  pause(): GameStatus {
    return this;
  }
  resume(): GameStatus {
    return this;
  }
}

class DefeatStatus implements GameStatus {
  readonly name = 'Defeat' as const;
  isPlaying(): boolean {
    return false;
  }
  isPaused(): boolean {
    return false;
  }
  isTerminal(): boolean {
    return true;
  }
  canAct(): boolean {
    return false;
  }
  pause(): GameStatus {
    return this;
  }
  resume(): GameStatus {
    return this;
  }
}

/**
 * The four states as flyweight singletons. Merged with the interface of the same
 * name so callers write GameStatus.Playing and type things as GameStatus.
 */
export const GameStatus = {
  Playing: new PlayingStatus() as GameStatus,
  Paused: new PausedStatus() as GameStatus,
  Victory: new VictoryStatus() as GameStatus,
  Defeat: new DefeatStatus() as GameStatus,
} as const;
