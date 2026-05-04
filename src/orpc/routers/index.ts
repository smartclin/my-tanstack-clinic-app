import type { db } from "../../db";
import { auth } from "../../lib/auth";

export const appRouter = router({
	household: {
		list: procedure.query(async () => {
			return db.select().from(households).all();
		}),
		create: procedure.mutation(async ({ input }) => {
			// auth check
			auth.requireRole("admin");
			return db.insert(households).values({ name: input.name }).returning().get();
		})
	},
	patient: {
		listByHousehold: procedure.query(async ({ input }) => {
			return db.select().from(patients).where(patients.householdId.eq(input.householdId)).all();
		})
	}
});
export type AppRouter = typeof appRouter;
