import {
  ILeaderboardRepository,
  LeaderboardEntryResult,
} from '@application/ports/ILeaderboardRepository';
import { LevelId } from '@domain/shared/value-objects/LevelId';
import { Score } from '@domain/shared/value-objects/Score';

interface SeededEntry {
  username: string;
  score: Score;
}

/** In-memory fake for ILeaderboardRepository. Models real ranking behavior
 * (sort by score, assign position, apply the limit) instead of a canned array. */
export class InMemoryLeaderboardRepository implements ILeaderboardRepository {
  private readonly entriesByLevel = new Map<string, SeededEntry[]>();
  private readonly failingLevelIds = new Set<string>();

  async findTop(params: {
    levelId: LevelId;
    limit: number;
  }): Promise<LeaderboardEntryResult[]> {
    if (this.failingLevelIds.has(params.levelId.toString())) {
      throw new Error(`findTop failed for level ${params.levelId.toString()}`);
    }
    const entries = this.entriesByLevel.get(params.levelId.toString()) ?? [];
    return [...entries]
      .sort((a, b) => b.score.points - a.score.points)
      .slice(0, params.limit)
      .map((entry, index) => ({
        position: index + 1,
        username: entry.username,
        score: entry.score,
      }));
  }

  seed(levelId: LevelId, entries: SeededEntry[]): void {
    this.entriesByLevel.set(levelId.toString(), entries);
  }

  failFor(levelId: LevelId): void {
    this.failingLevelIds.add(levelId.toString());
  }
}
