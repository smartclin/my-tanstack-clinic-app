// routers/patient.router.ts
import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { patient } from "../../db/schema";
import { PatientCreateSchema, PatientSelectSchema, PatientUpdateSchema } from "../../db/validators";
// Import the pre-configured procedure
// Create patient
export const createPatient = protectedProcedure
	.input(PatientCreateSchema)
	.output(PatientSelectSchema)
	.handler(async ({ input, context }) => {
		// TypeScript now knows context.clinic.id and context.user.id exist!
		const [newPatient] = await db
			.insert(patient)
			.values({
				...input,
				clinicId: context.clinic.id,
				createdById: context.user.id,
				id: crypto.randomUUID()
			})
			.returning();
		return newPatient;
	});

// Get patient by ID
export const getPatient = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(PatientSelectSchema.nullable())
	.handler(async ({ input, context }) => {
		const result = await db.query.patient.findFirst({
			where: and(eq(patient.id, input.id), eq(patient.clinicId, context.clinic.id), eq(patient.isDeleted, false))
		});
		return result ?? null;
	});

// ... repeat for listPatients, updatePatient, etc., using protectedProcedure
// List patients with pagination and filters
export const listPatients = protectedProcedure
	.input(
		z.object({
			page: z.number().default(1),
			limit: z.number().default(10),
			search: z.string().optional(),
			status: z.string().optional(),
			isActive: z.boolean().optional()
		})
	)
	.output(
		z.object({
			patients: z.array(PatientSelectSchema),
			total: z.number(),
			page: z.number(),
			totalPages: z.number()
		})
	)
	.handler(async ({ input, context }) => {
		const { page, limit, search, status, isActive } = input;
		const offset = (page - 1) * limit;

		let whereClause = and(eq(patient.clinicId, context.clinic.id), eq(patient.isDeleted, false));

		if (search) {
			whereClause = and(
				whereClause,
				or(
					like(patient.firstName, `%${search}%`),
					like(patient.lastName, `%${search}%`),
					like(patient.email, `%${search}%`),
					like(patient.phone, `%${search}%`)
				)
			);
		}

		if (status) {
			whereClause = and(whereClause, eq(patient.status, status));
		}

		if (isActive !== undefined) {
			whereClause = and(whereClause, eq(patient.isActive, isActive));
		}

		const patientsList = await db.query.patient.findMany({
			where: whereClause,
			limit,
			offset,
			orderBy: desc(patient.createdAt)
		});

		const total = await db.$count(patient, whereClause);

		return {
			patients: patientsList,
			total,
			page,
			totalPages: Math.ceil(total / limit)
		};
	});

// Update patient
export const updatePatient = protectedProcedure
	.input(
		z.object({
			id: z.string(),
			data: PatientUpdateSchema
		})
	)
	.output(PatientSelectSchema)
	.handler(async ({ input, context }) => {
		const [updated] = await db
			.update(patient)
			.set({ ...input.data, updatedById: context.user.id })
			.where(and(eq(patient.id, input.id), eq(patient.clinicId, context.clinic.id)))
			.returning();
		return updated;
	});

// Soft delete patient
export const deletePatient = clinicProcedure
	.input(z.object({ id: z.string() }))
	.output(z.boolean())
	.handler(async ({ input, context }) => {
		await db
			.update(patient)
			.set({ isDeleted: true, deletedAt: new Date() })
			.where(and(eq(patient.id, input.id), eq(patient.clinicId, context.clinic.id)));
		return true;
	});
