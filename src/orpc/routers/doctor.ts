// routers/doctor.router.ts
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { doctor, workingDays } from "../../db/schema";
import { doctorCreateSchema, doctorUpdateSchema } from "../../db/validators";
import { authMiddleware, clinicMiddleware, o } from "../init";

export const doctorRouter = o.route({ path: "/doctor" }).use(authMiddleware).use(clinicMiddleware);

// Create doctor
export const createDoctor = doctorRouter
	.input(doctorCreateSchema)
	.output(doctorUpdateSchema)
	.handler(async ({ input, context }) => {
		const [newDoctor] = await db
			.insert(doctor)
			.values({
				...input,
				clinicId: context.clinicId,
				id: crypto.randomUUID()
			})
			.returning();
		return newDoctor;
	});

// Get doctor with working days
export const getDoctorWithSchedule = doctorRouter
	.input(z.object({ id: z.string() }))
	.output(
		doctorUpdateSchema
			.extend({
				workingDays: z.array(z.any())
			})
			.nullable()
	)
	.handler(async ({ input, context }) => {
		const doctorData = await db.query.doctor.findFirst({
			where: and(eq(doctor.id, input.id), eq(doctor.clinicId, context.clinicId), eq(doctor.isDeleted, false)),
			with: {
				workingDays: true
			}
		});
		return doctorData ?? null;
	});

// Get available doctors
export const getAvailableDoctors = doctorRouter
	.input(
		z.object({
			date: z.date(),
			specialty: z.string().optional()
		})
	)
	.output(z.array(doctorUpdateSchema))
	.handler(async ({ input, context }) => {
		const dayOfWeek = input.date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

		let whereClause = and(
			eq(doctor.clinicId, context.clinicId),
			eq(doctor.isActive, true),
			eq(doctor.isDeleted, false)
		);

		if (input.specialty) {
			whereClause = and(whereClause, eq(doctor.specialty, input.specialty));
		}

		const doctorsList = await db.query.doctor.findMany({
			where: whereClause,
			with: {
				workingDays: {
					where: eq(workingDays.day, dayOfWeek)
				}
			}
		});

		return doctorsList.filter(d => d.workingDays.length > 0);
	});
