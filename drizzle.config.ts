import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

import { env } from "./src/env";

config({ path: [".env.local", ".env"] });
const localDb = "file:./data.db"; // local SQLite file

export default defineConfig({
	out: "./src/db/migrations",
	schema: "./src/db/schema.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: env.DRIZZLE_URL?.split("?")[0] ?? localDb
	}
});
