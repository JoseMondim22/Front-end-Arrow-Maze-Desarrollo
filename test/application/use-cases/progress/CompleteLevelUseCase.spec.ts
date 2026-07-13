import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';
import { Score } from '@domain/shared/value-objects/Score';
import { ProgressMother } from '@app-mothers/ProgressMother';
import { PlayerProgressMother } from '@mothers/PlayerProgressMother';
import { CompleteLevelTestAPI } from '@testing-apis/progress/CompleteLevelTestAPI';

describe('CompleteLevelUseCase', () => {
  it('should_record_completion_and_sync_when_level_is_completed', async () => {
    const testAPI = new CompleteLevelTestAPI();
    testAPI.givenExistingProgress(PlayerProgressMother.empty());
    testAPI.givenSyncSucceeds();
    const command = ProgressMother.completeLevelCommand();

    await testAPI.whenCompletingLevel(command);

    await testAPI.thenLevelIsCompletedWithBestScore(
      command.levelId,
      command.score.points,
    );
    testAPI.thenSyncWasCalledWith(command);
    testAPI.thenNoErrorWasThrown();
  });

  it('should_update_best_score_when_new_score_is_higher', async () => {
    const testAPI = new CompleteLevelTestAPI();
    const levelId = LevelId.of('lvl-1');
    const order = LevelOrder.of(1);
    testAPI.givenExistingProgress(PlayerProgressMother.withScore(levelId, order, 400));
    testAPI.givenSyncSucceeds();
    const command = ProgressMother.completeLevelCommand({
      levelId,
      order,
      score: Score.of(900),
    });

    await testAPI.whenCompletingLevel(command);

    await testAPI.thenLevelIsCompletedWithBestScore(levelId, 900);
  });

  it('should_keep_local_progress_saved_when_sync_fails', async () => {
    const testAPI = new CompleteLevelTestAPI();
    testAPI.givenExistingProgress(PlayerProgressMother.empty());
    testAPI.givenSyncFailsWith(new Error('network unreachable'));
    const command = ProgressMother.completeLevelCommand();

    await testAPI.whenCompletingLevel(command);

    testAPI.thenErrorWasThrown('network unreachable');
    await testAPI.thenLevelIsCompletedWithBestScore(
      command.levelId,
      command.score.points,
    );
  });
});
