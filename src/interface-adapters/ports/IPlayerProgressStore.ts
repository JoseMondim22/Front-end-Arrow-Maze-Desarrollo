/** One row of local player progress storage — the persisted shape, not a domain type. */
export interface PlayerProgressRow {
  levelId: string;
  order: number;
  completed: boolean;
  bestScore: number;
}

/**
 * Local port owned by interface-adapters: what SqlitePlayerProgressRepository needs
 * from local storage. Deliberately storage-agnostic (no mention of SQL/SQLite) —
 * the concrete implementation (Capa 4, expo-sqlite) satisfies this shape.
 */
export interface IPlayerProgressStore {
  loadAll(): Promise<PlayerProgressRow[]>;
  saveAll(rows: PlayerProgressRow[]): Promise<void>;
}
