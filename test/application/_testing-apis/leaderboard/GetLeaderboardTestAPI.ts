import { LeaderboardEntryResult } from '@application/ports/ILeaderboardRepository';
import { GetLeaderboardQuery } from '@application/use-cases/leaderboard/GetLeaderboardQuery';
import { GetLeaderboardUseCase } from '@application/use-cases/leaderboard/GetLeaderboardUseCase';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { Score } from '@domain/shared/value-objects/Score';
import { InMemoryLeaderboardRepository } from '../in-memory/InMemoryLeaderboardRepository';

/** Testing API for GetLeaderboardUseCase. ILeaderboardRepository is an in-memory
 * fake (persistence-like, with real ranking behavior). */
export class GetLeaderboardTestAPI {
  private readonly leaderboardRepository = new InMemoryLeaderboardRepository();
  private result: LeaderboardEntryResult[] = [];

  givenEntriesForLevel(
    levelId: LevelId,
    entries: { username: string; score: Score }[],
  ): void {
    this.leaderboardRepository.seed(levelId, entries);
  }

  async whenListingLeaderboard(query: GetLeaderboardQuery): Promise<void> {
    const useCase = new GetLeaderboardUseCase(this.leaderboardRepository);
    this.result = await useCase.execute(query);
  }

  thenTopEntriesAre(
    expected: Array<{ position: number; username: string; points: number }>,
  ): void {
    const actual = this.result.map((entry) => ({
      position: entry.position,
      username: entry.username,
      points: entry.score.points,
    }));
    expect(actual).toEqual(expected);
  }
}
