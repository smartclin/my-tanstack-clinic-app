import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";

import { db } from "./";
import * as schema from "./schema";
import { clinicMembers, clinics, doctor, user } from "./schema";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hazem032012@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "HealthF26";
const ADMIN_NAME = process.env.ADMIN_NAME || "Dr.Hazem Ali";
const ADMINPHONE = "01003497579";
const CLINICNAME = "Smart Clinic";

export async function seedAdminUser() {
	console.log("🌱 Seeding admin user...");

	try {
		// Check if admin already exists
		const existingAdmin = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, ADMIN_EMAIL)
		});

		if (existingAdmin) {
			console.log("✅ Admin user already exists");
			return;
		}

		// 4️⃣ Create or Update Clinic
		const clinicResult = await db
			.insert(clinics)
			.values({
				id: faker.string.uuid(),
				name: CLINICNAME,
				address: "Hurghada, Egypt",
				phone: ADMINPHONE,
				email: ADMIN_EMAIL,
				timezone: "Africa/Cairo",
				isDeleted: false
			})
			.onConflictDoUpdate({
				target: clinics.name, // unique column
				set: {
					address: "Hurghada, Egypt",
					phone: ADMINPHONE,
					email: ADMIN_EMAIL,
					timezone: "Africa/Cairo",
					isDeleted: false
				}
			})
			.returning();

		const clinic = clinicResult[0];
		if (!clinic) {
			throw new Error("Failed to create or retrieve clinic during seeding.");
		}

		console.log(`🏥 Clinic created/updated: ${clinic.name}`);

		// Create admin user using Better Auth API
		const result = await auth.api.createUser({
			body: {
				name: ADMIN_NAME,
				email: ADMIN_EMAIL,
				password: ADMIN_PASSWORD,
				role: "superadmin",
				data: { clinicId: clinic.id }
			}
		});

		// 4️⃣ Update user and upsert related data
		await Promise.all([
			// Update user
			db.update(user).set({ emailVerified: true, role: "superadmin" }).where(eq(user.id, result.user.id)),

			// Upsert configStore
			db
				.insert(schema.configStore)
				.values({ key: "admin_onboarded", value: "true" })
				.onConflictDoUpdate({
					target: schema.configStore.key,
					set: { value: "true" }
				}),

			// Upsert doctor
			db
				.insert(doctor)
				.values({
					id: faker.string.uuid(),
					userId: result.user.id,
					email: ADMIN_EMAIL,
					name: ADMIN_NAME,
					specialty: "Pediatrician",
					licenseNumber: "SMART-ADM-001",
					phone: ADMINPHONE,
					address: "Hurghada, Egypt",
					department: "Pediatrics",
					img: faker.image.avatar(),
					colorCode: faker.color.rgb(),
					availabilityStatus: "Available",
					type: "FULL",
					role: "ADMIN",
					availableFromWeekDay: 1,
					availableToWeekDay: 5,
					availableFromTime: "09:00",
					availableToTime: "17:00",
					appointmentPrice: 0,
					clinicId: clinic.id ?? ""
				})
				.onConflictDoUpdate({
					target: doctor.userId, // unique column
					set: {
						name: ADMIN_NAME,
						specialty: "Pediatrician",
						licenseNumber: "SMART-ADM-001",
						phone: ADMINPHONE,
						address: "Hurghada, Egypt",
						department: "Pediatrics",
						img: faker.image.avatar(),
						colorCode: faker.color.rgb(),
						availabilityStatus: "Available",
						type: "FULL",
						role: "ADMIN",
						availableFromWeekDay: 1,
						availableToWeekDay: 5,
						availableFromTime: "09:00",
						availableToTime: "17:00",
						appointmentPrice: 0,
						clinicId: clinic.id
					}
				}),

			// Upsert clinicMember
			db
				.insert(clinicMembers)
				.values({
					userId: result.user.id,
					clinicId: clinic.id,
					role: "superadmin"
				})
				.onConflictDoUpdate({
					target: [clinicMembers.userId, clinicMembers.clinicId], // composite unique
					set: { role: "superadmin" }
				})
		]);

		console.log(`✅ Admin user seeded: ${result.user.email}`);
	} catch (error) {
		console.error("❌ Failed to seed admin user:", error);
		throw error;
	}
}

// Run if called directly
if (require.main === module) {
	seedAdminUser()
		.then(() => process.exit)
		.catch(() => process.exit);
}
