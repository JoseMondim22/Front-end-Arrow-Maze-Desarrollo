import { IPlayerProgressRepository } from '@domain/player-progress/IPlayerProgressRepository';
import { PlayerProgress } from '@domain/player-progress/PlayerProgress';

/** In-memory fake for IPlayerProgressRepository. load() returns whatever was
 * last seeded or saved, modeling real persistence instead of a canned value. */
export class InMemoryPlayerProgressRepository implements IPlayerProgressRepository {
  private progress: PlayerProgress = PlayerProgress.empty();

  async load(): Promise<PlayerProgress> {
    return this.progress;
  }

  async save(progress: PlayerProgress): Promise<void> {
    this.progress = progress;
  }

  seed(progress: PlayerProgress): void {
    this.progress = progress;
  }
}
