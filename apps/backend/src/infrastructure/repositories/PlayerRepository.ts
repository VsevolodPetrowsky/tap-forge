import type Database from 'better-sqlite3';

export interface PlayerRecord {
  address: string;
  total_taps: number;
  total_rewards: string;
  taps_since_critical: number;
  last_tap_block: string;
  total_power: string;
  created_at: string;
  updated_at: string;
}

export class PlayerRepository {
  constructor(private readonly db: Database.Database) {}

  findByAddress(address: string): PlayerRecord | null {
    const stmt = this.db.prepare('SELECT * FROM players WHERE address = ?');
    return stmt.get(address) as PlayerRecord | null;
  }

  upsert(player: Omit<PlayerRecord, 'created_at' | 'updated_at'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO players (address, total_taps, total_rewards, taps_since_critical, last_tap_block, total_power, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(address) DO UPDATE SET
        total_taps = excluded.total_taps,
        total_rewards = excluded.total_rewards,
        taps_since_critical = excluded.taps_since_critical,
        last_tap_block = excluded.last_tap_block,
        total_power = excluded.total_power,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      player.address,
      player.total_taps,
      player.total_rewards,
      player.taps_since_critical,
      player.last_tap_block,
      player.total_power,
    );
  }

  getLeaderboard(limit: number = 100, offset: number = 0): PlayerRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM players
      ORDER BY CAST(total_rewards AS INTEGER) DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as PlayerRecord[];
  }

  getPlayerRank(address: string): number | null {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM players
      WHERE CAST(total_rewards AS INTEGER) > (
        SELECT CAST(total_rewards AS INTEGER)
        FROM players
        WHERE address = ?
      )
    `);
    const result = stmt.get(address) as { rank: number } | undefined;
    return result?.rank ?? null;
  }
}
