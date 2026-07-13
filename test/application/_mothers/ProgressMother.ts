import { CompleteLevelCommand } from '@application/use-cases/progress/CompleteLevelCommand';
import { SyncProgressCommand } from '@application/use-cases/progress/SyncProgressCommand';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';
import { Score } from '@domain/shared/value-objects/Score';

/** Object Mother for the progress use cases' commands. */
export class ProgressMother {
  static completeLevelCommand(
    overrides: Partial<CompleteLevelCommand> = {},
  ): CompleteLevelCommand {
    return {
      levelId: LevelId.of('lvl-1'),
      order: LevelOrder.of(1),
      score: Score.of(700),
      ...overrides,
    };
  }

  static syncProgressCommand(
    overrides: Partial<SyncProgressCommand> = {},
  ): SyncProgressCommand {
    return {
      levelId: LevelId.of('lvl-1'),
      score: Score.of(700),
      ...overrides,
    };
  }
}
