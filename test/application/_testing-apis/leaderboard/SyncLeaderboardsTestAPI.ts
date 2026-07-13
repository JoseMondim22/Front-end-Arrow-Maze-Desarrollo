import { SyncLeaderboardsCommand } from '@application/use-cases/leaderboard/SyncLeaderboardsCommand';
import { SyncLeaderboardsUseCase } from '@application/use-cases/leaderboard/SyncLeaderboardsUseCase';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { Score } from '@domain/shared/value-objects/Score';
import { InMemoryLeaderboardCache } from '../in-memory/InMemoryLeaderboardCache';
import { InMemoryLeaderboardRepository } from '../in-memory/InMemoryLeaderboardRepository';

/** Testing API for SyncLeaderboardsUseCase. Both the remote source and the
 * local cache are in-memory fakes, so a failing level's write can be told
 * apart from a level that was never fetched at all. */
export class SyncLeaderboardsTestAPI {
  private readonly remoteLeaderboardRepository = new InMemoryLeaderboardRepository();
  private readonly leaderboardCache = new InMemoryLeaderboardCache();
  private thrownError: unknown;

  givenRemoteEntriesForLevel(
    levelId: LevelId,
    entries: { username: string; score: Score }[],
  ): void {
    this.remoteLeaderboardRepository.seed(levelId, entries);
  }

  givenRemoteFetchFailsForLevel(levelId: LevelId): void {
    this.remoteLeaderboardRepository.failFor(levelId);
  }

  async whenSyncing(command: SyncLeaderboardsCommand): Promise<void> {
    const useCase = new SyncLeaderboardsUseCase(
      this.remoteLeaderboardRepository,
      this.leaderboardCache,
    );
    try {
      await useCase.execute(command);
    } catch (error) {
      this.thrownError = error;
    }
  }

  thenNoErrorWasThrown(): void {
    expect(this.thrownError).toBeUndefined();
  }

  thenLevelIsCachedWith(
    levelId: LevelId,
    expected: Array<{ position: number; username: string; points: number }>,
  ): void {
    const cached = this.leaderboardCache.cachedEntriesFor(levelId) ?? [];
    expect(
      cached.map((entry) => ({
        position: entry.position,
        username: entry.username,
        points: entry.score.points,
      })),
    ).toEqual(expected);
  }

  thenLevelWasNotCached(levelId: LevelId): void {
    expect(this.leaderboardCache.cachedEntriesFor(levelId)).toBeUndefined();
  }
}
