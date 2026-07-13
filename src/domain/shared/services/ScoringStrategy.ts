import { Score } from '../value-objects/Score';

/**
 * Everything a scoring policy may look at to award a final score. A move either
 * exits a chain (progress) or reverts (a mistake); `failedMoves` counts only the
 * reverts, so a policy can penalise mistakes without punishing progress.
 *
 * (Extends the §6.5 signature with `failedMoves`. GameSession must expose a reverted
 * -move counter when scoring is wired in.)
 */
export interface ScoringInput {
  maxPossibleScore: number;
  movesUsed: number;
  maxMoves: number;
  failedMoves: number;
  timeUsedSec: number;
  timeLimitSec: number;
}

/**
 * Strategy (domain service): a swappable scoring POLICY, not a game invariant.
 * Different levels or modes can score the same session differently.
 */
export interface ScoringStrategy {
  score(input: ScoringInput): Score;
}
