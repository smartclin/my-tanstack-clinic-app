import Database from "better-sqlite3";
import { type BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "../env";
import * as schema from "./schema";

export function createDb(): BetterSQLite3Database<typeof schema> {
	// Initialize SQLite database file
	const sqlite = new Database(env.DRIZZLE_URL?.replace(/^file:/, "") ?? "./data.db");

	// SQLite tuning (safe defaults for WAL mode)
	sqlite.pragma("journal_mode = WAL");
	sqlite.pragma("synchronous = NORMAL");
	sqlite.pragma("cache_size = -64000"); // ~64MB
	sqlite.pragma("busy_timeout = 30000");

	return drizzle(sqlite, { schema });
}

/**
 * Global singleton (dev + hot reload safe)
 */
declare global {
	// eslint-disable-next-line no-var
	var __db: BetterSQLite3Database<typeof schema> | undefined;
}

export const db =
	globalThis.__db ??
	(() => {
		const instance = createDb();
		if (process.env.NODE_ENV !== "production") {
			globalThis.__db = instance;
		}
		return instance;
	})();

export type DbExecutor = BetterSQLite3Database<typeof schema>;
export type AppDb = typeof db;
