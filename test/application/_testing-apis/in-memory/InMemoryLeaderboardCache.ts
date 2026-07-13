import { ILeaderboardCache } from '@application/ports/ILeaderboardCache';
import { LeaderboardEntryResult } from '@application/ports/ILeaderboardRepository';
import { LevelId } from '@domain/shared/value-objects/LevelId';

/** In-memory fake for ILeaderboardCache — the local write target that
 * SyncLeaderboardsUseCase populates. */
export class InMemoryLeaderboardCache implements ILeaderboardCache {
  private readonly entriesByLevel = new Map<string, LeaderboardEntryResult[]>();

  async replaceTop(params: {
    levelId: LevelId;
    entries: LeaderboardEntryResult[];
  }): Promise<void> {
    this.entriesByLevel.set(params.levelId.toString(), params.entries);
  }

  cachedEntriesFor(levelId: LevelId): LeaderboardEntryResult[] | undefined {
    return this.entriesByLevel.get(levelId.toString());
  }
}
