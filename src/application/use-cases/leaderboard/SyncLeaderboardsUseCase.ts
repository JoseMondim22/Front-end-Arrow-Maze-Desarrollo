import { ICommandService } from '../../cqs/ICommandService';
import { ILeaderboardCache } from '../../ports/ILeaderboardCache';
import { ILeaderboardRepository } from '../../ports/ILeaderboardRepository';
import { SyncLeaderboardsCommand } from './SyncLeaderboardsCommand';

/**
 * Downloads every requested level's leaderboard from the remote repository and
 * caches it locally, so GetLeaderboardUseCase (backed by the local cache) can
 * be read offline later (e.g. from the Victory screen).
 *
 * Unlike CompleteLevelUseCase — which lets its single remote sync reject so its
 * one caller can decide what to do — this is a BATCH of independently-failing
 * levels: one dead/offline fetch must not stop the others from being cached,
 * and there is no single caller decision to make per level. So failures are
 * swallowed here, per level, and execute() always resolves.
 */
export class SyncLeaderboardsUseCase implements ICommandService<SyncLeaderboardsCommand> {
  constructor(
    private readonly remoteLeaderboardRepository: ILeaderboardRepository,
    private readonly leaderboardCache: ILeaderboardCache,
  ) {}

  async execute(command: SyncLeaderboardsCommand): Promise<void> {
    await Promise.allSettled(
      command.levelIds.map(async (levelId) => {
        const entries = await this.remoteLeaderboardRepository.findTop({
          levelId,
          limit: command.limit,
        });
        await this.leaderboardCache.replaceTop({ levelId, entries });
      }),
    );
  }
}
