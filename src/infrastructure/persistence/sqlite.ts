import * as SQLite from 'expo-sqlite';
import {
  IPlayerProgressStore,
  PlayerProgressRow,
} from '../../interface-adapters/ports/IPlayerProgressStore';

interface PlayerProgressTableRow {
  level_id: string;
  order_index: number;
  completed: number;
  best_score: number;
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
