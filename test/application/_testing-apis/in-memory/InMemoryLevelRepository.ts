import { ILevelRepository } from '@domain/level/ILevelRepository';
import { Level } from '@domain/level/Level';
import { LevelId } from '@domain/shared/value-objects/LevelId';

/** In-memory fake for ILevelRepository. Models real find behavior, not just a
 * canned return value. */
export class InMemoryLevelRepository implements ILevelRepository {
  private readonly levels: Level[] = [];

  async findAll(): Promise<Level[]> {
    return [...this.levels];
  }

  async findById(id: LevelId): Promise<Level | null> {
    return this.levels.find((level) => level.id.equals(id)) ?? null;
  }

  seed(...levels: Level[]): void {
    this.levels.push(...levels);
  }
}
