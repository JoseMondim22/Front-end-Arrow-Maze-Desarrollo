import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LevelOrder } from '@domain/shared/value-objects/LevelOrder';
import { PlayerProgressMother } from '@mothers/PlayerProgressMother';
import { ClearLocalProgressTestAPI } from '@testing-apis/progress/ClearLocalProgressTestAPI';

describe('ClearLocalProgressUseCase', () => {
  it('should_wipe_stored_progress_when_existing_progress_is_present', async () => {
    const testAPI = new ClearLocalProgressTestAPI();
    testAPI.givenExistingProgress(
      PlayerProgressMother.withScore(LevelId.of('lvl-1'), LevelOrder.of(1), 650),
    );

    await testAPI.whenClearing();

    await testAPI.thenStoredProgressIsEmpty();
  });

  it('should_leave_progress_empty_when_nothing_was_recorded', async () => {
    const testAPI = new ClearLocalProgressTestAPI();

    await testAPI.whenClearing();

    await testAPI.thenStoredProgressIsEmpty();
  });
});
