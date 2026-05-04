// routers/growth.router.ts
import { and, between, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { growthRecord, patient, whoGrowthStandard } from "../../db/schema";
import { authMiddleware, clinicMiddleware, o } from "../init";

export const growthRouter = o.route({ path: "/growth" }).use(authMiddleware).use(clinicMiddleware);

// Record growth measurement
export const recordGrowth = growthRouter
	.input(
		z.object({
			patientId: z.string(),
			date: z.date(),
			weight: z.number().optional(),
			height: z.number().optional(),
			headCircumference: z.number().optional(),
			notes: z.string().optional()
		})
	)
	.output(z.any())
	.handler(async ({ input, context }) => {
		const patientData = await db.query.patient.findFirst({
			where: eq(patient.id, input.patientId)
		});

		if (!patientData) throw new Error("Patient not found");

		// Calculate age in months and days
		const ageInMonths = calculateAgeInMonths(patientData.dateOfBirth, input.date);
		const ageInDays = calculateAgeInDays(patientData.dateOfBirth, input.date);

		if (!patientData.gender) {
			throw new Error("Patient gender is required");
		}
		const gender = patientData.gender;

		// Calculate Z-scores using WHO standards
		let weightForAgeZ = null;
		let heightForAgeZ = null;
		const bmiForAgeZ = null;

		if (input.weight) {
			const weightStandard = await getWHOStandard(ageInDays, gender, "WEIGHT");
			if (weightStandard) {
				weightForAgeZ = calculateZScore(
					input.weight,
					weightStandard.mValue,
					weightStandard.lValue,
					weightStandard.sValue
				);
			}
		}

		if (input.height) {
			const heightStandard = await getWHOStandard(ageInDays, gender, "HEIGHT");
			if (heightStandard) {
				heightForAgeZ = calculateZScore(
					input.height,
					heightStandard.mValue,
					heightStandard.lValue,
					heightStandard.sValue
				);
			}
		}

		const [record] = await db
			.insert(growthRecord)
			.values({
				id: crypto.randomUUID(),
				clinicId: context.clinicId,
				patientId: input.patientId,
				gender: patientData.gender,
				ageDays: ageInDays,
				ageMonths: ageInMonths,
				date: input.date,
				weight: input.weight,
				height: input.height,
				headCircumference: input.headCircumference,
				weightForAgeZ,
				heightForAgeZ,
				bmiForAgeZ,
				notes: input.notes
			})
			.returning();

		return record;
	});

// Get growth chart data
export const getGrowthChart = growthRouter
	.input(
		z.object({
			patientId: z.string(),
			measurementType: z.enum(["WEIGHT", "HEIGHT", "BMI", "HEAD_CIRCUMFERENCE"]),
			fromDate: z.date().optional(),
			toDate: z.date().optional()
		})
	)
	.output(z.any())
	.handler(async ({ input, context }) => {
		let whereClause = and(eq(growthRecord.patientId, input.patientId), eq(growthRecord.clinicId, context.clinicId));

		if (input.fromDate && input.toDate) {
			whereClause = and(whereClause, between(growthRecord.date, input.fromDate, input.toDate));
		}

		const records = await db.query.growthRecord.findMany({
			where: whereClause,
			orderBy: (growthRecord, { asc }) => [asc(growthRecord.date)]
		});

		const chartData = records.map(record => ({
			date: record.date,
			value: getMeasurementValue(record, input.measurementType),
			zScore: getZScoreValue(record, input.measurementType)
		}));

		return chartData;
	});

// Helper functions
function calculateAgeInMonths(birthDate: Date, date: Date): number {
	const months = (date.getFullYear() - birthDate.getFullYear()) * 12;
	return months + (date.getMonth() - birthDate.getMonth());
}

function calculateAgeInDays(birthDate: Date, date: Date): number {
	return Math.floor((date.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
}

async function getWHOStandard(ageDays: number, gender: string, type: string) {
	return await db.query.whoGrowthStandard.findFirst({
		where: and(
			eq(whoGrowthStandard.ageDays, ageDays),
			eq(whoGrowthStandard.gender, gender),
			eq(whoGrowthStandard.measurementType, type)
		)
	});
}

function calculateZScore(value: number, m: number, l: number, s: number): number {
	if (l === 0) {
		return Math.log(value / m) / s;
	}
	return ((value / m) ** l - 1) / (l * s);
}

type GrowthRecordMeasurement = {
	weight?: number | null;
	height?: number | null;
	bmi?: number | null;
	headCircumference?: number | null;
	weightForAgeZ?: number | null;
	heightForAgeZ?: number | null;
	bmiForAgeZ?: number | null;
};

function getMeasurementValue(record: GrowthRecordMeasurement, type: string): number | null {
	switch (type) {
		case "WEIGHT":
			return record.weight ?? null;
		case "HEIGHT":
			return record.height ?? null;
		case "BMI":
			return record.bmi ?? null;
		case "HEAD_CIRCUMFERENCE":
			return record.headCircumference ?? null;
		default:
			return null;
	}
}

function getZScoreValue(record: GrowthRecordMeasurement, type: string): number | null {
	switch (type) {
		case "WEIGHT":
			return record.weightForAgeZ ?? null;
		case "HEIGHT":
			return record.heightForAgeZ ?? null;
		case "BMI":
			return record.bmiForAgeZ ?? null;
		default:
			return null;
	}
}
