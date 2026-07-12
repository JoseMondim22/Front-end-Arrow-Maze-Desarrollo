import { PlayerProgress } from './PlayerProgress';

/**
 * Repository port for the PlayerProgress aggregate. Lives in the domain, next to the
 * aggregate it serves (repository-as-contract). The concrete adapter persists to
 * local SQLite; use cases depend only on this abstraction.
 */
export interface IPlayerProgressRepository {
  load(): Promise<PlayerProgress>;
  save(progress: PlayerProgress): Promise<void>;
}
