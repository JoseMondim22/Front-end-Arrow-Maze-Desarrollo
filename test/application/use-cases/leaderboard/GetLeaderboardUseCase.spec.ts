import { LevelId } from '@domain/shared/value-objects/LevelId';
import { LeaderboardMother } from '@app-mothers/LeaderboardMother';
import { GetLeaderboardTestAPI } from '@testing-apis/leaderboard/GetLeaderboardTestAPI';

describe('GetLeaderboardUseCase', () => {
  it('should_return_top_entries_ranked_by_score_when_entries_exist', async () => {
    const testAPI = new GetLeaderboardTestAPI();
    const levelId = LevelId.of('lvl-1');
    testAPI.givenEntriesForLevel(levelId, [
      LeaderboardMother.entry('alice', 500),
      LeaderboardMother.entry('bob', 900),
      LeaderboardMother.entry('carol', 700),
    ]);

    await testAPI.whenListingLeaderboard({ levelId, limit: 10 });

    testAPI.thenTopEntriesAre([
      { position: 1, username: 'bob', points: 900 },
      { position: 2, username: 'carol', points: 700 },
      { position: 3, username: 'alice', points: 500 },
    ]);
  });

  it('should_limit_the_number_of_entries_returned', async () => {
    const testAPI = new GetLeaderboardTestAPI();
    const levelId = LevelId.of('lvl-1');
    testAPI.givenEntriesForLevel(levelId, [
      LeaderboardMother.entry('alice', 500),
      LeaderboardMother.entry('bob', 900),
      LeaderboardMother.entry('carol', 700),
    ]);

    await testAPI.whenListingLeaderboard({ levelId, limit: 2 });

    testAPI.thenTopEntriesAre([
      { position: 1, username: 'bob', points: 900 },
      { position: 2, username: 'carol', points: 700 },
    ]);
  });

  it('should_return_empty_list_when_level_has_no_entries', async () => {
    const testAPI = new GetLeaderboardTestAPI();

    await testAPI.whenListingLeaderboard({ levelId: LevelId.of('ghost'), limit: 10 });

    testAPI.thenTopEntriesAre([]);
  });
});
