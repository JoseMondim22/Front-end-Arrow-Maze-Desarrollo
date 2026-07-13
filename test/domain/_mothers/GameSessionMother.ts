import { Board } from '@domain/game-session/Board';
import { GameSession } from '@domain/game-session/GameSession';
import { FailedMovesScoringStrategy } from '@domain/shared/services/FailedMovesScoringStrategy';
import { ScoringStrategy } from '@domain/shared/services/ScoringStrategy';
import { LevelRules } from '@domain/shared/value-objects/LevelRules';
import { BoardMother } from './BoardMother';

/** Object Mother for GameSession (aggregate root). Wraps GameSession.begin with
 * generous default rules and a default scoring policy unless overridden. */
export class GameSessionMother {
  private static defaultRules(): LevelRules {
    return LevelRules.of({
      timeLimitSeconds: 300,
      maxMoves: 99,
      maxPossibleScore: 1000,
    });
  }

  private static begin(
    board: Board,
    rules: LevelRules = GameSessionMother.defaultRules(),
    scoring: ScoringStrategy = new FailedMovesScoringStrategy(),
  ): GameSession {
    return GameSession.begin({ board, rules, scoring });
  }

  static playingWithClearPathToExit(): GameSession {
    return GameSessionMother.begin(BoardMother.straightPathToExit());
  }

  static oneMoveFromVictory(): GameSession {
    return GameSessionMother.begin(BoardMother.headOneStepFromExit());
  }

  static withHeadFacingWall(): GameSession {
    return GameSessionMother.begin(BoardMother.headFacingWall());
  }

  static withTwoChainsColliding(): GameSession {
    return GameSessionMother.begin(BoardMother.twoChainsColliding());
  }

  static deadlocked(): GameSession {
    return GameSessionMother.begin(BoardMother.boxedInDeadlock());
  }

  /** A reverting-move scenario with a tight move budget (drives Defeat on exhaustion). */
  static withMoveBudget(maxMoves: number): GameSession {
    const rules = LevelRules.of({
      timeLimitSeconds: 300,
      maxMoves,
      maxPossibleScore: 1000,
    });
    return GameSessionMother.begin(BoardMother.headFacingWall(), rules);
  }

  static paused(): GameSession {
    return GameSessionMother.playingWithClearPathToExit().pause();
  }
}
