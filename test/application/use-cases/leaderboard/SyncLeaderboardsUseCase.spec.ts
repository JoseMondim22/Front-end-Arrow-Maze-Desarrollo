import { LeaderboardMother } from '@app-mothers/LeaderboardMother';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { SyncLeaderboardsTestAPI } from '@testing-apis/leaderboard/SyncLeaderboardsTestAPI';

describe('SyncLeaderboardsUseCase', () => {
  it('should_cache_every_levels_leaderboard_when_all_fetches_succeed', async () => {
    const testAPI = new SyncLeaderboardsTestAPI();
    const levelA = LevelId.of('lvl-a');
    const levelB = LevelId.of('lvl-b');
    testAPI.givenRemoteEntriesForLevel(levelA, [LeaderboardMother.entry('alice', 900)]);
    testAPI.givenRemoteEntriesForLevel(levelB, [LeaderboardMother.entry('bob', 500)]);

    await testAPI.whenSyncing({ levelIds: [levelA, levelB], limit: 10 });

    testAPI.thenNoErrorWasThrown();
    testAPI.thenLevelIsCachedWith(levelA, [{ position: 1, username: 'alice', points: 900 }]);
    testAPI.thenLevelIsCachedWith(levelB, [{ position: 1, username: 'bob', points: 500 }]);
  });

  it('should_still_cache_other_levels_when_one_fetch_fails', async () => {
    const testAPI = new SyncLeaderboardsTestAPI();
    const brokenLevel = LevelId.of('lvl-broken');
    const healthyLevel = LevelId.of('lvl-healthy');
    testAPI.givenRemoteFetchFailsForLevel(brokenLevel);
    testAPI.givenRemoteEntriesForLevel(healthyLevel, [LeaderboardMother.entry('carol', 700)]);

    await testAPI.whenSyncing({ levelIds: [brokenLevel, healthyLevel], limit: 10 });

    testAPI.thenNoErrorWasThrown();
    testAPI.thenLevelWasNotCached(brokenLevel);
    testAPI.thenLevelIsCachedWith(healthyLevel, [{ position: 1, username: 'carol', points: 700 }]);
  });
});
