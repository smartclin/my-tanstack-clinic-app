// routers/immunization.router.ts
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { immunization, patient } from "../../db/schema";
import { authMiddleware, clinicMiddleware, o } from "../init";

export const immunizationRouter = o.route({ path: "/immunization" }).use(authMiddleware).use(clinicMiddleware);

// Record immunization
export const recordImmunization = immunizationRouter
	.input(
		z.object({
			patientId: z.string(),
			vaccine: z.string(),
			date: z.date(),
			dose: z.string(),
			lotNumber: z.string().optional(),
			administeredByStaffId: z.string().optional(),
			notes: z.string().optional()
		})
	)
	.output(z.any())
	.handler(async ({ input, context }) => {
		const [record] = await db
			.insert(immunization)
			.values({
				id: crypto.randomUUID(),
				clinicId: context.clinicId,
				...input
			})
			.returning();
		return record;
	});

// Get immunization schedule for patient
export const getPatientImmunizationSchedule = immunizationRouter
	.input(z.object({ patientId: z.string() }))
	.output(z.any())
	.handler(async ({ input }) => {
		// Get patient age
		const patientData = await db.query.patient.findFirst({
			where: eq(patient.id, input.patientId)
		});

		if (!patientData) throw new Error("Patient not found");

		const ageInDays = Math.floor((Date.now() - patientData.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));

		// Get due vaccines based on age
		const dueVaccines = await db.query.vaccineSchedule.findMany({
			where: (vaccineSchedule, { lte, and: andV }) =>
				andV(lte(vaccineSchedule.ageInDaysMin, ageInDays), lte(vaccineSchedule.ageInDaysMax, ageInDays))
		});

		// Get administered vaccines
		const administered = await db.query.immunization.findMany({
			where: and(eq(immunization.patientId, input.patientId), eq(immunization.isDeleted, false))
		});

		// Filter out vaccines that have been administered
		const pendingVaccines = dueVaccines.filter(
			vaccine => !administered.some(admin => admin.vaccine === vaccine.vaccineName)
		);

		return {
			administered,
			pending: pendingVaccines,
			ageInDays
		};
	});
