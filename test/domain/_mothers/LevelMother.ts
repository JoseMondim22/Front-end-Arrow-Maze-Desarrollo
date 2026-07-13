import { Level } from '@domain/level/Level';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';
import { LevelRules } from '@domain/shared/value-objects/LevelRules';
import { BoardMother } from './BoardMother';

/** Object Mother for the Level aggregate root. */
export class LevelMother {
  private static rules(maxPossibleScore = 1000): LevelRules {
    return LevelRules.of({
      timeLimitSeconds: 300,
      maxMoves: 99,
      maxPossibleScore,
    });
  }

  static aLevel(): Level {
    return Level.create(
      LevelId.of('lvl-1'),
      BoardMother.straightPathToExitDefinition(),
      LevelMother.rules(),
      LevelOrder.of(1),
    );
  }

  static withMaxScore(maxPossibleScore: number): Level {
    return Level.create(
      LevelId.of('lvl-1'),
      BoardMother.straightPathToExitDefinition(),
      LevelMother.rules(maxPossibleScore),
      LevelOrder.of(1),
    );
  }

  static atOrder(order: number): Level {
    return Level.create(
      LevelId.of('lvl-1'),
      BoardMother.straightPathToExitDefinition(),
      LevelMother.rules(),
      LevelOrder.of(order),
    );
  }

  static reconstituted(): Level {
    return Level.reconstitute(
      LevelId.of('lvl-1'),
      BoardMother.straightPathToExitDefinition(),
      LevelMother.rules(),
      LevelOrder.of(1),
    );
  }
}
