import {
  ILeaderboardRepository,
  LeaderboardEntryResult,
} from '../../ports/ILeaderboardRepository';
import { IQueryService } from '../../cqs/IQueryService';
import { GetLeaderboardQuery } from './GetLeaderboardQuery';

/** Lists the top scores for a level through ILeaderboardRepository. Pure
 * delegation — no domain logic to add on top. */
export class GetLeaderboardUseCase
  implements IQueryService<GetLeaderboardQuery, LeaderboardEntryResult[]>
{
  constructor(private readonly leaderboardRepository: ILeaderboardRepository) {}

  async execute(query: GetLeaderboardQuery): Promise<LeaderboardEntryResult[]> {
    return this.leaderboardRepository.findTop(query);
  }
}
