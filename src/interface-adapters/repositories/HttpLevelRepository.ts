import { ILevelRepository } from '../../domain/level/ILevelRepository';
import { Level } from '../../domain/level/Level';
import { LevelId } from '../../domain/shared/value-objects/LevelId';
import { LevelDTO } from '../dtos/output/LevelDTO';
import { LevelMapper } from '../mappers/LevelMapper';
import { IHttpClient } from '../ports/IHttpClient';

/**
 * Implements ILevelRepository against GET /levels (§14) — the only levels
 * endpoint the backend exposes, called once (e.g. at app start via
 * GetLevelsUseCase). findById never re-hits the network: it reads from the same
 * in-memory snapshot findAll() just fetched, which is exactly the flow the app
 * follows — fetch every level once, then just look one up locally when the
 * player picks it to play. findAll() is the only thing that ever refreshes it.
 */
export class HttpLevelRepository implements ILevelRepository {
  private cachedLevels: Level[] | null = null;

  constructor(private readonly httpClient: IHttpClient) {}

  async findAll(): Promise<Level[]> {
    const dtos = await this.httpClient.get<LevelDTO[]>('/levels');
    this.cachedLevels = dtos.map((dto) => LevelMapper.toDomain(dto));
    return this.cachedLevels;
  }

  async findById(id: LevelId): Promise<Level | null> {
    const levels = this.cachedLevels ?? (await this.findAll());
    return levels.find((level) => level.id.equals(id)) ?? null;
  }
}
