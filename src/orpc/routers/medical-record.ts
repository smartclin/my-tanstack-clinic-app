// routers/medical-record.router.ts
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { diagnosis, medicalRecord, vitalSign } from "../../db/schema";
import { MedicalRecordCreateSchema } from "../../db/validators";

// Create complete medical record with diagnosis and vitals
export const createMedicalRecord = protectedProcedure
	.input(
		z.object({
			record: MedicalRecordCreateSchema,
			diagnosis: z
				.object({
					symptoms: z.string(),
					diagnosis: z.string().optional(),
					treatment: z.string().optional()
				})
				.optional(),
			vitals: z
				.object({
					bodyTemperature: z.number().optional(),
					systolic: z.number().optional(),
					diastolic: z.number().optional(),
					heartRate: z.number().optional()
				})
				.optional()
		})
	)
	.output(z.any())
	.handler(async ({ input, context }) => {
		const recordId = crypto.randomUUID();

		// Create medical record
		const [record] = await db
			.insert(medicalRecord)
			.values({
				...input.record,
				id: recordId,
				clinicId: context.clinicId
			})
			.returning();

		// Create diagnosis if provided
		if (input.diagnosis) {
			if (!input.record.doctorId) {
				throw new Error("Doctor ID is required to create a diagnosis");
			}
			await db.insert(diagnosis).values({
				id: crypto.randomUUID(),
				medicalId: recordId,
				patientId: input.record.patientId,
				doctorId: input.record.doctorId,
				clinicId: context.clinicId,
				appointmentId: input.record.appointmentId,
				symptoms: input.diagnosis.symptoms,
				diagnosis: input.diagnosis.diagnosis,
				treatment: input.diagnosis.treatment
			});
		}

		// Create vitals if provided
		if (input.vitals) {
			await db.insert(vitalSign).values({
				id: crypto.randomUUID(),
				medicalId: recordId,
				patientId: input.record.patientId,
				clinicId: context.clinicId,
				...input.vitals
			});
		}

		return record;
	});

// Get patient medical history
export const getPatientMedicalHistory = protectedProcedure
	.input(
		z.object({
			patientId: z.string(),
			limit: z.number().default(20),
			offset: z.number().default(0)
		})
	)
	.output(
		z.object({
			records: z.array(z.any()),
			total: z.number()
		})
	)
	.handler(async ({ input, context }) => {
		const { patientId, limit, offset } = input;

		const records = await db.query.medicalRecord.findMany({
			where: and(
				eq(medicalRecord.patientId, patientId),
				eq(medicalRecord.clinicId, context.clinicId),
				eq(medicalRecord.isDeleted, false)
			),
			with: {
				doctor: true,
				appointment: true,
				encounter: true,
				vitalSigns: true,
				prescriptions: true
			},
			limit,
			offset,
			orderBy: desc(medicalRecord.createdAt)
		});

		const total = await db.$count(
			medicalRecord,
			and(eq(medicalRecord.patientId, patientId), eq(medicalRecord.clinicId, context.clinicId))
		);

		return { records, total };
	});
