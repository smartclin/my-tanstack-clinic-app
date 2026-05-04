// routers/prescription.router.ts
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { prescribedItem, prescription } from "../../db/schema";

// Create prescription with items
export const createPrescription = protectedProcedure
	.input(
		z.object({
			medicalRecordId: z.string(),
			patientId: z.string(),
			doctorId: z.string(),
			encounterId: z.string(),
			items: z.array(
				z.object({
					drugId: z.string(),
					dosageValue: z.number(),
					dosageUnit: z.string(),
					frequency: z.string(),
					duration: z.string(),
					instructions: z.string().optional()
				})
			)
		})
	)
	.output(z.any())
	.handler(async ({ input, context }) => {
		const prescriptionId = crypto.randomUUID();

		// Create prescription
		const [newPrescription] = await db
			.insert(prescription)
			.values({
				id: prescriptionId,
				medicalRecordId: input.medicalRecordId,
				patientId: input.patientId,
				doctorId: input.doctorId,
				encounterId: input.encounterId,
				clinicId: context.clinicId
			})
			.returning();

		// Create prescribed items
		const prescribedItems = await Promise.all(
			input.items.map(async item => {
				const [prescribed] = await db
					.insert(prescribedItem)
					.values({
						id: crypto.randomUUID(),
						prescriptionId,
						...item
					})
					.returning();
				return prescribed;
			})
		);

		return { ...newPrescription, items: prescribedItems };
	});

// Get active prescriptions for patient
export const getPatientActivePrescriptions = protectedProcedure
	.input(z.object({ patientId: z.string() }))
	.output(z.array(z.any()))
	.handler(async ({ input, context }) => {
		return await db.query.prescription.findMany({
			where: and(
				eq(prescription.patientId, input.patientId),
				eq(prescription.clinicId, context.clinicId),
				eq(prescription.status, "active")
			),
			with: {
				prescribedItems: {
					with: {
						drug: true
					}
				},
				doctor: true
			},
			orderBy: (prescriptions, { desc }) => [desc(prescriptions.issuedDate)]
		});
	});
