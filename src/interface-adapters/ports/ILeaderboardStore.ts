/** One row of local leaderboard cache storage — the persisted shape, not a domain type. */
export interface LeaderboardEntryRow {
  levelId: string;
  position: number;
  username: string;
  score: number;
}

/**
 * Local port owned by interface-adapters: what SqliteLeaderboardRepository
 * needs from local storage. Deliberately storage-agnostic (no mention of
 * SQL/SQLite) — the concrete implementation (Capa 4, expo-sqlite) satisfies
 * this shape.
 */
export interface ILeaderboardStore {
  loadTop(params: { levelId: string; limit: number }): Promise<LeaderboardEntryRow[]>;
  replaceForLevel(params: { levelId: string; entries: LeaderboardEntryRow[] }): Promise<void>;
}
