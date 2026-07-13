import { LevelId } from '../../../domain/shared/value-objects/LevelId';

/** Parameter object for StartGameUseCase. */
export interface StartGameQuery {
  levelId: LevelId;
}
