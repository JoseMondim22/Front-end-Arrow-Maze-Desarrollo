import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';
import { PlayerProgressMother } from '@mothers/PlayerProgressMother';
import { LoadPlayerProgressTestAPI } from '@testing-apis/progress/LoadPlayerProgressTestAPI';

describe('LoadPlayerProgressUseCase', () => {
  it('should_return_current_progress_when_progress_exists', async () => {
    const testAPI = new LoadPlayerProgressTestAPI();
    const progress = PlayerProgressMother.withScore(
      LevelId.of('lvl-1'),
      LevelOrder.of(1),
      650,
    );
    testAPI.givenExistingProgress(progress);

    await testAPI.whenLoadingProgress();

    testAPI.thenProgressReturnedIs(progress);
  });

  it('should_return_empty_progress_when_nothing_was_recorded', async () => {
    const testAPI = new LoadPlayerProgressTestAPI();

    await testAPI.whenLoadingProgress();

    testAPI.thenProgressReturnedIs(PlayerProgressMother.empty());
  });
});
