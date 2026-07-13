import { ILeaderboardCache } from '../../application/ports/ILeaderboardCache';
import {
  ILeaderboardRepository,
  LeaderboardEntryResult,
} from '../../application/ports/ILeaderboardRepository';
import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { LeaderboardEntryDTO } from '../dtos/output/LeaderboardEntryDTO';
import { LeaderboardMapper } from '../mappers/LeaderboardMapper';
import { ILeaderboardStore } from '../ports/ILeaderboardStore';

/**
 * Implements both the domain-facing read port (ILeaderboardRepository) and the
 * local write port (ILeaderboardCache) against a local storage port
 * (ILeaderboardStore) — the concrete SQLite wiring lives in Capa 4. One class,
 * two related technical concerns against the same table, mirroring
 * SqlitePlayerProgressRepository but serving both directions since there's no
 * separate "sync port" concept for leaderboard like IProgressSyncPort.
 */
export class SqliteLeaderboardRepository implements ILeaderboardRepository, ILeaderboardCache {
  constructor(private readonly store: ILeaderboardStore) {}

  async findTop(params: { levelId: LevelId; limit: number }): Promise<LeaderboardEntryResult[]> {
    const rows = await this.store.loadTop({
      levelId: params.levelId.toString(),
      limit: params.limit,
    });
    // Row shape matches LeaderboardEntryDTO, so the existing HTTP mapper is
    // reused instead of duplicating Score.of(...) construction here.
    const dtos: LeaderboardEntryDTO[] = rows.map((row) => ({
      position: row.position,
      username: row.username,
      score: row.score,
    }));
    return LeaderboardMapper.toDomain(dtos);
  }

  async replaceTop(params: {
    levelId: LevelId;
    entries: LeaderboardEntryResult[];
  }): Promise<void> {
    await this.store.replaceForLevel({
      levelId: params.levelId.toString(),
      entries: params.entries.map((entry) => ({
        levelId: params.levelId.toString(),
        position: entry.position,
        username: entry.username,
        score: entry.score.points,
      })),
    });
  }
}
