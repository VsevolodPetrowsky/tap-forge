import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

import Database from 'better-sqlite3';

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string) {
    // Ensure directory exists
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
  }

  private initializeTables(): void {
    // Players cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS players (
        address TEXT PRIMARY KEY,
        total_taps INTEGER DEFAULT 0,
        total_rewards TEXT DEFAULT '0',
        taps_since_critical INTEGER DEFAULT 0,
        last_tap_block TEXT DEFAULT '0',
        total_power TEXT DEFAULT '0',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Miners cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS miners (
        token_id TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        rarity TEXT NOT NULL,
        base_power TEXT NOT NULL,
        level INTEGER DEFAULT 0,
        name TEXT,
        minted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Player miners junction table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS player_miners (
        player_address TEXT NOT NULL,
        token_id TEXT NOT NULL,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (player_address, token_id),
        FOREIGN KEY (player_address) REFERENCES players(address),
        FOREIGN KEY (token_id) REFERENCES miners(token_id)
      )
    `);

    // Game events log
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        player_address TEXT NOT NULL,
        data TEXT NOT NULL,
        block_number TEXT NOT NULL,
        transaction_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_players_total_rewards ON players(total_rewards DESC);
      CREATE INDEX IF NOT EXISTS idx_players_total_taps ON players(total_taps DESC);
      CREATE INDEX IF NOT EXISTS idx_miners_owner ON miners(owner);
      CREATE INDEX IF NOT EXISTS idx_events_player ON events(player_address);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
    `);
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }
}
