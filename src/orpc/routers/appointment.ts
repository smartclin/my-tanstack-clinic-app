import { and, between, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { appointment } from "../../db/schema";
import { AppointmentCreateSchema, AppointmentUpdateSchema } from "../../db/validators";
import { protectedProcedure } from "../init";

// Create appointment
export const createAppointment = protectedProcedure
	.input(AppointmentCreateSchema)
	.output(AppointmentUpdateSchema)
	.handler(async ({ input, context }) => {
		// Check for conflicts
		const existing = await db.query.appointment.findFirst({
			where: and(
				eq(appointment.doctorId, input.doctorId),
				eq(appointment.appointmentDate, input.appointmentDate),
				eq(appointment.status, "PENDING")
			)
		});

		if (existing) {
			throw new Error("Doctor is already booked at this time");
		}
		if (!context.clinicId) {
			throw new Error("Missing clinicId in context");
		}

		const { clinicId, ...appointmentInput } = input;
		const [newAppointment] = await db
			.insert(appointment)
			.values({
				...appointmentInput,
				clinicId: context.clinicId,
				id: crypto.randomUUID()
			})
			.returning();
		return newAppointment;
	});

// Get appointments by date range
export const getAppointmentsByDateRange = protectedProcedure
	.input(
		z.object({
			startDate: z.date(),
			endDate: z.date(),
			doctorId: z.string().optional(),
			status: z.string().optional()
		})
	)
	.output(z.array(AppointmentUpdateSchema))
	.handler(async ({ input, context }) => {
		let whereClause = and(
			eq(appointment.clinicId, context.clinicId),
			between(appointment.appointmentDate, input.startDate, input.endDate),
			eq(appointment.isDeleted, false)
		);

		if (input.doctorId) {
			whereClause = and(whereClause, eq(appointment.doctorId, input.doctorId));
		}

		if (input.status) {
			whereClause = and(whereClause, eq(appointment.status, input.status));
		}

		return await db.query.appointment.findMany({
			where: whereClause,
			with: {
				patient: true,
				doctor: true
			},
			orderBy: desc(appointment.appointmentDate)
		});
	});

// Update appointment status
export const updateAppointmentStatus = protectedProcedure
	.input(
		z.object({
			id: z.string(),
			status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
		})
	)
	.output(AppointmentUpdateSchema)
	.handler(async ({ input, context }) => {
		const [updated] = await db
			.update(appointment)
			.set({ status: input.status })
			.where(and(eq(appointment.id, input.id), eq(appointment.clinicId, context.clinicId)))
			.returning();
		return updated;
	});
