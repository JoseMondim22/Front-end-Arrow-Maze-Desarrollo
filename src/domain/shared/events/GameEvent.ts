import { ChainId } from '../value-objects/ChainId';
import { Score } from '../value-objects/Score';

/**
 * Domain events emitted by an aggregate root during a transition (Observer). The
 * root accumulates them; the store drains them via pullEvents() and republishes to
 * UI and audio. Kept in shared/ because more than one root may emit events.
 */
export interface GameEvent {
  readonly name: string;
}

/** A chain reached an exit and left the board. */
export class ArrowChainExited implements GameEvent {
  readonly name = 'ArrowChainExited' as const;

  constructor(readonly chainId: ChainId) {}
}

/** The last chain left: the level is won. Carries the final score. */
export class LevelCompleted implements GameEvent {
  readonly name = 'LevelCompleted' as const;

  constructor(readonly score: Score) {}
}
