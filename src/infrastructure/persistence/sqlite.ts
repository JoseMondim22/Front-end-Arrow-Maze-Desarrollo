import * as SQLite from 'expo-sqlite';
import {
  IPlayerProgressStore,
  PlayerProgressRow,
} from '../../interface-adapters/ports/IPlayerProgressStore';
import {
  ILeaderboardStore,
  LeaderboardEntryRow,
} from '../../interface-adapters/ports/ILeaderboardStore';

interface PlayerProgressTableRow {
  level_id: string;
  order_index: number;
  completed: number;
  best_score: number;
}

interface LeaderboardTableRow {
  level_id: string;
  position: number;
  username: string;
  score: number;
}

const DATABASE_NAME = 'arrow-maze.db';

/**
 * Concrete IPlayerProgressStore backed by expo-sqlite (§4). save() always
 * receives the whole PlayerProgress snapshot (see PlayerProgressMapper.toRows),
 * so it replaces the table's contents wholesale inside one transaction rather
 * than diffing rows.
 */
export class SqlitePlayerProgressStore implements IPlayerProgressStore {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  async loadAll(): Promise<PlayerProgressRow[]> {
    const database = await this.db();
    const rows = await database.getAllAsync<PlayerProgressTableRow>(
      'SELECT level_id, order_index, completed, best_score FROM player_progress',
    );
    return rows.map((row) => ({
      levelId: row.level_id,
      order: row.order_index,
      completed: row.completed === 1,
      bestScore: row.best_score,
    }));
  }

  async saveAll(rows: PlayerProgressRow[]): Promise<void> {
    const database = await this.db();
    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM player_progress');
      for (const row of rows) {
        await database.runAsync(
          'INSERT INTO player_progress (level_id, order_index, completed, best_score) VALUES (?, ?, ?, ?)',
          row.levelId,
          row.order,
          row.completed ? 1 : 0,
          row.bestScore,
        );
      }
    });
  }

  private async db(): Promise<SQLite.SQLiteDatabase> {
    if (this.dbPromise === null) {
      this.dbPromise = this.openAndMigrate();
    }
    return this.dbPromise;
  }

  private async openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
    const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS player_progress (
        level_id TEXT PRIMARY KEY NOT NULL,
        order_index INTEGER NOT NULL,
        completed INTEGER NOT NULL,
        best_score INTEGER NOT NULL
      );
    `);
    return database;
  }
}

/**
 * Concrete ILeaderboardStore backed by expo-sqlite (§4). replaceForLevel()
 * always receives a level's whole top-N snapshot (from SyncLeaderboardsUseCase),
 * so it replaces that level's rows wholesale inside one transaction rather than
 * diffing — same idiom as SqlitePlayerProgressStore.saveAll, just scoped to one
 * level_id instead of the whole table.
 */
export class SqliteLeaderboardStore implements ILeaderboardStore {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  async loadTop(params: { levelId: string; limit: number }): Promise<LeaderboardEntryRow[]> {
    const database = await this.db();
    const rows = await database.getAllAsync<LeaderboardTableRow>(
      'SELECT level_id, position, username, score FROM leaderboard_cache WHERE level_id = ? ORDER BY position ASC LIMIT ?',
      params.levelId,
      params.limit,
    );
    return rows.map((row) => ({
      levelId: row.level_id,
      position: row.position,
      username: row.username,
      score: row.score,
    }));
  }

  async replaceForLevel(params: { levelId: string; entries: LeaderboardEntryRow[] }): Promise<void> {
    const database = await this.db();
    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM leaderboard_cache WHERE level_id = ?', params.levelId);
      for (const entry of params.entries) {
        await database.runAsync(
          'INSERT INTO leaderboard_cache (level_id, position, username, score) VALUES (?, ?, ?, ?)',
          entry.levelId,
          entry.position,
          entry.username,
          entry.score,
        );
      }
    });
  }

  private async db(): Promise<SQLite.SQLiteDatabase> {
    if (this.dbPromise === null) {
      this.dbPromise = this.openAndMigrate();
    }
    return this.dbPromise;
  }

  private async openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
    const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS leaderboard_cache (
        level_id TEXT NOT NULL,
        position INTEGER NOT NULL,
        username TEXT NOT NULL,
        score INTEGER NOT NULL,
        PRIMARY KEY (level_id, position)
      );
    `);
    return database;
  }
}
