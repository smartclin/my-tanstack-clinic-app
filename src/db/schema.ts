import { eq, relations, type SQL, sql } from "drizzle-orm";
import {
	index,
	integer,
	primaryKey,
	real,
	type SQLiteColumn,
	sqliteTable,
	sqliteView,
	text,
	uniqueIndex
} from "drizzle-orm/sqlite-core";
export const user = sqliteTable(
	"user",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
		image: text("image"),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.$onUpdate(() => new Date())
			.notNull(),
		role: text("role"),
		banned: integer("banned", { mode: "boolean" }).default(false),
		banReason: text("ban_reason"),
		banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
		twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" }).default(false),
		apiKey: text("api_key"),
		clinicId: text("clinic_id")
	},
	table => [index("user_email_idx").on(table.email)]
);

export const userQuota = sqliteTable("user_quota", {
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	quota: integer("quota").notNull().default(0),
	usedQuota: integer("used_quota").notNull().default(0),
	fileCount: integer("file_count").notNull().default(0),
	fileCountQuota: integer("file_count_quota").notNull().default(0),
	inviteCount: integer("invite_count").notNull().default(0),
	inviteQuota: integer("invite_quota").notNull().default(0),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		token: text("token").notNull().unique(),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		impersonatedBy: text("impersonated_by")
	},
	table => [index("session_userId_idx").on(table.userId)]
);

export const account = sqliteTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: integer("access_token_expires_at", {
			mode: "timestamp_ms"
		}),
		refreshTokenExpiresAt: integer("refresh_token_expires_at", {
			mode: "timestamp_ms"
		}),
		scope: text("scope"),
		password: text("password"),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("account_userId_idx").on(table.userId)]
);

export const verification = sqliteTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("verification_identifier_idx").on(table.identifier)]
);

export const twoFactor = sqliteTable(
	"two_factor",
	{
		id: text("id").primaryKey(),
		secret: text("secret").notNull(),
		backupCodes: text("backup_codes").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		verified: integer("verified", { mode: "boolean" }).default(true)
	},
	table => [index("twoFactor_secret_idx").on(table.secret), index("twoFactor_userId_idx").on(table.userId)]
);

export const folders = sqliteTable(
	"folders",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		parentId: text("parent_id").references((): SQLiteColumn => folders.id, {
			onDelete: "cascade"
		}),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	table => [index("idx_folders_user_id").on(table.userId), index("idx_folders_parent_id").on(table.parentId)]
);

export const files = sqliteTable(
	"files",
	{
		id: text("id").primaryKey(),
		slug: text("slug").notNull().unique(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		folderId: text("folder_id").references(() => folders.id, {
			onDelete: "cascade"
		}),
		filename: text("filename").notNull(),
		searchText: text("search_text").notNull().default(""),
		size: integer("size").notNull(),
		mimeType: text("mime_type").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	table => [
		index("idx_files_slug").on(table.slug),
		index("idx_files_search_text").on(table.searchText),
		index("idx_files_folder_id").on(table.folderId)
	]
);

export const configStore = sqliteTable("config_store", {
	key: text("key").primaryKey(),
	value: text("value").notNull()
});

export const invites = sqliteTable(
	"invites",
	{
		code: text("code").primaryKey(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
		createdBy: text("created_by").references(() => user.id, {
			onDelete: "set null"
		}),
		usedBy: text("used_by").references(() => user.id, { onDelete: "set null" }),
		usedAt: integer("used_at", { mode: "timestamp_ms" })
	},
	table => [index("invites_used_by_idx").on(table.usedBy)]
);

// =======================
// New Tables (from your Prisma schema)
// =======================

export const clinics = sqliteTable(
	"clinics",
	{
		id: text("id").primaryKey(),

		name: text("name").notNull(),
		email: text("email"),

		createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),

		updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch() * 1000)`),

		timezone: text("timezone").notNull().default("UTC"),
		address: text("address"),
		phone: text("phone"),

		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).notNull().default(false)
	},
	t => [
		// 🔑 REQUIRED for ON CONFLICT
		uniqueIndex("clinics_name_unique").on(t.name),

		// ⚡ soft-delete performance
		index("clinics_is_deleted_idx").on(t.isDeleted)
	]
);
export const clinicMembers = sqliteTable(
	"users_to_clinics",
	{
		userId: text("user_id").notNull().unique(), // ← REQUIRED
		clinicId: text("clinic_id").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
		role: text("role")
	},
	table => [primaryKey({ columns: [table.userId, table.clinicId] })]
);

export const doctor = sqliteTable(
	"doctor",
	{
		id: text("id").primaryKey(),
		email: text("email"),
		name: text("name").notNull(),
		userId: text("user_id").unique(),
		clinicId: text("clinic_id"),
		specialty: text("specialty").notNull(),
		licenseNumber: text("license_number"),
		phone: text("phone"),
		address: text("address"),
		department: text("department"),
		img: text("img"),
		colorCode: text("color_code"),
		availabilityStatus: text("availability_status"),
		availableFromWeekDay: integer("available_from_week_day"),
		availableToWeekDay: integer("available_to_week_day"),
		isActive: integer("is_active", { mode: "boolean" }),
		status: text("status"),
		availableFromTime: text("available_from_time"),
		availableToTime: text("available_to_time"),
		type: text("type").default("FULL"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
		appointmentPrice: integer("appointment_price"),
		role: text("role"),
		rating: integer("rating"),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).default(false)
	},
	table => [
		index("doctors_clinic_id_is_active_idx").on(table.clinicId, table.isActive),
		index("doctors_specialty_clinic_id_idx").on(table.specialty, table.clinicId),
		index("doctors_is_deleted_idx").on(table.isDeleted)
	]
);

export const workingDays = sqliteTable(
	"working_day",
	{
		id: text("id").primaryKey(),
		doctorId: text("doctor_id").notNull(),
		day: text("day").notNull(),
		startTime: text("start_time").notNull(),
		endTime: text("end_time").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [uniqueIndex("working_days_doctor_id_day_unique").on(table.doctorId, table.day)]
);

export const staff = sqliteTable(
	"staff",
	{
		id: text("id").primaryKey(),
		email: text("email"),
		name: text("name").notNull(),
		phone: text("phone"),
		userId: text("user_id").unique(),
		clinicId: text("clinic_id"),
		address: text("address").notNull(),
		department: text("department"),
		img: text("img"),
		licenseNumber: text("license_number"),
		colorCode: text("color_code"),
		hireDate: integer("hire_date", { mode: "timestamp_ms" }),
		salary: real("salary"),
		role: text("role").notNull(),
		status: text("status").default("ACTIVE"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isActive: integer("is_active", { mode: "boolean" })
	},
	table => [index("staffs_deleted_at_idx").on(table.deletedAt)]
);

export const patient = sqliteTable(
	"patient",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id").notNull(),
		userId: text("user_id").notNull().unique(),
		email: text("email").unique(),
		phone: text("phone"),
		emergencyContactNumber: text("emergency_contact_number"),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		dateOfBirth: integer("date_of_birth", { mode: "timestamp_ms" }).notNull(),
		gender: text("gender").default("MALE"),
		maritalStatus: text("marital_status"),
		nutritionalStatus: text("nutritional_status"),
		address: text("address"),
		emergencyContactName: text("emergency_contact_name"),
		relation: text("relation"),
		allergies: text("allergies"),
		medicalConditions: text("medical_conditions"),
		medicalHistory: text("medical_history"),
		image: text("image"),
		colorCode: text("color_code"),
		role: text("role"),
		status: text("status").default("ACTIVE"),
		isActive: integer("is_active", { mode: "boolean" }).default(true),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
		createdById: text("created_by_id"),
		updatedById: text("updated_by_id"),
		bloodGroup: text("blood_group"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("patients_clinic_active_deleted_idx").on(
			table.clinicId,
			table.isActive,
			table.isDeleted,
			table.createdAt
		),
		index("patients_date_of_birth_idx").on(table.dateOfBirth),
		index("patients_clinic_status_idx").on(table.clinicId, table.status),
		index("patients_name_idx").on(table.lastName, table.firstName)
	]
);

export const appointment = sqliteTable(
	"appointment",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id").notNull(),
		doctorId: text("doctor_id").notNull(),
		serviceId: text("service_id"),
		doctorSpecialty: text("doctor_specialty"),
		clinicId: text("clinic_id").notNull(),
		appointmentDate: integer("appointment_date", {
			mode: "timestamp_ms"
		}).notNull(),
		time: text("time"),
		durationMinutes: integer("duration_minutes"),
		appointmentPrice: integer("appointment_price"),
		status: text("status").default("PENDING"),
		type: text("type").notNull(),
		note: text("note"),
		reason: text("reason"),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("appointments_clinic_date_status_idx").on(table.clinicId, table.appointmentDate, table.status),
		index("appointments_doctor_date_status_idx").on(table.doctorId, table.appointmentDate, table.status),
		index("appointments_patient_date_idx").on(table.patientId, table.appointmentDate),
		index("appointments_is_deleted_idx").on(table.isDeleted)
	]
);

export const medicalRecord = sqliteTable(
	"medical_record",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id").notNull(),
		appointmentId: text("appointment_id").notNull(),
		doctorId: text("doctor_id"),
		clinicId: text("clinic_id").notNull(),
		diagnosis: text("diagnosis"),
		symptoms: text("symptoms"),
		treatmentPlan: text("treatment_plan"),
		labRequest: text("lab_request"),
		notes: text("notes"),
		attachments: text("attachments"),
		diagnosisDate: integer("diagnosis_date", { mode: "timestamp_ms" }),
		status: text("status").default("ACTIVE"),
		medications: text("medications"),
		followUpDate: integer("follow_up_date", { mode: "timestamp_ms" }),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		uniqueIndex("medical_records_patient_appointment_unique").on(table.patientId, table.appointmentId),
		index("medical_records_clinic_followup_idx").on(table.clinicId, table.followUpDate),
		index("medical_records_patient_created_idx").on(table.patientId, table.createdAt),
		index("medical_records_doctor_idx").on(table.doctorId),
		index("medical_records_is_deleted_idx").on(table.isDeleted)
	]
);

export const diagnosis = sqliteTable(
	"diagnosis",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id").notNull(),
		doctorId: text("doctor_id").notNull(),
		clinicId: text("clinic_id"),
		appointmentId: text("appointment_id"),
		medicalId: text("medical_id").notNull().unique(),
		date: integer("date", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		type: text("type"),
		diagnosis: text("diagnosis"),
		treatment: text("treatment"),
		notes: text("notes"),
		symptoms: text("symptoms").notNull(),
		prescribedMedications: text("prescribed_medications"),
		followUpPlan: text("follow_up_plan"),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("diagnoses_clinic_date_idx").on(table.clinicId, table.date),
		index("diagnoses_doctor_date_idx").on(table.doctorId, table.date),
		index("diagnoses_patient_date_idx").on(table.patientId, table.date),
		index("diagnoses_is_deleted_idx").on(table.isDeleted)
	]
);

export const vitalSign = sqliteTable(
	"vital_sign",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id"),
		patientId: text("patient_id").notNull(),
		medicalId: text("medical_id").notNull().unique(),
		encounterId: text("encounter_id").unique(),
		growthRecordId: text("growth_record_id"),
		recordedAt: integer("recorded_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		bodyTemperature: real("body_temperature"),
		systolic: integer("systolic"),
		diastolic: integer("diastolic"),
		heartRate: integer("heart_rate"),
		respiratoryRate: integer("respiratory_rate"),
		oxygenSaturation: integer("oxygen_saturation"),
		gender: text("gender"),
		notes: text("notes"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
		ageDays: integer("age_days"),
		ageMonths: integer("age_months")
	},
	table => [
		index("vital_signs_clinic_recorded_idx").on(table.clinicId, table.recordedAt),
		index("vital_signs_patient_recorded_idx").on(table.patientId, table.recordedAt),
		index("vital_signs_encounter_idx").on(table.encounterId)
	]
);

export const growthRecord = sqliteTable(
	"growth_record",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id"),
		patientId: text("patient_id").notNull(),
		gender: text("gender"),
		ageDays: integer("age_days"),
		ageMonths: integer("age_months"),
		headCircumference: integer("head_circumference"),
		bmi: integer("bmi"),
		weightForAgeZ: integer("weight_for_age_z"),
		heightForAgeZ: integer("height_for_age_z"),
		bmiForAgeZ: integer("bmi_for_age_z"),
		hcForAgeZ: integer("hc_for_age_z"),
		weight: real("weight"),
		height: real("height"),
		notes: text("notes"),
		date: integer("date", { mode: "timestamp_ms" }).notNull(),
		recordedAt: integer("recorded_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("growth_records_patient_date_idx").on(table.patientId, table.date)]
);

export const immunization = sqliteTable(
	"immunization",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id"),
		patientId: text("patient_id").notNull(),
		vaccine: text("vaccine").notNull(),
		date: integer("date", { mode: "timestamp_ms" }).notNull(),
		dose: text("dose"),
		lotNumber: text("lot_number"),
		administeredByStaffId: text("administered_by_staff_id"),
		notes: text("notes"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).default(false)
	},
	table => [
		index("immunizations_clinic_patient_vaccine_date_idx").on(
			table.clinicId,
			table.patientId,
			table.vaccine,
			table.date
		),
		index("immunizations_clinic_patient_date_idx").on(table.clinicId, table.patientId, table.date)
	]
);

export const service = sqliteTable(
	"service",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id"),
		serviceName: text("service_name").notNull(),
		description: text("description").notNull(),
		price: integer("price").notNull(),
		category: text("category"),
		duration: integer("duration"),
		isAvailable: integer("is_available", { mode: "boolean" }).default(true),
		icon: text("icon"),
		color: text("color"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).default(false)
	},
	table => [
		index("services_is_deleted_idx").on(table.isDeleted),
		index("services_service_name_idx").on(table.serviceName)
	]
);

export const labTest = sqliteTable(
	"lab_test",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id"),
		recordId: text("record_id").notNull(),
		serviceId: text("service_id").notNull(),
		testDate: integer("test_date", { mode: "timestamp_ms" }).notNull(),
		result: text("result").notNull(),
		status: text("status").notNull(),
		notes: text("notes"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("lab_tests_service_id_idx").on(table.serviceId),
		index("lab_tests_record_id_idx").on(table.recordId)
	]
);

export const payment = sqliteTable(
	"payment",
	{
		id: text("id").primaryKey(),
		clinicId: text("clinic_id"),
		billId: text("bill_id"),
		patientId: text("patient_id"),
		appointmentId: text("appointment_id").unique(),
		billDate: integer("bill_date", { mode: "timestamp_ms" }).notNull(),
		paymentDate: integer("payment_date", { mode: "timestamp_ms" }),
		discount: integer("discount"),
		totalAmount: integer("total_amount"),
		amountPaid: integer("amount_paid"),
		amount: integer("amount"),
		status: text("status").default("PAID"),
		insurance: text("insurance"),
		insuranceId: text("insurance_id"),
		serviceDate: integer("service_date", { mode: "timestamp_ms" }),
		dueDate: integer("due_date", { mode: "timestamp_ms" }),
		paidDate: integer("paid_date", { mode: "timestamp_ms" }),
		notes: text("notes"),
		deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
		isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
		paymentMethod: text("payment_method").default("CASH"),
		receiptNumber: integer("receipt_number"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("payments_is_deleted_idx").on(table.isDeleted),
		index("payments_patient_status_idx").on(table.patientId, table.status),
		index("payments_status_due_date_idx").on(table.status, table.dueDate),
		index("payments_patient_payment_date_idx").on(table.patientId, table.paymentDate)
	]
);

export const patientBill = sqliteTable("patient_bill", {
	id: text("id").primaryKey(),
	clinicId: text("clinic_id"),
	billId: text("bill_id").notNull(),
	serviceId: text("service_id").notNull(),
	serviceDate: integer("service_date", { mode: "timestamp_ms" }).notNull(),
	quantity: integer("quantity").notNull(),
	unitCost: integer("unit_cost"),
	totalCost: integer("total_cost"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const reminder = sqliteTable("reminder", {
	id: text("id").primaryKey(),
	appointmentId: text("appointment_id").notNull().unique(),
	method: text("method").notNull(),
	sentAt: integer("sent_at", { mode: "timestamp_ms" }).notNull(),
	status: text("status").notNull()
});

export const clinicSetting = sqliteTable("clinic_setting", {
	id: text("id").primaryKey(),
	clinicId: text("clinic_id").notNull().unique(),
	openingTime: text("opening_time").notNull(),
	closingTime: text("closing_time").notNull(),
	workingDays: text("working_days").notNull(),
	defaultAppointmentDuration: integer("default_appointment_duration").default(30),
	requireEmergencyContact: integer("require_emergency_contact", {
		mode: "boolean"
	}).default(true),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const prescription = sqliteTable(
	"prescriptions",
	{
		id: text("id").primaryKey(),
		medicalRecordId: text("medical_record_id").notNull(),
		doctorId: text("doctor_id"),
		patientId: text("patient_id").notNull(),
		encounterId: text("encounter_id").notNull(),
		medicationName: text("medication_name"),
		instructions: text("instructions"),
		issuedDate: integer("issued_date", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		endDate: integer("end_date", { mode: "timestamp_ms" }),
		status: text("status").default("active"),
		clinicId: text("clinic_id"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [index("prescriptions_clinic_id_idx").on(table.clinicId)]
);

export const whoGrowthStandard = sqliteTable("who_growth_standards", {
	id: text("id").primaryKey(),
	ageInMonths: integer("age_in_months"),
	ageDays: integer("age_days").notNull(),
	gender: text("gender").notNull(),
	measurementType: text("measurement_type").notNull(),
	lValue: real("l_value").notNull(),
	mValue: real("m_value").notNull(),
	sValue: real("s_value").notNull(),
	sd0: real("sd0").notNull(),
	sd1neg: real("sd1neg").notNull(),
	sd1pos: real("sd1pos").notNull(),
	sd2neg: real("sd2neg").notNull(),
	sd2pos: real("sd2pos").notNull(),
	sd3neg: real("sd3neg").notNull(),
	sd3pos: real("sd3pos").notNull(),
	sd4neg: real("sd4neg"),
	sd4pos: real("sd4pos"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const rating = sqliteTable("rating", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	staffId: text("staff_id"),
	patientId: text("patient_id"),
	rating: integer("rating").notNull(),
	comment: text("comment"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const drug = sqliteTable("drugs", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const doseGuideline = sqliteTable("dose_guidelines", {
	id: text("id").primaryKey(),
	drugId: text("drug_id").notNull(),
	route: text("route").notNull(),
	clinicalIndication: text("clinical_indication").notNull(),
	minDosePerKg: real("min_dose_per_kg"),
	maxDosePerKg: real("max_dose_per_kg"),
	doseUnit: text("dose_unit"),
	frequencyDays: text("frequency_days"),
	gestationalAgeWeeksMin: real("gestational_age_weeks_min"),
	gestationalAgeWeeksMax: real("gestational_age_weeks_max"),
	postNatalAgeDaysMin: real("post_natal_age_days_min"),
	postNatalAgeDaysMax: real("post_natal_age_days_max"),
	maxDosePer24h: real("max_dose_per_24h"),
	stockConcentrationMgMl: real("stock_concentration_mg_ml"),
	finalConcentrationMgMl: real("final_concentration_mg_ml"),
	minInfusionTimeMin: integer("min_infusion_time_min"),
	compatibilityDiluent: text("compatibility_diluent"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const prescribedItem = sqliteTable("prescribed_items", {
	id: text("id").primaryKey(),
	prescriptionId: text("prescription_id").notNull(),
	drugId: text("drug_id").notNull(),
	dosageValue: real("dosage_value").notNull(),
	dosageUnit: text("dosage_unit").notNull(),
	frequency: text("frequency").notNull(),
	duration: text("duration").notNull(),
	instructions: text("instructions"),
	drugRoute: text("drug_route"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const fileUpload = sqliteTable("files", {
	id: text("id").primaryKey(),
	key: text("key").notNull(),
	fileName: text("file_name").notNull(),
	url: text("url").notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull()
});

export const guardian = sqliteTable(
	"guardians",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id").notNull(),
		userId: text("user_id").notNull(),
		relation: text("relation").notNull(),
		isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
		phone: text("phone"),
		email: text("email")
	},
	table => [index("guardians_patient_id_idx").on(table.patientId), index("guardians_user_id_idx").on(table.userId)]
);

export const feedingLog = sqliteTable(
	"feeding_logs",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id").notNull(),
		date: integer("date", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		type: text("type").notNull(),
		duration: integer("duration"),
		amount: real("amount"),
		breast: text("breast"),
		notes: text("notes")
	},
	table => [index("feeding_logs_patient_date_idx").on(table.patientId, table.date)]
);

export const developmentalMilestones = sqliteTable("developmental_milestones", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	patientId: text("patient_id").notNull(),
	milestone: text("milestone").notNull(),
	ageAchieved: text("age_achieved").notNull(),
	dateRecorded: integer("date_recorded", { mode: "timestamp_ms" }).notNull(),
	notes: text("notes"),
	createdBy: text("created_by"),
	updatedBy: text("updated_by"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => new Date())
		.notNull()
});

export const developmentalChecks = sqliteTable(
	"developmental_check",
	{
		id: text("id").primaryKey(),
		patientId: text("patient_id").notNull(),
		checkDate: integer("check_date", { mode: "timestamp_ms" }).notNull(),
		ageMonths: integer("age_months").notNull(),
		motorSkills: text("motor_skills").notNull(),
		languageSkills: text("language_skills").notNull(),
		socialSkills: text("social_skills").notNull(),
		cognitiveSkills: text("cognitive_skills").notNull(),
		milestonesMet: text("milestones_met"),
		milestonesPending: text("milestones_pending"),
		concerns: text("concerns"),
		recommendations: text("recommendations"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	table => [
		index("developmental_check_patient_date_idx").on(table.patientId, table.checkDate),
		index("developmental_check_age_months_idx").on(table.ageMonths)
	]
);

export const vaccineSchedule = sqliteTable(
	"vaccine_schedule",
	{
		id: text("id").primaryKey(),
		vaccineName: text("vaccine_name").notNull(),
		recommendedAge: text("recommended_age").notNull(),
		dosesRequired: integer("doses_required").notNull(),
		minimumInterval: integer("minimum_interval"),
		isMandatory: integer("is_mandatory", { mode: "boolean" }).default(true),
		description: text("description"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
		ageInDaysMin: integer("age_in_days_min"),
		ageInDaysMax: integer("age_in_days_max")
	},
	table => [
		uniqueIndex("vaccine_schedule_name_age_unique").on(table.vaccineName, table.recommendedAge),
		index("vaccine_schedule_age_range_idx").on(table.ageInDaysMin, table.ageInDaysMax)
	]
);

export const userRelations = relations(user, ({ many, one }) => ({
	sessions: many(session),
	accounts: many(account),
	clinic: one(clinics, {
		fields: [user.clinicId],
		references: [clinics.id]
	}),
	files: many(files),
	folders: many(folders),
	createdInvites: many(invites, { relationName: "createdBy" }),
	usedInvites: many(invites, { relationName: "usedBy" }),
	twoFactors: many(twoFactor),
	quota: one(userQuota, {
		fields: [user.id],
		references: [userQuota.userId]
	}),
	clinics: many(clinicMembers),
	doctors: many(doctor),
	staffs: many(staff),
	patients: many(patient, { relationName: "PatientUser" }),
	createdPatients: many(patient, { relationName: "PatientCreatedBy" }),
	guardians: many(guardian),
	createdMedicalRecord: many(medicalRecord, { relationName: "createdBy" })
}));

export const userQuotaRelations = relations(userQuota, ({ one }) => ({
	user: one(user, {
		fields: [userQuota.userId],
		references: [user.id]
	})
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
	user: one(user, { fields: [folders.userId], references: [user.id] }),
	parent: one(folders, {
		fields: [folders.parentId],
		references: [folders.id],
		relationName: "subfolders"
	}),
	subfolders: many(folders, { relationName: "subfolders" }),
	files: many(files)
}));

export const filesRelations = relations(files, ({ one }) => ({
	user: one(user, { fields: [files.userId], references: [user.id] }),
	folder: one(folders, { fields: [files.folderId], references: [folders.id] })
}));

export const invitesRelations = relations(invites, ({ one }) => ({
	user: one(user, {
		fields: [invites.usedBy],
		references: [user.id],
		relationName: "usedBy"
	}),
	creator: one(user, {
		fields: [invites.createdBy],
		references: [user.id],
		relationName: "createdBy"
	})
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
	user: one(user, {
		fields: [twoFactor.userId],
		references: [user.id]
	})
}));

export const clinicRelations = relations(clinics, ({ many }) => ({
	doctors: many(doctor),
	patients: many(patient),
	appointments: many(appointment),
	usersToClinics: many(clinicMembers),
	medicalRecords: many(medicalRecord),
	clinicSettings: many(clinicSetting),
	prescriptions: many(prescription),
	payments: many(payment),
	encounters: many(diagnosis),
	services: many(service),
	staffs: many(staff),
	users: many(clinicMembers, { relationName: "clinic" }),
	expenses: many(payment) // Note: You'll need to create expenses table separately
}));

export const clinicMemberRelations = relations(clinicMembers, ({ one }) => ({
	user: one(user, {
		fields: [clinicMembers.userId],
		references: [user.id]
	}),
	clinic: one(clinics, {
		fields: [clinicMembers.clinicId],
		references: [clinics.id]
	})
}));

export const doctorRelations = relations(doctor, ({ one, many }) => ({
	user: one(user, {
		fields: [doctor.userId],
		references: [user.id]
	}),
	clinic: one(clinics, {
		fields: [doctor.clinicId],
		references: [clinics.id]
	}),
	workingDays: many(workingDays),
	appointments: many(appointment),
	encounter: many(diagnosis),
	prescriptions: many(prescription),
	medicalRecords: many(medicalRecord),
	ratings: many(rating)
}));

export const workingDaysRelations = relations(workingDays, ({ one }) => ({
	doctor: one(doctor, {
		fields: [workingDays.doctorId],
		references: [doctor.id]
	})
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
	user: one(user, {
		fields: [staff.userId],
		references: [user.id]
	}),
	clinic: one(clinics, {
		fields: [staff.clinicId],
		references: [clinics.id]
	}),
	immunizations: many(immunization, { relationName: "AdministeredByStaff" })
}));

export const patientRelations = relations(patient, ({ one, many }) => ({
	clinic: one(clinics, {
		fields: [patient.clinicId],
		references: [clinics.id]
	}),
	user: one(user, {
		fields: [patient.userId],
		references: [user.id],
		relationName: "PatientUser"
	}),
	createdBy: one(user, {
		fields: [patient.createdById],
		references: [user.id],
		relationName: "PatientCreatedBy"
	}),
	appointments: many(appointment),
	medicalRecords: many(medicalRecord),
	encounters: many(diagnosis),
	immunizations: many(immunization),
	vitalSigns: many(vitalSign),
	feedingLogs: many(feedingLog),
	prescriptions: many(prescription),
	ratings: many(rating),
	developmentalChecks: many(developmentalChecks),
	developmentalMilestones: many(developmentalMilestones),
	growthRecords: many(growthRecord),
	payments: many(payment),
	guardians: many(guardian)
}));

export const appointmentRelations = relations(appointment, ({ one, many }) => ({
	patient: one(patient, {
		fields: [appointment.patientId],
		references: [patient.id]
	}),
	doctor: one(doctor, {
		fields: [appointment.doctorId],
		references: [doctor.id]
	}),
	clinic: one(clinics, {
		fields: [appointment.clinicId],
		references: [clinics.id]
	}),
	service: one(service, {
		fields: [appointment.serviceId],
		references: [service.id]
	}),
	bills: many(payment),
	medical: many(medicalRecord),
	reminders: many(reminder),
	encounters: many(diagnosis)
}));

export const medicalRecordRelations = relations(medicalRecord, ({ one, many }) => ({
	patient: one(patient, {
		fields: [medicalRecord.patientId],
		references: [patient.id]
	}),
	appointment: one(appointment, {
		fields: [medicalRecord.appointmentId],
		references: [appointment.id]
	}),
	doctor: one(doctor, {
		fields: [medicalRecord.doctorId],
		references: [doctor.id]
	}),
	clinic: one(clinics, {
		fields: [medicalRecord.clinicId],
		references: [clinics.id]
	}),
	labTest: many(labTest),
	immunizations: many(immunization),
	prescriptions: many(prescription),
	vitalSigns: many(vitalSign),
	encounter: many(diagnosis)
}));

export const diagnosisRelations = relations(diagnosis, ({ one, many }) => ({
	patient: one(patient, {
		fields: [diagnosis.patientId],
		references: [patient.id]
	}),
	doctor: one(doctor, {
		fields: [diagnosis.doctorId],
		references: [doctor.id]
	}),
	clinic: one(clinics, {
		fields: [diagnosis.clinicId],
		references: [clinics.id]
	}),
	appointment: one(appointment, {
		fields: [diagnosis.appointmentId],
		references: [appointment.id]
	}),
	medical: one(medicalRecord, {
		fields: [diagnosis.medicalId],
		references: [medicalRecord.id]
	}),
	vitalSigns: many(vitalSign),
	prescription: many(prescription)
}));

export const vitalSignsRelations = relations(vitalSign, ({ one }) => ({
	patient: one(patient, {
		fields: [vitalSign.patientId],
		references: [patient.id]
	}),
	medical: one(medicalRecord, {
		fields: [vitalSign.medicalId],
		references: [medicalRecord.id]
	}),
	encounter: one(diagnosis, {
		fields: [vitalSign.encounterId],
		references: [diagnosis.id]
	}),
	growthRecord: one(growthRecord, {
		fields: [vitalSign.growthRecordId],
		references: [growthRecord.id]
	})
}));

export const growthRecordRelations = relations(growthRecord, ({ one, many }) => ({
	patient: one(patient, {
		fields: [growthRecord.patientId],
		references: [patient.id]
	}),
	vitalSigns: many(vitalSign)
}));

export const immunizationRelations = relations(immunization, ({ one, many }) => ({
	patient: one(patient, {
		fields: [immunization.patientId],
		references: [patient.id]
	}),
	administeredBy: one(staff, {
		fields: [immunization.administeredByStaffId],
		references: [staff.id],
		relationName: "AdministeredByStaff"
	}),
	medicalRecord: many(medicalRecord)
}));

export const serviceRelations = relations(service, ({ one, many }) => ({
	clinic: one(clinics, {
		fields: [service.clinicId],
		references: [clinics.id]
	}),
	labtest: many(labTest),
	bills: many(patientBill),
	appointment: many(appointment)
}));

export const labTestRelations = relations(labTest, ({ one }) => ({
	medicalRecord: one(medicalRecord, {
		fields: [labTest.recordId],
		references: [medicalRecord.id]
	}),
	service: one(service, {
		fields: [labTest.serviceId],
		references: [service.id]
	})
}));

export const paymentRelations = relations(payment, ({ one, many }) => ({
	clinic: one(clinics, {
		fields: [payment.clinicId],
		references: [clinics.id]
	}),
	patient: one(patient, {
		fields: [payment.patientId],
		references: [patient.id]
	}),
	appointment: one(appointment, {
		fields: [payment.appointmentId],
		references: [appointment.id]
	}),
	bills: many(patientBill)
}));

export const patientBillRelations = relations(patientBill, ({ one }) => ({
	service: one(service, {
		fields: [patientBill.serviceId],
		references: [service.id]
	}),
	payment: one(payment, {
		fields: [patientBill.billId],
		references: [payment.id]
	})
}));

export const reminderRelations = relations(reminder, ({ one }) => ({
	appointment: one(appointment, {
		fields: [reminder.appointmentId],
		references: [appointment.id]
	})
}));

export const clinicSettingRelations = relations(clinicSetting, ({ one }) => ({
	clinic: one(clinics, {
		fields: [clinicSetting.clinicId],
		references: [clinics.id]
	})
}));

export const prescriptionRelations = relations(prescription, ({ one, many }) => ({
	medicalRecord: one(medicalRecord, {
		fields: [prescription.medicalRecordId],
		references: [medicalRecord.id]
	}),
	doctor: one(doctor, {
		fields: [prescription.doctorId],
		references: [doctor.id]
	}),
	patient: one(patient, {
		fields: [prescription.patientId],
		references: [patient.id]
	}),
	encounter: one(diagnosis, {
		fields: [prescription.encounterId],
		references: [diagnosis.id]
	}),
	clinic: one(clinics, {
		fields: [prescription.clinicId],
		references: [clinics.id]
	}),
	prescribedItems: many(prescribedItem)
}));

export const ratingRelations = relations(rating, ({ one }) => ({
	doctor: one(doctor, {
		fields: [rating.staffId],
		references: [doctor.id]
	}),
	patient: one(patient, {
		fields: [rating.patientId],
		references: [patient.id]
	})
}));

export const drugRelations = relations(drug, ({ many }) => ({
	guidelines: many(doseGuideline),
	prescribedItems: many(prescribedItem)
}));

export const doseGuidelineRelations = relations(doseGuideline, ({ one }) => ({
	drug: one(drug, {
		fields: [doseGuideline.drugId],
		references: [drug.id]
	})
}));

export const prescribedItemRelations = relations(prescribedItem, ({ one }) => ({
	prescription: one(prescription, {
		fields: [prescribedItem.prescriptionId],
		references: [prescription.id]
	}),
	drug: one(drug, {
		fields: [prescribedItem.drugId],
		references: [drug.id]
	})
}));

export const guardianRelations = relations(guardian, ({ one }) => ({
	patient: one(patient, {
		fields: [guardian.patientId],
		references: [patient.id]
	}),
	user: one(user, {
		fields: [guardian.userId],
		references: [user.id]
	})
}));

export const feedingLogRelations = relations(feedingLog, ({ one }) => ({
	patient: one(patient, {
		fields: [feedingLog.patientId],
		references: [patient.id]
	})
}));

export const developmentalMilestoneRelations = relations(developmentalMilestones, ({ one }) => ({
	patient: one(patient, {
		fields: [developmentalMilestones.patientId],
		references: [patient.id]
	})
}));

export const developmentalCheckRelations = relations(developmentalChecks, ({ one }) => ({
	patient: one(patient, {
		fields: [developmentalChecks.patientId],
		references: [patient.id]
	})
}));

// =========== DASHBOARD VIEWS ===========

// Note: Switched to sqliteView as schema implies SQLite. Materialized views are not supported in SQLite.
export const clinicDashboardMV = sqliteView("clinic_dashboard_mv").as(qb => {
	const base = qb
		.select({
			clinicId: clinics.id,
			clinicName: clinics.name,

			// Appointment stats
			totalAppointments: sql<number>`(
    SELECT COUNT(*) FROM ${appointment} WHERE ${appointment.clinicId} = ${clinics.id}
  )`.as("totalAppointments"),
			todayAppointments: sql<number>`(
    SELECT COUNT(*) FROM ${appointment}
    WHERE date(${appointment.appointmentDate}/1000, 'unixepoch') = date('now') AND ${appointment.clinicId} = ${clinics.id}
  )`.as("todayAppointments"),
			upcomingAppointments: sql<number>`(
    SELECT COUNT(*) FROM ${appointment}
    WHERE date(${appointment.appointmentDate}/1000, 'unixepoch') > date('now') AND ${appointment.status} IN ('SCHEDULED', 'PENDING') AND ${appointment.clinicId} = ${clinics.id}
  )`.as("upcomingAppointments"),
			completedAppointments: sql<number>`(
    SELECT COUNT(*) FROM ${appointment}
    WHERE ${appointment.status} = 'COMPLETED' AND ${appointment.clinicId} = ${clinics.id}
  )`.as("completedAppointments"),
			// Patient stats
			totalPatients: sql<number>`(
    SELECT COUNT(*) FROM ${patient} WHERE ${patient.clinicId} = ${clinics.id}
  )`.as("totalPatients"),
			activePatients: sql<number>`(
    SELECT COUNT(*) FROM ${patient}
    WHERE ${patient.isActive} = true AND ${patient.clinicId} = ${clinics.id}
  )`.as("activePatients"),
			newPatientsThisMonth: sql<number>`(
    SELECT COUNT(*) FROM ${patient}
    WHERE date(${patient.createdAt}/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') AND ${patient.clinicId} = ${clinics.id}
  )`.as("newPatientsThisMonth"),
			avgWaitingTime: sql<number>`(
        SELECT 0
      )`.as("avgWaitingTime"),
			// Financial stats
			monthlyRevenue: sql<number>`(
    SELECT COALESCE(SUM(${payment.totalAmount}), 0) FROM ${payment}
    WHERE date(${payment.paymentDate}/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') AND ${payment.clinicId} = ${clinics.id}
  )`.as("monthlyRevenue"),
			totalRevenue: sql<number>`(
    SELECT COALESCE(SUM(${payment.totalAmount}), 0) FROM ${payment}
    WHERE ${payment.clinicId} = ${clinics.id}
  )`.as("totalRevenue"),

			// Doctor stats
			activeDoctors:
				sql<number>`(SELECT COUNT(*) FROM ${doctor} WHERE ${doctor.clinicId} = ${clinics.id} AND ${doctor.isActive} = true AND ${doctor.status} = 'ACTIVE')`.as(
					"activeDoctors"
				),
			averageDoctorRating:
				sql<number>`(SELECT AVG(${doctor.rating}) FROM ${doctor} WHERE ${doctor.clinicId} = ${clinics.id})`.as(
					"averageDoctorRating"
				),

			// Pediatric-specific stats
			immunizationsDue:
				sql<number>`(SELECT COUNT(*) FROM ${immunization} WHERE ${immunization.clinicId} = ${clinics.id} AND ${immunization.date} <= unixepoch('now', '+7 days') * 1000)`.as(
					"immunizationsDue"
				),
			growthChecksPending:
				sql<number>`(SELECT COUNT(*) FROM ${vitalSign} WHERE ${vitalSign.clinicId} = ${clinics.id} AND ${vitalSign.recordedAt} < unixepoch('now', '-3 months') * 1000)`.as(
					"growthChecksPending"
				),

			// Staff stats
			totalStaff: sql<number>`(SELECT COUNT(*) FROM ${staff} WHERE ${staff.clinicId} = ${clinics.id})`.as(
				"totalStaff"
			),

			updatedAt: sql<number>`(unixepoch() * 1000)`.as("updatedAt")
		})
		.from(clinics)
		.leftJoin(patient, eq(patient.clinicId, clinics.id))
		.leftJoin(appointment, eq(appointment.clinicId, clinics.id))
		.leftJoin(doctor, eq(doctor.clinicId, clinics.id))
		.leftJoin(payment, eq(payment.clinicId, clinics.id))
		.leftJoin(immunization, eq(immunization.clinicId, clinics.id))
		.leftJoin(vitalSign, eq(vitalSign.clinicId, clinics.id))
		.leftJoin(staff, eq(staff.clinicId, clinics.id))
		.groupBy(clinics.id, clinics.name);

	return base;
});

// =========== PATIENT OVERVIEW VIEW ===========

export const patientOverviewMV = sqliteView("patient_overview_mv").as(qb => {
	return qb
		.select({
			patientId: patient.id,
			fullName: sql<string>`${patient.firstName} || ' ' || ${patient.lastName}`.as("fullName"),
			dateOfBirth: patient.dateOfBirth,
			ageMonths:
				sql<number>`(strftime('%Y', 'now') - strftime('%Y', datetime(${patient.dateOfBirth}/1000, 'unixepoch'))) * 12 + (strftime('%m', 'now') - strftime('%m', datetime(${patient.dateOfBirth}/1000, 'unixepoch')))`.as(
					"ageMonths"
				),
			gender: patient.gender,
			bloodGroup: patient.bloodGroup,

			// Contact info
			phone: patient.phone,
			email: patient.email,
			address: patient.address,

			// Medical info
			allergies: patient.allergies,
			medicalConditions: patient.medicalConditions,

			// Appointment stats
			totalAppointments: sql<number>`COUNT(DISTINCT ${appointment.id})`.as("totalAppointments"),
			lastAppointmentDate: sql<number>`MAX(${appointment.appointmentDate})`.as("lastAppointmentDate"),
			upcomingAppointments:
				sql<number>`COUNT(DISTINCT CASE WHEN ${appointment.appointmentDate} > (unixepoch() * 1000) AND ${appointment.status} IN ('SCHEDULED', 'PENDING') THEN ${appointment.id} END)`.as(
					"upcomingAppointments"
				),

			// Medical stats
			totalEncounters: sql<number>`COUNT(DISTINCT ${diagnosis.id})`.as("totalEncounters"),
			totalPrescriptions: sql<number>`COUNT(DISTINCT ${prescription.id})`.as("totalPrescriptions"),
			activePrescriptions:
				sql<number>`COUNT(DISTINCT CASE WHEN ${prescription.status} = 'active' AND (${prescription.endDate} IS NULL OR ${prescription.endDate} > (unixepoch() * 1000)) THEN ${prescription.id} END)`.as(
					"activePrescriptions"
				),

			// Immunization stats
			totalImmunizations: sql<number>`COUNT(DISTINCT ${immunization.id})`.as("totalImmunizations"),

			// Growth stats
			lastWeight:
				sql<number>`(SELECT ${growthRecord.weight} FROM ${growthRecord} WHERE ${growthRecord.patientId} = ${patient.id} ORDER BY ${growthRecord.recordedAt} DESC LIMIT 1)`.as(
					"lastWeight"
				),
			lastHeight:
				sql<number>`(SELECT ${growthRecord.height} FROM ${growthRecord} WHERE ${growthRecord.patientId} = ${patient.id} ORDER BY ${growthRecord.recordedAt} DESC LIMIT 1)`.as(
					"lastHeight"
				),
			lastGrowthCheck:
				sql<number>`(SELECT ${growthRecord.recordedAt} FROM ${growthRecord} WHERE ${growthRecord.patientId} = ${patient.id} ORDER BY ${growthRecord.recordedAt} DESC LIMIT 1)`.as(
					"lastGrowthCheck"
				),

			// Guardian info
			guardianPhone:
				sql<string>`(SELECT ${guardian.phone} FROM ${guardian} WHERE ${guardian.patientId} = ${patient.id} AND ${guardian.isPrimary} = true LIMIT 1)`.as(
					"guardianPhone"
				),

			clinicId: patient.clinicId,
			updatedAt: sql<number>`(unixepoch() * 1000)`.as("updatedAt")
		})
		.from(patient)
		.leftJoin(appointment, eq(appointment.patientId, patient.id))
		.leftJoin(diagnosis, eq(diagnosis.patientId, patient.id))
		.leftJoin(prescription, eq(prescription.patientId, patient.id))
		.leftJoin(immunization, eq(immunization.patientId, patient.id))
		.leftJoin(vitalSign, eq(vitalSign.patientId, patient.id))
		.leftJoin(guardian, eq(guardian.patientId, patient.id))
		.groupBy(
			patient.id,
			patient.firstName,
			patient.lastName,
			patient.dateOfBirth,
			patient.gender,
			patient.bloodGroup,
			patient.phone,
			patient.email,
			patient.address,
			patient.allergies,
			patient.medicalConditions,
			patient.clinicId
		);
});

// =========== DOCTOR PERFORMANCE VIEW ===========

export const doctorPerformanceMV = sqliteView("doctor_performance_mv").as(qb => {
	return qb
		.select({
			doctorId: doctor.id,
			name: doctor.name,
			specialty: doctor.specialty,
			email: doctor.email,
			phone: doctor.phone,
			rating: doctor.rating,

			// Appointment stats
			totalAppointments: sql<number>`COUNT(DISTINCT ${appointment.id})`.as("totalAppointments"),
			appointmentsThisMonth:
				sql<number>`COUNT(DISTINCT CASE WHEN date(${appointment.appointmentDate}/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') THEN ${appointment.id} END)`.as(
					"appointmentsThisMonth"
				),
			completedAppointments:
				sql<number>`COUNT(DISTINCT CASE WHEN ${appointment.status} = 'COMPLETED' THEN ${appointment.id} END)`.as(
					"completedAppointments"
				),
			cancellationRate:
				sql<number>`(COUNT(DISTINCT CASE WHEN ${appointment.status} = 'CANCELLED' THEN ${appointment.id} END) * 100.0 / NULLIF(COUNT(DISTINCT ${appointment.id}), 0))`.as(
					"cancellationRate"
				),

			// Patient stats
			totalPatients: sql<number>`COUNT(DISTINCT ${patient.id})`.as("totalPatients"),
			newPatientsThisMonth:
				sql<number>`COUNT(DISTINCT CASE WHEN date(${patient.createdAt}/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') THEN ${patient.id} END)`.as(
					"newPatientsThisMonth"
				),

			// Revenue stats
			totalRevenue: sql<number>`COALESCE(SUM(${payment.totalAmount}), 0)`.as("totalRevenue"),
			monthlyRevenue:
				sql<number>`COALESCE(SUM(CASE WHEN date(${payment.paymentDate}/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') THEN ${payment.totalAmount} ELSE 0 END), 0)`.as(
					"monthlyRevenue"
				),

			// Prescription stats
			totalPrescriptions: sql<number>`COUNT(DISTINCT ${prescription.id})`.as("totalPrescriptions"),
			activePrescriptions:
				sql<number>`COUNT(DISTINCT CASE WHEN ${prescription.status} = 'active' THEN ${prescription.id} END)`.as(
					"activePrescriptions"
				),

			// Rating stats
			averagePatientRating: sql<number>`COALESCE(AVG(${rating.rating}), 0)`.as("averagePatientRating"),
			totalRatings: sql<number>`COUNT(DISTINCT ${rating.id})`.as("totalRatings"),

			// Schedule stats
			averagePatientsPerDay:
				sql<number>`COALESCE(COUNT(DISTINCT ${appointment.id}) / NULLIF(COUNT(DISTINCT date(${appointment.appointmentDate}/1000, 'unixepoch')), 0), 0)`.as(
					"averagePatientsPerDay"
				),

			clinicId: doctor.clinicId,
			updatedAt: sql<number>`(unixepoch() * 1000)`.as("updatedAt")
		})
		.from(doctor)
		.leftJoin(appointment, eq(appointment.doctorId, doctor.id))
		.leftJoin(patient, eq(patient.id, appointment.patientId))
		.leftJoin(payment, eq(payment.appointmentId, appointment.id))
		.leftJoin(prescription, eq(prescription.doctorId, doctor.id))
		.leftJoin(rating, eq(rating.staffId, doctor.id))
		.groupBy(doctor.id, doctor.name, doctor.specialty, doctor.email, doctor.phone, doctor.rating, doctor.clinicId);
});

// =========== FINANCIAL OVERVIEW VIEW ===========

export const financialOverviewMV = sqliteView("financial_overview_mv").as(qb => {
	return qb
		.select({
			clinicId: clinics.id,
			clinicName: clinics.name,

			// Revenue by month (last 12 months)
			currentMonthRevenue:
				sql<number>`COALESCE(SUM(CASE WHEN strftime('%Y-%m-01', datetime(${payment.paymentDate}/1000, 'unixepoch')) = strftime('%Y-%m-01', 'now') THEN ${payment.totalAmount} ELSE 0 END), 0)`.as(
					"currentMonthRevenue"
				),
			previousMonthRevenue:
				sql<number>`COALESCE(SUM(CASE WHEN strftime('%Y-%m-01', datetime(${payment.paymentDate}/1000, 'unixepoch')) = strftime('%Y-%m-01', 'now', '-1 month') THEN ${payment.totalAmount} ELSE 0 END), 0)`.as(
					"previousMonthRevenue"
				),

			// Revenue by category
			consultationRevenue:
				sql<number>`COALESCE(SUM(CASE WHEN ${service.category} = 'CONSULTATION' THEN ${payment.totalAmount} ELSE 0 END), 0)`.as(
					"consultationRevenue"
				),
			procedureRevenue:
				sql<number>`COALESCE(SUM(CASE WHEN ${service.category} = 'PROCEDURE' THEN ${payment.totalAmount} ELSE 0 END), 0)`.as(
					"procedureRevenue"
				),
			labRevenue:
				sql<number>`COALESCE(SUM(CASE WHEN ${service.category} = 'LAB_TEST' THEN ${payment.totalAmount} ELSE 0 END), 0)`.as(
					"labRevenue"
				),
			vaccinationRevenue:
				sql<number>`COALESCE(SUM(CASE WHEN ${service.category} = 'VACCINATION' THEN ${payment.totalAmount} ELSE 0 END), 0)`.as(
					"vaccinationRevenue"
				),

			// Payment status
			totalRevenue: sql<number>`COALESCE(SUM(${payment.totalAmount}), 0)`.as("totalRevenue"),
			paidAmount:
				sql<number>`COALESCE(SUM(CASE WHEN ${payment.status} = 'PAID' THEN ${payment.totalAmount} ELSE 0 END), 0)`.as(
					"paidAmount"
				),

			// Top revenue sources
			topService:
				sql<string>`(SELECT ${service.serviceName} FROM ${service} LEFT JOIN ${payment} ON ${payment.billId} = ${service.id} WHERE ${service.clinicId} = ${clinics.id} GROUP BY ${service.id}, ${service.serviceName} ORDER BY SUM(${payment.totalAmount}) DESC LIMIT 1)`.as(
					"topService"
				),
			topDoctor:
				sql<string>`(SELECT ${doctor.name} FROM ${doctor} LEFT JOIN ${appointment} ON ${appointment.doctorId} = ${doctor.id} LEFT JOIN ${payment} ON ${payment.appointmentId} = ${appointment.id} WHERE ${doctor.clinicId} = ${clinics.id} GROUP BY ${doctor.id}, ${doctor.name} ORDER BY SUM(${payment.totalAmount}) DESC LIMIT 1)`.as(
					"topDoctor"
				),

			updatedAt: sql<number>`(unixepoch() * 1000)`.as("updatedAt")
		})
		.from(clinics)
		.leftJoin(payment, eq(payment.clinicId, clinics.id))
		.groupBy(clinics.id, clinics.name);
});

// =========== APPOINTMENT SCHEDULE VIEW ===========

export const appointmentScheduleMV = sqliteView("appointment_schedule_mv").as(qb => {
	return qb
		.select({
			appointmentId: appointment.id,
			date: appointment.appointmentDate,
			startTime: appointment.time,
			status: appointment.status,
			type: appointment.type,
			reason: appointment.reason,
			durationMinutes: appointment.durationMinutes,
			// Patient info
			patientId: patient.id,
			patientName: sql<string>`${patient.firstName} || ' ' || ${patient.lastName}`.as("patientName"),
			patientAgeMonths:
				sql<number>`(strftime('%Y', 'now') - strftime('%Y', datetime(${patient.dateOfBirth}/1000, 'unixepoch'))) * 12 + (strftime('%m', 'now') - strftime('%m', datetime(${patient.dateOfBirth}/1000, 'unixepoch')))`.as(
					"patientAgeMonths"
				),
			patientGender: patient.gender,
			patientPhone: patient.phone,

			// Doctor info
			doctorId: doctor.id,
			doctorName: doctor.name,
			doctorSpecialty: doctor.specialty,
			doctorColorCode: doctor.colorCode,

			// Service info
			serviceId: service.id,
			serviceName: service.serviceName,
			serviceCategory: service.category,
			servicePrice: service.price,

			// Billing info
			paymentStatus: payment.status,
			totalAmount: payment.totalAmount,
			amountPaid: payment.amountPaid,

			clinicId: appointment.clinicId,
			searchVector:
				sql<string>`(${patient.firstName} || ' ' || ${patient.lastName} || ' ' || ${doctor.name} || ' ' || COALESCE(${appointment.reason}, '') || ' ' || COALESCE(${service.serviceName}, '') || ' ' || CAST(${appointment.status} AS TEXT))`.as(
					"searchVector"
				),
			updatedAt: sql<number>`(unixepoch() * 1000)`.as("updatedAt")
		})
		.from(appointment)
		.innerJoin(patient, eq(patient.id, appointment.patientId))
		.innerJoin(doctor, eq(doctor.id, appointment.doctorId))
		.leftJoin(diagnosis, eq(diagnosis.id, appointment.id))
		.leftJoin(service, eq(service.id, appointment.serviceId))
		.leftJoin(payment, eq(payment.appointmentId, appointment.id));
});

// =========== PATIENT GROWTH CHART VIEW ===========

export const patientGrowthChartMV = sqliteView("patient_growth_chart_mv").as(qb => {
	return qb
		.select({
			patientId: patient.id,
			fullName: sql<string>`${patient.firstName} || ' ' || ${patient.lastName}`.as("fullName"),
			gender: patient.gender,
			dateOfBirth: patient.dateOfBirth,

			// Growth records
			ageDays: growthRecord.ageDays,
			ageMonths: growthRecord.ageMonths,
			recordedAt: growthRecord.recordedAt,

			// Measurements
			weight: growthRecord.weight,
			height: growthRecord.height,
			headCircumference: growthRecord.headCircumference,
			bmi: growthRecord.bmi,

			// WHO Percentiles
			weightForAgeZ: growthRecord.weightForAgeZ,
			heightForAgeZ: growthRecord.heightForAgeZ,
			hcForAgeZ: growthRecord.hcForAgeZ,

			// WHO Percentile classifications
			weightPercentile: sql<string>`CASE
        WHEN ${growthRecord.weightForAgeZ} < -3 THEN 'Severely Underweight'
        WHEN ${growthRecord.weightForAgeZ} < -2 THEN 'Underweight'
        WHEN ${growthRecord.weightForAgeZ} <= 1 THEN 'Normal'
        WHEN ${growthRecord.weightForAgeZ} <= 2 THEN 'Overweight'
        ELSE 'Obese'
      END`.as("weightPercentile"),
			heightPercentile: sql<string>`CASE
        WHEN ${growthRecord.heightForAgeZ} < -3 THEN 'Severely Stunted'
        WHEN ${growthRecord.heightForAgeZ} < -2 THEN 'Stunted'
        WHEN ${growthRecord.heightForAgeZ} <= 1 THEN 'Normal'
        WHEN ${growthRecord.heightForAgeZ} <= 2 THEN 'Tall'
        ELSE 'Very Tall'
      END`.as("heightPercentile"),
			notes: growthRecord.notes,

			clinicId: patient.clinicId,
			updatedAt: sql<number>`(unixepoch() * 1000)`.as("updatedAt")
		})
		.from(patient)
		.innerJoin(growthRecord, eq(growthRecord.patientId, patient.id))
		.orderBy(growthRecord.ageDays);
});

// =========== IMMUNIZATION SCHEDULE VIEW ===========

export const immunizationScheduleMV = sqliteView("immunization_schedule_mv").as(qb => {
	return qb
		.select({
			patientId: patient.id,
			fullName: sql<string>`${patient.firstName} || ' ' || ${patient.lastName}`.as("fullName"),
			dateOfBirth: patient.dateOfBirth,
			ageMonths:
				sql<number>`(strftime('%Y', 'now') - strftime('%Y', datetime(${patient.dateOfBirth}/1000, 'unixepoch'))) * 12 + (strftime('%m', 'now') - strftime('%m', datetime(${patient.dateOfBirth}/1000, 'unixepoch')))`.as(
					"ageMonths"
				),

			// Immunization info
			immunizationId: immunization.id,
			vaccineName: immunization.vaccine,
			doseNumber: immunization.dose,
			administrationDate: immunization.date,

			// Schedule info
			isMandatory: vaccineSchedule.isMandatory,
			description: vaccineSchedule.description,

			notes: immunization.notes,

			clinicId: patient.clinicId,
			updatedAt: sql<number>`(unixepoch() * 1000)`.as("updatedAt")
		})
		.from(patient)
		.innerJoin(immunization, eq(immunization.patientId, patient.id))
		.leftJoin(
			vaccineSchedule,
			sql`${vaccineSchedule.vaccineName} = ${immunization.vaccine} AND ${vaccineSchedule.ageInDaysMin} <= (unixepoch('now') - ${patient.dateOfBirth}/1000) / 86400`
		);
});

// =========== MEDICAL RECORDS VIEW ===========

export const medicalRecordsMV = sqliteView("medical_records_mv").as(qb => {
	return qb
		.select({
			medicalRecordId: medicalRecord.id ?? "",

			// Patient info
			patientId: patient.id,
			patientName: sql<string>`${patient.firstName} || ' ' || ${patient.lastName}`.as("patientName"),

			// Doctor info
			doctorId: doctor.id,
			doctorName: doctor.name,
			doctorSpecialty: doctor.specialty,

			// Encounter info
			encounterId: diagnosis.id,
			encounterDate: diagnosis.date,
			encounterType: diagnosis.type,
			diagnosis: diagnosis.diagnosis,
			treatment: diagnosis.treatment,

			// Appointment info
			appointmentId: appointment.id,
			appointmentDate: appointment.appointmentDate,
			appointmentReason: appointment.reason,

			// Medical data
			symptoms: medicalRecord.symptoms,
			followUpDate: medicalRecord.followUpDate,

			// Prescriptions from this encounter
			prescriptionCount:
				sql<number>`(SELECT COUNT(*) FROM ${prescription} WHERE ${prescription.encounterId} = ${diagnosis.id})`.as(
					"prescriptionCount"
				),

			// Lab tests from this encounter
			labTestCount:
				sql<number>`(SELECT COUNT(*) FROM ${labTest} WHERE ${labTest.recordId} = ${medicalRecord.id})`.as(
					"labTestCount"
				),

			clinicId: medicalRecord.clinicId,
			searchVector:
				sql<string>`(${patient.firstName} || ' ' || ${patient.lastName} || ' ' || ${doctor.name} || ' ' || COALESCE(${medicalRecord.diagnosis}, '') || ' ' || COALESCE(${medicalRecord.symptoms}, ''))`.as(
					"searchVector"
				),
			updatedAt: sql<number>`(unixepoch() * 1000)`.as("updatedAt")
		})
		.from(medicalRecord)
		.innerJoin(patient, eq(patient.id, medicalRecord.patientId))
		.innerJoin(doctor, eq(doctor.id, medicalRecord.doctorId))
		.leftJoin(diagnosis, eq(diagnosis.medicalId, medicalRecord.id))
		.leftJoin(appointment, eq(appointment.id, medicalRecord.appointmentId))
		.leftJoin(vitalSign, eq(vitalSign.encounterId, diagnosis.id));
});

// =========== NOTIFICATIONS VIEW (Commented out) ===========
/*
export const notificationsMV = sqliteView("notifications_mv").as(...)
*/

// =========== EXPENSE ANALYSIS VIEW (Commented out) ===========
/*
export const expenseAnalysisMV = sqliteView("expense_analysis_mv").as(...)
*/

// =========== REFRESH FUNCTIONS ===========

// SQLite Views are virtual tables, real-time, no refresh needed.
export async function refreshAllMaterializedViews() {
	// No-op for SQLite
}

export async function refreshClinicViews(_clinicId: string) {
	// No-op
}

export async function refreshPatientViews(_patientId: string) {
	// No-op
}

// =========== SORT COLUMN MAPPING ===========

const appointmentSortMap: Record<string, SQL<unknown>> = {
	date: sql`${appointmentScheduleMV.date}`,
	patientName: sql`${appointmentScheduleMV.patientName}`,
	doctorName: sql`${appointmentScheduleMV.doctorName}`,
	status: sql`${appointmentScheduleMV.status}`,
	time: sql`${appointmentScheduleMV.startTime}`
};

const patientSortMap: Record<string, SQL<unknown>> = {
	name: sql`${patientOverviewMV.fullName}`,
	age: sql`${patientOverviewMV.ageMonths}`,
	lastVisit: sql`${patientOverviewMV.lastAppointmentDate}`
	// mrn: sql`${patientOverviewMV.medicalRecordNumber}`,
};

const doctorSortMap: Record<string, SQL<unknown>> = {
	name: sql`${doctorPerformanceMV.name}`,
	specialty: sql`${doctorPerformanceMV.specialty}`,
	rating: sql`${doctorPerformanceMV.rating}`,
	appointments: sql`${doctorPerformanceMV.totalAppointments}`,
	revenue: sql`${doctorPerformanceMV.totalRevenue}`
};

export function getAppointmentSortColumn(sortBy: string): SQL<unknown> {
	return appointmentSortMap[sortBy] || sql`${appointmentScheduleMV.date}`;
}

export function getPatientSortColumn(sortBy: string): SQL<unknown> {
	return patientSortMap[sortBy] || sql`${patientOverviewMV.fullName}`;
}

export function getDoctorSortColumn(sortBy: string): SQL<unknown> {
	return doctorSortMap[sortBy] || sql`${doctorPerformanceMV.name}`;
}

export type DatabaseUser = typeof user.$inferSelect;
export type NewDatabaseUser = typeof user.$inferInsert;
export type DatabaseAccount = typeof account.$inferSelect;
export type NewDatabaseAccount = typeof account.$inferInsert;
export type DatabaseSession = typeof session.$inferSelect;
export type NewDatabaseSession = typeof session.$inferInsert;
export type DatabaseVerification = typeof verification.$inferSelect;
export type NewDatabaseVerification = typeof verification.$inferInsert;
export type DatabaseFiles = typeof files.$inferSelect;
export type NewDatabaseFiles = typeof files.$inferInsert;
export type DatabaseFolders = typeof folders.$inferSelect;
export type NewDatabaseFolders = typeof folders.$inferInsert;
export type DatabaseInvite = typeof invites.$inferSelect;
export type NewDatabaseInvite = typeof invites.$inferInsert;
export type DatabaseTwoFactor = typeof twoFactor.$inferSelect;
export type NewDatabaseTwoFactor = typeof twoFactor.$inferInsert;
export type DatabaseUserQuota = typeof userQuota.$inferSelect;
export type NewDatabaseUserQuota = typeof userQuota.$inferInsert;

export type DbClinic = typeof clinics.$inferSelect;
export type NewDbClinic = typeof clinics.$inferInsert;
export type DbDoctor = typeof doctor.$inferSelect;
export type NewDbDoctor = typeof doctor.$inferInsert;
export type DbPatient = typeof patient.$inferSelect;
export type NewDbPatient = typeof patient.$inferInsert;
export type DbAppointment = typeof appointment.$inferSelect;
export type NewDbAppointment = typeof appointment.$inferInsert;
export type DbMedicalRecord = typeof medicalRecord.$inferSelect;
export type NewDbMedicalRecord = typeof medicalRecord.$inferInsert;
export type DbDiagnosis = typeof diagnosis.$inferSelect;
export type NewDbDiagnosis = typeof diagnosis.$inferInsert;
export type DbService = typeof service.$inferSelect;
export type NewDbService = typeof service.$inferInsert;
export type DbPayment = typeof payment.$inferSelect;
export type NewDbPayment = typeof payment.$inferInsert;
export type DbPrescription = typeof prescription.$inferSelect;
export type NewDbPrescription = typeof prescription.$inferInsert;
export type DbWorkingDay = typeof workingDays.$inferSelect;
export type NewDbWorkingDay = typeof workingDays.$inferInsert;
export type DbStaff = typeof staff.$inferSelect;
export type NewDbStaff = typeof staff.$inferInsert;
export type DbVitalSign = typeof vitalSign.$inferSelect;
export type NewDbVitalSign = typeof vitalSign.$inferInsert;
export type DbImmunization = typeof immunization.$inferSelect;
export type NewDbImmunization = typeof immunization.$inferInsert;
export type DbGrowthRecord = typeof growthRecord.$inferSelect;
export type NewDbGrowthRecord = typeof growthRecord.$inferInsert;
export type DbDevelopmentalChecks = typeof developmentalChecks.$inferSelect;
export type NewDbDevelopmentalChecks = typeof developmentalChecks.$inferInsert;
export type DbFeedingLog = typeof feedingLog.$inferSelect;
export type NewDbFeedingLog = typeof feedingLog.$inferInsert;

export type DbGuardian = typeof guardian.$inferSelect;
export type NewDbGuardian = typeof guardian.$inferInsert;

export type DbDoseGuideline = typeof doseGuideline.$inferSelect;
export type NewDbDoseGuideline = typeof doseGuideline.$inferInsert;

export type DbPrescribedItem = typeof prescribedItem.$inferSelect;
export type NewDbPrescribedItem = typeof prescribedItem.$inferInsert;
export type DbWhoGrowthStandard = typeof whoGrowthStandard.$inferSelect;
export type NewDbWhoGrowthStandard = typeof whoGrowthStandard.$inferInsert;
export type DbVaccineSchedule = typeof vaccineSchedule.$inferSelect;
export type NewDbVaccineSchedule = typeof vaccineSchedule.$inferInsert;
export type DbClinicMember = typeof clinicMembers.$inferSelect;
export type NewDbClinicMember = typeof clinicMembers.$inferInsert;
export type DbPatientBill = typeof patientBill.$inferSelect;
export type NewDbPatientBill = typeof patientBill.$inferInsert;
export type DbRating = typeof rating.$inferSelect;
export type NewDbRating = typeof rating.$inferInsert;
export type DbReminder = typeof reminder.$inferSelect;
export type NewDbReminder = typeof reminder.$inferInsert;
export type DbClinicSetting = typeof clinicSetting.$inferSelect;
export type NewDbClinicSetting = typeof clinicSetting.$inferInsert;
export type DbDrug = typeof drug.$inferSelect;
export type NewDbDrug = typeof drug.$inferInsert;
export type InsertfeedingLog = typeof feedingLog.$inferInsert;
export type SelectfeedingLog = typeof feedingLog.$inferSelect;
export type UpdatefeedingLog = Partial<SelectfeedingLog> & { id: string };
export type DbLabTest = typeof labTest.$inferSelect;
export type NewDbLabTest = typeof labTest.$inferInsert;
