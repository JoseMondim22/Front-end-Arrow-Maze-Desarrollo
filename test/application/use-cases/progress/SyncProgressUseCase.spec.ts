import { ProgressMother } from '@app-mothers/ProgressMother';
import { SyncProgressTestAPI } from '@testing-apis/progress/SyncProgressTestAPI';

describe('SyncProgressUseCase', () => {
  it('should_sync_progress_when_sync_succeeds', async () => {
    const testAPI = new SyncProgressTestAPI();
    testAPI.givenSyncSucceeds();
    const command = ProgressMother.syncProgressCommand();

    await testAPI.whenSyncing(command);

    testAPI.thenSyncWasCalledWith(command);
    testAPI.thenNoErrorWasThrown();
  });

  it('should_propagate_error_when_sync_fails', async () => {
    const testAPI = new SyncProgressTestAPI();
    testAPI.givenSyncFailsWith(new Error('server unavailable'));
    const command = ProgressMother.syncProgressCommand();

    await testAPI.whenSyncing(command);

    testAPI.thenErrorWasThrown('server unavailable');
  });
});
