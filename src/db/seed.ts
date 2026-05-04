import "dotenv/config";

import { type AppDb, db } from "./";
import { runSeed } from "./seed/seed";
import drugSeed from "./seed/seed-drugs";
import wfaSeed from "./seed/seed-wfa";

/**
 * Master seed runner
 */
async function runAllSeeds(db: AppDb) {
	console.log("🚀 Starting Master Seeding Orchestration...\n");

	await runSeed(db);
	console.log("✅ Base Data (Clinic / Faker) Seeded");
	console.log("--------------------------------------------------");

	await drugSeed(db);
	console.log("✅ NICU Drug Database Seeded");
	console.log("--------------------------------------------------");

	await wfaSeed(db);
	console.log("✅ WHO WFA (JSON) Seeded");
	console.log("--------------------------------------------------");

	console.log("🎉 All seeds completed successfully!");
}

/**
 * Top-level execution
 */
(async () => {
	try {
		await runAllSeeds(db);
	} catch (error) {
		console.error("❌ Master Seeding failed:", error);
		process.exitCode = 1;
	}
})();
