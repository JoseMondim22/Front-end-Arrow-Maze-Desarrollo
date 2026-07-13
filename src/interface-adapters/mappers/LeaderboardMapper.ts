import { LeaderboardEntryResult } from '../../application/ports/ILeaderboardRepository';
import { Score } from '../../domain/shared/value-objects/Score';
import { LeaderboardEntryDTO } from '../dtos/output/LeaderboardEntryDTO';

/** DTO -> application model for a leaderboard page (GET /leaderboard/:levelId). */
export class LeaderboardMapper {
  static toDomain(dtos: readonly LeaderboardEntryDTO[]): LeaderboardEntryResult[] {
    return dtos.map((dto) => ({
      position: dto.position,
      username: dto.username,
      score: Score.of(dto.score),
    }));
  }
}
