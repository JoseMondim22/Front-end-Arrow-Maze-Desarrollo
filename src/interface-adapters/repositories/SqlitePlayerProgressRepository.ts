import { IPlayerProgressRepository } from '../../domain/player-progress/IPlayerProgressRepository';
import { PlayerProgress } from '../../domain/player-progress/PlayerProgress';
import { PlayerProgressMapper } from '../mappers/PlayerProgressMapper';
import { IPlayerProgressStore } from '../ports/IPlayerProgressStore';

/** Implements the domain's IPlayerProgressRepository against a local storage port
 * (IPlayerProgressStore) — the concrete SQLite wiring lives in Capa 4. */
export class SqlitePlayerProgressRepository implements IPlayerProgressRepository {
  constructor(private readonly store: IPlayerProgressStore) {}

  async load(): Promise<PlayerProgress> {
    const rows = await this.store.loadAll();
    return PlayerProgressMapper.toDomain(rows);
  }

  async save(progress: PlayerProgress): Promise<void> {
    await this.store.saveAll(PlayerProgressMapper.toRows(progress));
  }
}
