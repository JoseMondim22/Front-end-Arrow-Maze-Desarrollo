import { LevelId } from '../shared/value-objects/LevelId';
import { Level } from './Level';

/**
 * Repository port for the Level aggregate. Lives in the domain, next to the
 * aggregate it serves (repository-as-contract). Adapters implement it; use cases
 * depend on this abstraction, never on a concrete HTTP repository.
 */
export interface ILevelRepository {
  findAll(): Promise<Level[]>;
  findById(id: LevelId): Promise<Level | null>;
}
