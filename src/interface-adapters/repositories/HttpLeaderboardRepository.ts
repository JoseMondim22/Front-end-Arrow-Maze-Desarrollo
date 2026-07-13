import {
  ILeaderboardRepository,
  LeaderboardEntryResult,
} from '../../application/ports/ILeaderboardRepository';
import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { LeaderboardEntryDTO } from '../dtos/output/LeaderboardEntryDTO';
import { LeaderboardMapper } from '../mappers/LeaderboardMapper';
import { IHttpClient } from '../ports/IHttpClient';

/** Implements ILeaderboardRepository against GET /leaderboard/:levelId (§14). */
export class HttpLeaderboardRepository implements ILeaderboardRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async findTop(params: {
    levelId: LevelId;
    limit: number;
  }): Promise<LeaderboardEntryResult[]> {
    const dtos = await this.httpClient.get<LeaderboardEntryDTO[]>(
      `/leaderboard/${params.levelId.toString()}?limit=${params.limit}`,
    );
    return LeaderboardMapper.toDomain(dtos);
  }
}
