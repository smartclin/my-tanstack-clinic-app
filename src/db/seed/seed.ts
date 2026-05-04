import { faker } from "@faker-js/faker";

import type { AppDb } from "..";
// 导入类型
import type {
	DatabaseUser,
	DbAppointment,
	DbClinic,
	DbDiagnosis,
	DbDoctor,
	DbMedicalRecord,
	DbPatient,
	DbPayment,
	DbPrescription,
	DbService
} from "../schema";
import {
	account,
	appointment,
	clinicMembers,
	clinicSetting,
	clinics,
	configStore,
	developmentalChecks,
	developmentalMilestones,
	diagnosis,
	doctor,
	doseGuideline,
	drug,
	feedingLog,
	files,
	folders,
	growthRecord,
	guardian,
	immunization,
	invites,
	labTest,
	medicalRecord,
	patient,
	patientBill,
	payment,
	prescribedItem,
	prescription,
	rating,
	reminder,
	service,
	session,
	staff,
	twoFactor,
	user,
	userQuota,
	vaccineSchedule,
	verification,
	vitalSign,
	whoGrowthStandard,
	workingDays
} from "../schema";

// Configuration
const CONFIG = {
	totalUsers: 50,
	totalClinics: 8,
	totalDoctors: 20,
	totalPatients: 100,
	totalStaff: 15,
	totalAppointments: 300,
	totalMedicalRecords: 200,
	totalPrescriptions: 150,
	totalServices: 25,
	totalPayments: 250,
	totalImmunizations: 80,
	totalDrugs: 30,
	totalRatings: 80,
	totalVitalSigns: 200,
	totalFeedingLogs: 60,
	totalDevelopmentalChecks: 40,
	totalDevelopmentalMilestones: 120
};

// Enums
export enum AppointmentStatus {
	SCHEDULED = "SCHEDULED",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
	PENDING = "PENDING"
}

export enum Gender {
	MALE = "MALE",
	FEMALE = "FEMALE",
	OTHER = "OTHER"
}

export enum Status {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
	DORMANT = "DORMANT"
}

export enum JOBTYPE {
	FULL = "FULL",
	PART = "PART",
	CONTRACT = "CONTRACT"
}

export enum ServiceCategory {
	CONSULTATION = "CONSULTATION",
	LAB_TEST = "LAB_TEST",
	VACCINATION = "VACCINATION",
	PROCEDURE = "PROCEDURE",
	OTHER = "OTHER",
	PHARMACY = "PHARMACY",
	DIAGNOSIS = "DIAGNOSIS"
}

export enum ReminderMethod {
	EMAIL = "EMAIL",
	SMS = "SMS",
	PUSH = "PUSH"
}

export enum ReminderStatus {
	SENT = "SENT",
	FAILED = "FAILED",
	PENDING = "PENDING"
}

export enum PaymentStatus {
	PAID = "PAID",
	PARTIAL = "PARTIAL",
	UNPAID = "UNPAID"
}

export enum PaymentMethod {
	CASH = "CASH",
	CARD = "CARD",
	INSURANCE = "INSURANCE",
	BANK_TRANSFER = "BANK_TRANSFER"
}

export enum DevelopmentStatus {
	NORMAL = "NORMAL",
	DELAYED = "DELAYED",
	ADVANCED = "ADVANCED"
}

export enum DrugRoute {
	ORAL = "ORAL",
	IV = "IV",
	IM = "IM",
	SC = "SC",
	TOPICAL = "TOPICAL"
}

export enum DosageUnit {
	MG = "MG",
	ML = "ML",
	G = "G",
	MCG = "MCG",
	IU = "IU"
}

export enum FeedingType {
	BREAST = "BREAST",
	FORMULA = "FORMULA",
	SOLID = "SOLID",
	MIXED = "MIXED"
}

export enum MeasurementType {
	WFA = "WFA",
	HFA = "HFA",
	HcFA = "HcFA"
}

// Helper functions
const getRandomEnumValue = <T>(enumObj: Record<string, T>): T => {
	const enumValues = Object.values(enumObj) as T[];
	if (enumValues.length === 0) {
		throw new Error("Enum object has no values");
	}
	const index = Math.floor(Math.random() * enumValues.length);
	const value = enumValues[index];
	if (value === undefined) {
		throw new Error("Failed to pick a random enum value");
	}
	return value;
};

const getRandomSubset = <T>(array: T[], count: number): T[] => {
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, Math.min(count, shuffled.length));
};

const weightedRandom = <T>(items: Array<{ item: T; weight: number }>): T => {
	const total = items.reduce((sum, { weight }) => sum + weight, 0);
	let random = Math.random() * total;

	if (items.length === 0) {
		throw new Error("weightedRandom called with empty items");
	}

	for (const { item, weight } of items) {
		if (random < weight) return item;
		random -= weight;
	}

	const fallbackItem = items[0];
	if (fallbackItem === undefined) {
		throw new Error("weightedRandom: items[0] is undefined");
	}
	return fallbackItem.item;
};

// Time helper functions
const randomTime = (): string => {
	const hours = faker.number.int({ min: 8, max: 17 }).toString().padStart(2, "0");
	const minutes = faker.helpers.arrayElement(["00", "15", "30", "45"]);
	return `${hours}:${minutes}`;
};

// Generate realistic date of birth based on patient type
const generateDateOfBirth = (patientType: "adult" | "child" | "infant"): Date => {
	switch (patientType) {
		case "infant":
			return faker.date.birthdate({ min: 0, max: 2, mode: "age" });
		case "child":
			return faker.date.birthdate({ min: 2, max: 18, mode: "age" });
		default: // adult
			return faker.date.birthdate({ min: 18, max: 90, mode: "age" });
	}
};

// Helper function to safely delete data
const safeDeleteMany = async (db: AppDb, table: any): Promise<void> => {
	try {
		await db.delete(table).execute();
	} catch (err: unknown) {
		const errMsg = err instanceof Error ? err.message : String(err);
		if (errMsg.includes("no such table") || errMsg.includes("does not exist")) {
			return;
		}
		throw err;
	}
};

// Function to clear all data in proper order (respecting foreign key constraints)
const clearAllData = async (db: AppDb) => {
	console.log("🗑️ Clearing existing data in proper order...");

	// Clear data in reverse order of dependencies
	const clearOperations = [
		() => safeDeleteMany(db, prescribedItem),
		() => safeDeleteMany(db, prescription),
		() => safeDeleteMany(db, doseGuideline),
		() => safeDeleteMany(db, drug),
		() => safeDeleteMany(db, vitalSign),
		() => safeDeleteMany(db, diagnosis),
		() => safeDeleteMany(db, labTest),
		() => safeDeleteMany(db, patientBill),
		() => safeDeleteMany(db, payment),
		() => safeDeleteMany(db, reminder),
		() => safeDeleteMany(db, feedingLog),
		() => safeDeleteMany(db, immunization),
		() => safeDeleteMany(db, developmentalMilestones),
		() => safeDeleteMany(db, developmentalChecks),
		() => safeDeleteMany(db, rating),
		() => safeDeleteMany(db, medicalRecord),
		() => safeDeleteMany(db, appointment),
		() => safeDeleteMany(db, workingDays),
		() => safeDeleteMany(db, service),
		() => safeDeleteMany(db, guardian),
		() => safeDeleteMany(db, growthRecord),
		() => safeDeleteMany(db, whoGrowthStandard),
		() => safeDeleteMany(db, vaccineSchedule),
		() => safeDeleteMany(db, staff),
		() => safeDeleteMany(db, doctor),
		() => safeDeleteMany(db, patient),
		() => safeDeleteMany(db, clinicMembers),
		() => safeDeleteMany(db, clinicSetting),
		() => safeDeleteMany(db, clinics),
		() => safeDeleteMany(db, verification),
		() => safeDeleteMany(db, account),
		() => safeDeleteMany(db, session),
		() => safeDeleteMany(db, userQuota),
		() => safeDeleteMany(db, invites),
		() => safeDeleteMany(db, twoFactor),
		() => safeDeleteMany(db, folders),
		() => safeDeleteMany(db, files),
		() => safeDeleteMany(db, configStore),
		() => safeDeleteMany(db, user)
	];

	for (const operation of clearOperations) {
		await operation();
	}
};

// Create realistic clinics
async function createClinics(db: AppDb) {
	console.log("🏥 Creating clinics...");
	const clinicsData: DbClinic[] = [];
	const clinicNames = [
		"City Medical Center",
		"Community Health Clinic",
		"Family Care Hospital",
		"Pediatric Specialists",
		"General Healthcare Clinic",
		"Metropolitan Hospital",
		"Sunrise Medical Center",
		"Children's Health Center"
	];

	for (const name of clinicNames) {
		const clinicData = {
			id: faker.string.uuid(),
			name,
			email: faker.internet.email({
				firstName: (name.split(" ")[0] ?? "clinic").toLowerCase()
			}),
			timezone: faker.helpers.arrayElement(["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"]),
			address: faker.location.streetAddress(),
			phone: faker.phone.number(),
			deletedAt: null,
			isDeleted: false,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: faker.date.past({ years: 2 })
		};

		await db.insert(clinics).values(clinicData).execute();
		clinicsData.push(clinicData);

		// Create clinic settings
		await db
			.insert(clinicSetting)
			.values({
				id: faker.string.uuid(),
				clinicId: clinicData.id,
				openingTime: "08:00",
				closingTime: "17:00",
				workingDays: "MON,TUE,WED,THU,FRI,SAT",
				defaultAppointmentDuration: faker.helpers.arrayElement([15, 30, 45, 60]),
				requireEmergencyContact: faker.datatype.boolean(),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.execute();
	}

	return clinicsData;
}

// Create realistic users with different roles
async function createUsers(db: AppDb) {
	console.log("👥 Creating users...");
	const users: DatabaseUser[] = [];

	// Create admin users
	for (let i = 0; i < 5; i++) {
		const userData = {
			id: faker.string.uuid(),
			name: faker.person.fullName(),
			email: `admin${i + 1}@mediclinic.com`,
			emailVerified: true,
			image: faker.image.avatar(),
			role: "ADMIN",
			banned: false,
			clinicId: faker.string.uuid(), // Temporary, will be updated later
			twoFactorEnabled: i === 0,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: faker.date.past({ years: 2 }),
			banReason: null,
			banExpires: null,
			apiKey: null
		};

		await db.insert(user).values(userData).execute();
		users.push(userData);

		// Create user quota
		await db
			.insert(userQuota)
			.values({
				userId: userData.id,
				quota: faker.number.int({ min: 1000, max: 10000 }),
				usedQuota: faker.number.int({ min: 0, max: 500 }),
				fileCount: faker.number.int({ min: 0, max: 100 }),
				fileCountQuota: faker.number.int({ min: 100, max: 1000 }),
				inviteCount: faker.number.int({ min: 0, max: 10 }),
				inviteQuota: faker.number.int({ min: 10, max: 50 }),
				updatedAt: new Date()
			})
			.execute();
	}

	// Create doctors (as users)
	for (let i = 0; i < CONFIG.totalDoctors; i++) {
		const userData = {
			id: faker.string.uuid(),
			name: `Dr. ${faker.person.fullName()}`,
			email: faker.internet.email({
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName()
			}),
			emailVerified: faker.datatype.boolean(0.8),
			image: faker.image.avatar(),
			role: "DOCTOR",
			banned: false,
			clinicId: faker.string.uuid(), // Temporary
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: faker.date.past({ years: 2 }),
			banReason: null,
			banExpires: null,
			apiKey: null,
			twoFactorEnabled: false
		};

		await db.insert(user).values(userData).execute();
		users.push(userData);
	}

	// Create staff users
	for (let i = 0; i < CONFIG.totalStaff; i++) {
		const userData = {
			id: faker.string.uuid(),
			name: faker.person.fullName(),
			email: faker.internet.email(),
			emailVerified: faker.datatype.boolean(0.9),
			image: faker.image.avatar(),
			role: "STAFF",
			banned: false,
			clinicId: faker.string.uuid(), // Temporary
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: faker.date.past({ years: 1 }),
			banReason: null,
			banExpires: null,
			apiKey: null,
			twoFactorEnabled: false
		};

		await db.insert(user).values(userData).execute();
		users.push(userData);
	}

	// Create patient users
	for (let i = 0; i < CONFIG.totalPatients; i++) {
		const userData = {
			id: faker.string.uuid(),
			name: faker.person.fullName(),
			email: faker.internet.email(),
			emailVerified: faker.datatype.boolean(0.7),
			image: faker.image.avatar(),
			role: "PATIENT",
			banned: false,
			banReason: null,
			banExpires: null,
			clinicId: faker.string.uuid(), // Temporary
			apiKey: null,
			twoFactorEnabled: false,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: faker.date.past({ years: 1 })
		};

		await db.insert(user).values(userData).execute();
		users.push(userData);
	}

	return users;
}

// Associate users with clinics
async function associateUsersWithClinics(db: AppDb, users: DatabaseUser[], clinicsData: DbClinic[]) {
	console.log("🔗 Associating users with clinics...");

	for (const user of users) {
		const userClinics = getRandomSubset(clinicsData, 1);
		for (const clinic of userClinics) {
			await db
				.insert(clinicMembers)
				.values({
					userId: user.id,
					clinicId: clinic.id,
					role: user.role ?? "USER",
					createdAt: faker.date.past({ years: 1 }),
					updatedAt: faker.date.past({ years: 1 })
				})
				.execute();
		}
	}
}

// Create doctors with realistic data
async function createDoctors(db: AppDb, users: DatabaseUser[], clinicsData: DbClinic[]) {
	console.log("👨‍⚕️ Creating doctors...");
	const doctors: DbDoctor[] = [];
	const doctorUsers = users.filter(user => user.role === "DOCTOR");

	const specialties = [
		"Pediatrics",
		"Cardiology",
		"Dermatology",
		"Neurology",
		"Orthopedics",
		"Gynecology",
		"Psychiatry",
		"General Medicine",
		"Surgery",
		"Oncology",
		"Endocrinology",
		"Gastroenterology",
		"Pulmonology",
		"Rheumatology",
		"Urology"
	];

	for (let i = 0; i < Math.min(CONFIG.totalDoctors, doctorUsers.length); i++) {
		const user = doctorUsers[i];
		if (!user) continue;

		const clinic = faker.helpers.arrayElement(clinicsData);
		const specialty = faker.helpers.arrayElement(specialties);

		const doctorData = {
			id: faker.string.uuid(),
			email: user.email ?? "",
			name: user.name,
			userId: user.id,
			clinicId: clinic.id,
			specialty,
			licenseNumber: faker.string.alphanumeric(10).toUpperCase(),
			phone: faker.phone.number(),
			address: faker.location.streetAddress(),
			department: faker.helpers.arrayElement(["Emergency", "Outpatient", "Surgery", "ICU", "Pediatrics"]),
			img: faker.image.avatar(),
			colorCode: faker.color.rgb(),
			availabilityStatus: weightedRandom([
				{ item: "Available", weight: 0.6 },
				{ item: "Busy", weight: 0.2 },
				{ item: "On Leave", weight: 0.1 },
				{ item: "Off Duty", weight: 0.1 }
			]),
			availableFromWeekDay: faker.number.int({ min: 1, max: 5 }),
			availableToWeekDay: faker.number.int({ min: 1, max: 5 }),
			availableFromTime: "08:00",
			availableToTime: "18:00",
			type: getRandomEnumValue(JOBTYPE),
			appointmentPrice: faker.number.int({ min: 80, max: 300 }),
			status: weightedRandom([
				{ item: Status.ACTIVE, weight: 0.85 },
				{ item: Status.INACTIVE, weight: 0.1 },
				{ item: Status.DORMANT, weight: 0.05 }
			]),
			isActive: faker.datatype.boolean(0.9),
			role: "DOCTOR",
			rating: faker.number.int({ min: 1, max: 5 }),
			isDeleted: false,
			deletedAt: null,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: faker.date.past({ years: 2 })
		};

		await db.insert(doctor).values(doctorData).execute();
		doctors.push(doctorData);

		// Create working days
		const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		const workingDayList = getRandomSubset(days, faker.number.int({ min: 4, max: 6 }));

		for (const day of workingDayList) {
			await db
				.insert(workingDays)
				.values({
					id: faker.string.uuid(),
					doctorId: doctorData.id,
					day,
					startTime: faker.helpers.arrayElement(["08:00", "09:00", "10:00"]),
					endTime: faker.helpers.arrayElement(["16:00", "17:00", "18:00"]),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.execute();
		}
	}

	return doctors;
}

// Create staff members
async function createStaff(db: AppDb, users: DatabaseUser[], clinicsData: DbClinic[]) {
	console.log("👨‍💼 Creating staff...");
	const staffData: any[] = [];
	const staffUsers = users.filter(user => user.role === "STAFF");

	for (let i = 0; i < Math.min(CONFIG.totalStaff, staffUsers.length); i++) {
		const user = staffUsers[i];
		if (!user) continue;

		const clinic = faker.helpers.arrayElement(clinicsData);

		const staffMember = {
			id: faker.string.uuid(),
			email: user.email ?? "",
			name: user.name,
			phone: faker.phone.number(),
			userId: user.id,
			clinicId: clinic.id,
			address: faker.location.streetAddress(),
			department: faker.helpers.arrayElement([
				"Administration",
				"Nursing",
				"Laboratory",
				"Pharmacy",
				"Reception"
			]),
			img: faker.image.avatar(),
			licenseNumber: faker.string.alphanumeric(8).toUpperCase(),
			colorCode: faker.color.rgb(),
			hireDate: faker.date.past({ years: 5 }),
			salary: faker.number.float({ min: 30000, max: 80000 }),
			role: "STAFF",
			status: weightedRandom([
				{ item: Status.ACTIVE, weight: 0.9 },
				{ item: Status.INACTIVE, weight: 0.1 }
			]),
			isActive: faker.datatype.boolean(0.95),
			deletedAt: null,
			createdAt: faker.date.past({ years: 5 }),
			updatedAt: faker.date.past({ years: 5 })
		};

		await db.insert(staff).values(staffMember).execute();
		staffData.push(staffMember);
	}

	return staffData;
}

// Create patients with realistic data
async function createPatients(db: AppDb, users: DatabaseUser[], clinicsData: DbClinic[]) {
	console.log("👤 Creating patients...");
	const patients: DbPatient[] = [];
	const patientUsers = users.filter(user => user.role === "PATIENT");

	for (let i = 0; i < Math.min(CONFIG.totalPatients, patientUsers.length); i++) {
		const user = patientUsers[i];
		if (!user) continue;

		const clinic = faker.helpers.arrayElement(clinicsData);

		const dateOfBirth = generateDateOfBirth("child");

		const patientData = {
			id: faker.string.uuid(),
			clinicId: clinic.id,
			firstName: user.name.split(" ")[0] ?? "",
			lastName: user.name.split(" ").slice(1).join(" "),
			email: user.email ?? "",
			phone: faker.phone.number(),
			emergencyContactNumber: faker.phone.number(),
			emergencyContactName: faker.person.fullName(),
			relation: faker.helpers.arrayElement(["Spouse", "Parent", "Sibling", "Friend"]),
			userId: user.id,
			dateOfBirth,
			gender: getRandomEnumValue(Gender),
			bloodGroup: faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", null]),
			address: faker.location.streetAddress(),
			allergies: faker.datatype.boolean(0.3) ? faker.lorem.words(faker.number.int({ min: 1, max: 3 })) : null,
			medicalConditions: faker.datatype.boolean(0.4)
				? faker.lorem.words(faker.number.int({ min: 1, max: 5 }))
				: null,
			medicalHistory: faker.datatype.boolean(0.2) ? faker.lorem.paragraph() : null,
			image: faker.image.avatar(),
			colorCode: faker.color.rgb(),
			role: "PATIENT",
			status: weightedRandom([
				{ item: Status.ACTIVE, weight: 0.85 },
				{ item: Status.INACTIVE, weight: 0.1 },
				{ item: Status.DORMANT, weight: 0.05 }
			]),
			isActive: faker.datatype.boolean(0.9),
			deletedAt: faker.datatype.boolean(0.05) ? faker.date.past() : null,
			isDeleted: faker.datatype.boolean(0.05),
			createdById: users.find(u => u.role === "ADMIN")?.id || users[0]?.id || "",
			updatedById: null,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: faker.date.past({ years: 1 }),
			maritalStatus: null,
			nutritionalStatus: null
		};

		await db.insert(patient).values(patientData).execute();
		patients.push(patientData);
	}

	return patients;
}

// Create services
async function createServices(db: AppDb, clinicsData: DbClinic[]) {
	console.log("🩺 Creating services...");
	const services: DbService[] = [];

	const serviceData = [
		{
			name: "General Consultation",
			category: ServiceCategory.CONSULTATION,
			price: 50.0,
			duration: 30
		},
		{
			name: "Specialist Consultation",
			category: ServiceCategory.CONSULTATION,
			price: 80.0,
			duration: 45
		},
		{
			name: "Emergency Visit",
			category: ServiceCategory.CONSULTATION,
			price: 120.0,
			duration: 60
		},
		{
			name: "Blood Test",
			category: ServiceCategory.LAB_TEST,
			price: 15.0,
			duration: 15
		},
		{
			name: "Urine Test",
			category: ServiceCategory.LAB_TEST,
			price: 10.0,
			duration: 10
		},
		{
			name: "X-Ray",
			category: ServiceCategory.LAB_TEST,
			price: 35.0,
			duration: 30
		},
		{
			name: "MRI Scan",
			category: ServiceCategory.LAB_TEST,
			price: 200.0,
			duration: 60
		},
		{
			name: "Flu Vaccine",
			category: ServiceCategory.VACCINATION,
			price: 20.0,
			duration: 20
		},
		{
			name: "COVID-19 Vaccine",
			category: ServiceCategory.VACCINATION,
			price: 0.0,
			duration: 30
		},
		{
			name: "Childhood Immunization",
			category: ServiceCategory.VACCINATION,
			price: 15.0,
			duration: 25
		},
		{
			name: "Minor Surgery",
			category: ServiceCategory.PROCEDURE,
			price: 150.0,
			duration: 60
		},
		{
			name: "Suture Removal",
			category: ServiceCategory.PROCEDURE,
			price: 25.0,
			duration: 15
		},
		{
			name: "Physical Therapy",
			category: ServiceCategory.OTHER,
			price: 45.0,
			duration: 45
		},
		{
			name: "Counseling Session",
			category: ServiceCategory.OTHER,
			price: 60.0,
			duration: 50
		},
		{
			name: "Medication Review",
			category: ServiceCategory.PHARMACY,
			price: 30.0,
			duration: 20
		},
		{
			name: "Diagnostic Imaging",
			category: ServiceCategory.DIAGNOSIS,
			price: 90.0,
			duration: 40
		},
		{
			name: "Ultrasound",
			category: ServiceCategory.DIAGNOSIS,
			price: 75.0,
			duration: 30
		}
	];

	for (const s of serviceData) {
		const clinic = faker.helpers.arrayElement(clinicsData);
		const newService = {
			id: faker.string.uuid(),
			serviceName: s.name,
			description: faker.lorem.sentence(),
			price: s.price,
			category: s.category,
			duration: s.duration,
			isAvailable: faker.datatype.boolean(0.9),
			clinicId: clinic.id,
			icon: faker.helpers.arrayElement(["🩺", "💉", "🩸", "🧪", "📋", "🩹", "💊"]),
			color: faker.color.rgb(),
			isDeleted: false,
			deletedAt: null,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: faker.date.past({ years: 1 })
		};

		await db.insert(service).values(newService).execute();
		services.push(newService);
	}

	return services;
}

// Create appointments
async function createAppointments(db: AppDb, patients: DbPatient[], doctors: DbDoctor[], services: DbService[]) {
	console.log("📅 Creating appointments...");
	const appointments: DbAppointment[] = [];

	for (let i = 0; i < CONFIG.totalAppointments; i++) {
		const patient = faker.helpers.arrayElement(patients);
		const doctor = faker.helpers.arrayElement(doctors);
		const service = faker.helpers.arrayElement(services);
		const clinicId = doctor.clinicId
			? doctor.clinicId
			: (faker.helpers.arrayElement([...new Set(patients.map(p => p.clinicId))]) ?? "");

		const status = weightedRandom([
			{ item: AppointmentStatus.SCHEDULED, weight: 0.4 },
			{ item: AppointmentStatus.COMPLETED, weight: 0.4 },
			{ item: AppointmentStatus.CANCELLED, weight: 0.15 },
			{ item: AppointmentStatus.PENDING, weight: 0.05 }
		]);

		let appointmentDate: Date;
		if (status === AppointmentStatus.COMPLETED) {
			appointmentDate = faker.date.past({ years: 1 });
		} else if (status === AppointmentStatus.SCHEDULED) {
			appointmentDate = faker.date.future({ years: 0.5 });
		} else {
			const fromDate = faker.date.past({ years: 1 });
			const toDate = faker.date.future({ years: 0.5 });
			appointmentDate = faker.date.between({ from: fromDate, to: toDate });
		}

		const appointmentData = {
			id: faker.string.uuid(),
			patientId: patient.id,
			doctorId: doctor.id,
			serviceId: service.id,
			doctorSpecialty: doctor.specialty,
			appointmentDate,
			appointmentPrice: doctor.appointmentPrice,
			clinicId,
			durationMinutes: faker.number.int({ min: 30, max: 120 }),
			time: randomTime(),
			status: status as string,
			type: weightedRandom([
				{ item: "Checkup", weight: 0.5 },
				{ item: "Follow-up", weight: 0.3 },
				{ item: "Emergency", weight: 0.1 },
				{ item: "Consultation", weight: 0.1 }
			]),
			note: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : null,
			reason: faker.datatype.boolean(0.8) ? faker.lorem.sentence() : null,
			isDeleted: false,
			deletedAt: null,
			createdAt: faker.date.past({ years: 1 }),
			updatedAt: faker.date.past({ years: 1 })
		};

		await db.insert(appointment).values(appointmentData).execute();
		appointments.push(appointmentData);

		// Create reminders for upcoming appointments
		if (status === AppointmentStatus.SCHEDULED && appointmentDate > new Date()) {
			await createReminder(db, appointmentData);
		}
	}

	return appointments;
}

// Create reminder for appointment
const createReminder = async (db: AppDb, appointment: DbAppointment) => {
	if (faker.datatype.boolean(0.6)) {
		await db
			.insert(reminder)
			.values({
				id: faker.string.uuid(),
				appointmentId: appointment.id,
				method: getRandomEnumValue(ReminderMethod),
				sentAt: faker.date.recent(),
				status: weightedRandom([
					{ item: ReminderStatus.SENT, weight: 0.8 },
					{ item: ReminderStatus.FAILED, weight: 0.1 },
					{ item: ReminderStatus.PENDING, weight: 0.1 }
				])
			})
			.execute();
	}
};

// Create medical records and related data
async function createMedicalRecords(
	db: AppDb,
	patients: DbPatient[],
	appointments: DbAppointment[],
	services: DbService[]
) {
	console.log("📋 Creating medical records & related data...");
	const medicalRecords: DbMedicalRecord[] = [];

	// Use only completed appointments for medical records
	const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED);

	for (const appointment of getRandomSubset(completedAppointments, CONFIG.totalMedicalRecords)) {
		const patient = patients.find(p => p.id === appointment.patientId);
		if (!patient) continue;

		const medicalRecordData = {
			id: faker.string.uuid(),
			patientId: appointment.patientId ?? "",
			appointmentId: appointment.id,
			doctorId: appointment.doctorId,
			treatmentPlan: faker.datatype.boolean(0.8) ? faker.lorem.paragraph() : null,
			labRequest: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,
			clinicId: appointment.clinicId ?? "",
			diagnosis: faker.datatype.boolean(0.7) ? faker.lorem.words(faker.number.int({ min: 1, max: 3 })) : null,
			symptoms: faker.datatype.boolean(0.8) ? faker.lorem.words(faker.number.int({ min: 1, max: 5 })) : null,
			notes: faker.datatype.boolean(0.6) ? faker.lorem.paragraph() : null,
			attachments: faker.datatype.boolean(0.3) ? faker.system.filePath() : null,
			followUpDate: faker.datatype.boolean(0.4) ? faker.date.future({ years: 0.5 }) : null,
			isDeleted: false,
			deletedAt: null,
			status: faker.datatype.boolean(0.8) ? "completed" : "pending",
			diagnosisDate: faker.date.past({ years: 0.5 }),
			medications: faker.datatype.boolean(0.5) ? faker.lorem.words(faker.number.int({ min: 1, max: 3 })) : null,
			createdAt: appointment.appointmentDate,
			updatedAt: appointment.appointmentDate
		};

		await db.insert(medicalRecord).values(medicalRecordData).execute();
		medicalRecords.push(medicalRecordData);

		try {
			// Create encounter
			const encounter = await createDiagnosis(db, medicalRecordData, appointment);
			// Create vital signs
			if (faker.datatype.boolean(0.8)) {
				await createVitalSigns(db, patient, medicalRecordData, encounter);
			}

			if (faker.datatype.boolean(0.4)) {
				await createLabTest(db, medicalRecordData, services);
			}
		} catch (error) {
			console.error("Failed to create related data for medical record:", medicalRecordData.id, error);
			throw error;
		}
	}

	return medicalRecords;
}

// Create encounter
const createDiagnosis = async (db: AppDb, medicalRecord: DbMedicalRecord, appointment: DbAppointment) => {
	const diagnosisData: DbDiagnosis = {
		id: faker.string.uuid(),
		clinicId: medicalRecord.clinicId,
		appointmentId: medicalRecord.appointmentId,
		patientId: medicalRecord.patientId,
		doctorId: medicalRecord.doctorId || appointment.doctorId,
		date: appointment.appointmentDate,
		type: weightedRandom([
			{ item: "Initial", weight: 0.4 },
			{ item: "Follow-up", weight: 0.4 },
			{ item: "Emergency", weight: 0.1 },
			{ item: "Consultation", weight: 0.1 }
		]),
		diagnosis: medicalRecord.diagnosis,
		treatment: medicalRecord.treatmentPlan,
		notes: medicalRecord.notes,
		medicalId: medicalRecord.id,
		symptoms: medicalRecord.symptoms ?? "",
		prescribedMedications: faker.datatype.boolean(0.5) ? faker.lorem.words(3) : null,
		followUpPlan: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : null,
		isDeleted: false,
		deletedAt: null,
		createdAt: appointment.appointmentDate,
		updatedAt: appointment.appointmentDate
	};

	await db.insert(diagnosis).values(diagnosisData).execute();
	return diagnosisData;
};

// Create vital signs
const createVitalSigns = async (
	db: AppDb,
	patient: DbPatient,
	medicalRecord: DbMedicalRecord,
	encounter: DbDiagnosis
) => {
	const ageDays = Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24));
	const ageMonths = Math.floor(ageDays / 30);

	const vitalSignsData = {
		id: faker.string.uuid(),
		encounterId: encounter.id,
		patientId: patient.id,
		medicalId: medicalRecord.id,
		growthRecordId: null,
		recordedAt: encounter.date ?? medicalRecord.createdAt,
		gender: patient.gender,
		ageDays,
		ageMonths,
		notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
		bodyTemperature: null as number | null,
		systolic: null as number | null,
		diastolic: null as number | null,
		heartRate: null as number | null,
		respiratoryRate: null as number | null,
		oxygenSaturation: null as number | null,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	const growthRecordData = {
		id: faker.string.uuid(),
		patientId: patient.id,
		recordedAt: encounter.date ?? medicalRecord.createdAt,
		height: null as number | null,
		weight: null as number | null,
		bmi: null as number | null,
		date: encounter.date ?? medicalRecord.createdAt,
		headCircumference: null as number | null,
		notes: null as string | null,
		gender: patient.gender,
		ageDays,
		ageMonths,
		weightForAgeZ: null as number | null,
		heightForAgeZ: null as number | null,
		bmiForAgeZ: null as number | null,
		hcForAgeZ: null as number | null,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	// Add vitals based on patient age
	if (ageMonths < 24) {
		// Infant/child
		vitalSignsData.bodyTemperature = faker.number.float({
			min: 36.5,
			max: 37.5
		});
		growthRecordData.height = faker.number.float({
			min: 45,
			max: 100
		});
		growthRecordData.weight = faker.number.float({
			min: 2.5,
			max: 20
		});
		growthRecordData.headCircumference = faker.number.float({
			min: 30,
			max: 50
		});
	} else {
		// Adult
		vitalSignsData.bodyTemperature = faker.number.float({
			min: 36.0,
			max: 37.5
		});
		growthRecordData.height = faker.number.float({
			min: 150,
			max: 200
		});
		growthRecordData.weight = faker.number.float({
			min: 45,
			max: 120
		});
		vitalSignsData.systolic = faker.number.int({ min: 100, max: 140 });
		vitalSignsData.diastolic = faker.number.int({ min: 60, max: 90 });

		vitalSignsData.heartRate = faker.number.int({ min: 60, max: 100 });
		vitalSignsData.respiratoryRate = faker.number.int({ min: 12, max: 20 });
		vitalSignsData.oxygenSaturation = faker.number.int({ min: 95, max: 100 });

		// Calculate BMI
		if (growthRecordData.height && growthRecordData.weight) {
			const heightInM = growthRecordData.height / 100;
			growthRecordData.bmi = growthRecordData.weight / (heightInM * heightInM);
		}

		// Calculate WHO percentiles for children if under 5 years
		if (ageMonths < 60 && growthRecordData.height && growthRecordData.weight) {
			growthRecordData.weightForAgeZ = faker.number.float({
				min: -2,
				max: 2
			});
			growthRecordData.heightForAgeZ = faker.number.float({
				min: -2,
				max: 2
			});
			growthRecordData.bmiForAgeZ = faker.number.float({
				min: -2,
				max: 2
			});
			growthRecordData.hcForAgeZ = growthRecordData.headCircumference
				? faker.number.float({ min: -2, max: 2 })
				: null;
		}
	}

	await db.insert(vitalSign).values(vitalSignsData).execute();
	await db.insert(growthRecord).values(growthRecordData).execute();
};

// Create lab test
const createLabTest = async (db: AppDb, medicalRecord: DbMedicalRecord, services: DbService[]) => {
	await db
		.insert(labTest)
		.values({
			id: faker.string.uuid(),
			serviceId: faker.helpers.arrayElement(services).id,
			recordId: medicalRecord.id,
			testDate: faker.date.between({
				from: medicalRecord.createdAt,
				to: new Date()
			}),
			result: faker.helpers.arrayElement(["Normal", "Abnormal", "Pending", "Inconclusive"]),
			status: faker.helpers.arrayElement(["COMPLETED", "PENDING", "CANCELLED", "REVIEWED"]),
			notes: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.execute();
};

// Create drugs and prescriptions
const createDrugsAndPrescriptions = async (
	db: AppDb,
	medicalRecords: DbMedicalRecord[],
	patients: DbPatient[],
	doctors: DbDoctor[]
) => {
	console.log("💊 Creating drugs and prescriptions...");

	// Create drugs
	const drugs = [];
	const drugNames = [
		"Amoxicillin",
		"Ibuprofen",
		"Paracetamol",
		"Aspirin",
		"Lisinopril",
		"Metformin",
		"Atorvastatin",
		"Levothyroxine",
		"Albuterol",
		"Omeprazole",
		"Losartan",
		"Sertraline",
		"Simvastatin",
		"Hydrochlorothiazide",
		"Prednisone",
		"Amlodipine",
		"Metoprolol",
		"Gabapentin",
		"Warfarin",
		"Furosemide"
	];

	for (const drugName of drugNames) {
		const newDrug = {
			id: faker.string.uuid(),
			name: drugName,
			createdAt: faker.date.past({ years: 2 }),
			updatedAt: faker.date.past({ years: 2 })
		};

		await db.insert(drug).values(newDrug).execute();
		drugs.push(newDrug);

		// Create dose guidelines for some drugs
		if (faker.datatype.boolean(0.6)) {
			await db
				.insert(doseGuideline)
				.values({
					id: faker.string.uuid(),
					drugId: newDrug.id,
					route: getRandomEnumValue(DrugRoute),
					clinicalIndication: faker.lorem.words(3),
					minDosePerKg: faker.number.float({ min: 1, max: 10 }),
					maxDosePerKg: faker.number.float({ min: 10, max: 50 }),
					doseUnit: getRandomEnumValue(DosageUnit),
					frequencyDays: faker.helpers.arrayElement(["Once daily", "Twice daily", "Every 6 hours"]),
					maxDosePer24h: faker.number.float({ min: 100, max: 1000 }),
					createdAt: faker.date.past({ years: 1 }),
					updatedAt: faker.date.past({ years: 1 })
				})
				.execute();
		}
	}

	// Create prescriptions
	const prescriptions: DbPrescription[] = [];
	const prescriptionMedicalRecords = getRandomSubset(medicalRecords, CONFIG.totalPrescriptions);

	for (const medicalRecord of prescriptionMedicalRecords) {
		const patient = patients.find(p => p.id === medicalRecord.patientId);
		if (!patient) continue;

		const prescriptionData = {
			id: faker.string.uuid(),
			medicalRecordId: medicalRecord.id,
			doctorId: medicalRecord.doctorId ?? doctors[0]?.id ?? "",
			patientId: patient.id,
			encounterId: medicalRecord.id, // Using medicalRecord id as encounter id
			medicationName: faker.helpers.arrayElement(drugNames),
			instructions: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : null,
			issuedDate: medicalRecord.createdAt,
			endDate: faker.date.future({ years: 0.5 }),
			status: faker.helpers.arrayElement(["active", "completed", "cancelled"]),
			clinicId: medicalRecord.clinicId,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(prescription).values(prescriptionData).execute();
		prescriptions.push(prescriptionData);

		// Create prescribed items
		if (faker.datatype.boolean(0.8)) {
			const drug = faker.helpers.arrayElement(drugs);
			await db
				.insert(prescribedItem)
				.values({
					id: faker.string.uuid(),
					prescriptionId: prescriptionData.id,
					drugId: drug.id,
					frequency: faker.helpers.arrayElement([
						"Once daily",
						"Twice daily",
						"Three times daily",
						"Every 6 hours"
					]),
					duration: faker.helpers.arrayElement(["7 days", "10 days", "14 days", "30 days", "Until finished"]),
					dosageValue: faker.number.float({ min: 1, max: 100 }),
					dosageUnit: getRandomEnumValue(DosageUnit),
					instructions: prescriptionData.instructions,
					drugRoute: getRandomEnumValue(DrugRoute),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.execute();
		}
	}

	return { drugs, prescriptions };
};

// Create payments
const createPayments = async (
	db: AppDb,
	appointments: DbAppointment[],
	patients: DbPatient[],
	services: DbService[]
) => {
	console.log("💰 Creating payments...");
	const payments: DbPayment[] = [];

	const paymentAppointments = getRandomSubset(appointments, CONFIG.totalPayments);

	for (const appointment of paymentAppointments) {
		const patient = patients.find(p => p.id === appointment.patientId);
		if (!patient) continue;

		const totalAmount = faker.number.int({ min: 50, max: 500 });
		const amountPaid = faker.datatype.boolean(0.8) ? totalAmount : faker.number.int({ min: 0, max: totalAmount });

		const status =
			amountPaid >= totalAmount
				? PaymentStatus.PAID
				: amountPaid > 0
					? PaymentStatus.PARTIAL
					: PaymentStatus.UNPAID;

		const paymentData = {
			id: faker.string.uuid(),
			clinicId: appointment.clinicId,
			patientId: appointment.patientId,
			appointmentId: appointment.id,
			billDate: appointment.appointmentDate,
			paymentDate:
				status === PaymentStatus.PAID
					? faker.date.between({
							from:
								appointment.appointmentDate > new Date()
									? appointment.createdAt
									: appointment.appointmentDate,
							to: new Date()
						})
					: null,
			discount: faker.datatype.boolean(0.2) ? faker.number.int({ min: 5, max: 50 }) : null,
			totalAmount,
			amountPaid,
			amount: totalAmount,
			status: status as string,
			insurance: faker.datatype.boolean(0.3) ? faker.company.name() : null,
			insuranceId: faker.datatype.boolean(0.2) ? faker.string.alphanumeric(10) : null,
			serviceDate: appointment.appointmentDate,
			dueDate: faker.date.future({ years: 0.5 }),
			paidDate:
				status === PaymentStatus.PAID
					? faker.date.between({
							from:
								appointment.appointmentDate > new Date()
									? appointment.createdAt
									: appointment.appointmentDate,
							to: new Date()
						})
					: null,
			notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
			paymentMethod: getRandomEnumValue(PaymentMethod),
			receiptNumber: faker.number.int({ min: 1000, max: 9999 }),
			isDeleted: false,
			deletedAt: null,
			billId: null,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(payment).values(paymentData).execute();
		payments.push(paymentData);

		// Create patient bills
		if (faker.datatype.boolean(0.6)) {
			await createPatientBill(db, paymentData, services);
		}
	}

	return payments;
};

// Create patient bill
const createPatientBill = async (db: AppDb, payment: DbPayment, services: DbService[]) => {
	const serviceCount = faker.number.int({ min: 1, max: 3 });

	for (let i = 0; i < serviceCount; i++) {
		await db
			.insert(patientBill)
			.values({
				id: faker.string.uuid(),
				billId: payment.id,
				serviceId: faker.helpers.arrayElement(services).id,
				serviceDate: faker.date.recent(),
				quantity: faker.number.int({ min: 1, max: 5 }),
				unitCost: faker.number.int({ min: 10, max: 200 }),
				totalCost: faker.number.int({ min: 10, max: 1000 }),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.execute();
	}
};

// Create immunizations
const createImmunizations = async (db: AppDb, patients: DbPatient[], staffData: any[]) => {
	console.log("💉 Creating immunizations...");
	const immunizations = [];

	const vaccines = [
		"Hepatitis B",
		"Rotavirus",
		"Diphtheria",
		"Tetanus",
		"Pertussis",
		"Haemophilus influenzae",
		"Pneumococcal",
		"Polio",
		"Influenza",
		"Measles",
		"Mumps",
		"Rubella",
		"Varicella",
		"Hepatitis A",
		"HPV"
	];

	for (let i = 0; i < CONFIG.totalImmunizations; i++) {
		const patient = faker.helpers.arrayElement(patients);
		const administeringStaff = faker.helpers.arrayElement(staffData);

		const newImmunization = {
			id: faker.string.uuid(),
			patientId: patient.id,
			vaccine: faker.helpers.arrayElement(vaccines),
			date: faker.date.past({ years: 2 }),
			dose: faker.helpers.arrayElement(["1st dose", "2nd dose", "Booster", "Single dose"]),
			lotNumber: faker.string.alphanumeric(10).toUpperCase(),
			administeredByStaffId: administeringStaff?.id || null,
			notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
			isDeleted: false,
			deletedAt: null,
			createdAt: faker.date.past({ years: 2 })
		};

		await db.insert(immunization).values(newImmunization).execute();
		immunizations.push(newImmunization);
	}

	return immunizations;
};

// Create feeding logs (for pediatric patients)
const createFeedingLogs = async (db: AppDb, patients: DbPatient[]) => {
	console.log("🍼 Creating feeding logs...");
	const feedingLogs = [];
	const pediatricCandidates = patients.filter(patient => {
		const age = new Date().getFullYear() - patient.dateOfBirth.getFullYear();
		return age < 2;
	});
	const pediatricPatients = pediatricCandidates.slice(
		0,
		Math.min(CONFIG.totalFeedingLogs / 3, pediatricCandidates.length)
	);

	for (const patient of pediatricPatients) {
		const logCount = faker.number.int({ min: 3, max: 10 });

		for (let i = 0; i < logCount; i++) {
			const feedingLogData = {
				id: faker.string.uuid(),
				patientId: patient.id,
				date: faker.date.recent({ days: 30 }),
				type: getRandomEnumValue(FeedingType),
				duration: faker.number.int({ min: 10, max: 40 }),
				amount: faker.datatype.boolean(0.5) ? faker.number.float({ min: 30, max: 200 }) : null,
				breast: faker.datatype.boolean(0.5) ? faker.helpers.arrayElement(["Left", "Right", "Both"]) : null,
				notes: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : null
			};

			await db.insert(feedingLog).values(feedingLogData).execute();
			feedingLogs.push(feedingLogData);
		}
	}

	return feedingLogs;
};

// Create developmental checks
const createDevelopmentalChecks = async (db: AppDb, patients: DbPatient[]) => {
	console.log("📊 Creating developmental checks...");
	const createdChecks = [];

	const pediatricCandidates = patients.filter(patient => {
		const age = new Date().getFullYear() - patient.dateOfBirth.getFullYear();
		return age < 5;
	});
	const pediatricPatients = pediatricCandidates.slice(
		0,
		Math.min(CONFIG.totalDevelopmentalChecks, pediatricCandidates.length)
	);

	for (const patient of pediatricPatients) {
		const check = {
			id: faker.string.uuid(),
			patientId: patient.id,
			checkDate: faker.date.past({ years: 1 }),
			ageMonths: faker.number.int({ min: 1, max: 60 }),
			motorSkills: getRandomEnumValue(DevelopmentStatus),
			languageSkills: getRandomEnumValue(DevelopmentStatus),
			socialSkills: getRandomEnumValue(DevelopmentStatus),
			cognitiveSkills: getRandomEnumValue(DevelopmentStatus),
			milestonesMet: faker.lorem.words(5),
			milestonesPending: faker.lorem.words(3),
			concerns: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
			recommendations: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(developmentalChecks).values(check).execute();
		createdChecks.push(check);

		// Create developmental milestones
		const milestoneCount = faker.number.int({ min: 2, max: 5 });
		for (let i = 0; i < milestoneCount; i++) {
			await db
				.insert(developmentalMilestones)
				.values({
					patientId: patient.id,
					milestone: faker.lorem.words(3),
					ageAchieved: faker.helpers.arrayElement(["2 months", "6 months", "1 year", "18 months", "2 years"]),
					dateRecorded: check.checkDate,
					notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
					createdBy: faker.person.fullName(),
					updatedBy: null,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.execute();
		}
	}

	return createdChecks;
};

// Create ratings
const createRatings = async (db: AppDb, doctors: DbDoctor[], patients: DbPatient[]) => {
	console.log("⭐ Creating ratings...");
	for (const doctor of doctors) {
		if (!faker.datatype.boolean(0.7)) continue;

		const ratingCount = faker.number.int({ min: 1, max: 5 });

		for (let i = 0; i < ratingCount; i++) {
			const patient = faker.helpers.arrayElement(patients);

			await db
				.insert(rating)
				.values({
					staffId: doctor.id,
					patientId: patient.id,
					rating: faker.number.int({ min: 1, max: 5 }),
					comment: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : null,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.execute();
		}
	}
};

// Create WHO growth standards (sample data)
const createWHOGrowthStandards = async (db: AppDb) => {
	console.log("📏 Creating WHO growth standards...");
	const standards = [];

	for (let ageMonths = 0; ageMonths <= 60; ageMonths += 6) {
		for (const gender of [Gender.MALE, Gender.FEMALE]) {
			for (const measurementType of [MeasurementType.WFA, MeasurementType.HFA, MeasurementType.HcFA]) {
				const standard = {
					id: faker.string.uuid(),
					ageInMonths: ageMonths,
					ageDays: ageMonths * 30,
					gender,
					measurementType,
					lValue: faker.number.float({ min: -2, max: 2 }),
					mValue: faker.number.float({ min: 5, max: 50 }),
					sValue: faker.number.float({ min: 0.1, max: 0.3 }),
					sd0: faker.number.float({ min: 5, max: 50 }),
					sd1neg: faker.number.float({ min: 4, max: 48 }),
					sd1pos: faker.number.float({ min: 6, max: 52 }),
					sd2neg: faker.number.float({ min: 3, max: 46 }),
					sd2pos: faker.number.float({ min: 7, max: 54 }),
					sd3neg: faker.number.float({ min: 2, max: 44 }),
					sd3pos: faker.number.float({ min: 8, max: 56 }),
					sd4neg: faker.number.float({ min: 1, max: 42 }),
					sd4pos: faker.number.float({ min: 9, max: 58 }),
					createdAt: new Date(),
					updatedAt: new Date()
				};

				await db.insert(whoGrowthStandard).values(standard).execute();
				standards.push(standard);
			}
		}
	}

	return standards;
};

// Create vaccine schedules
const createVaccineSchedules = async (db: AppDb) => {
	console.log("📋 Creating vaccine schedules...");
	const schedules = [];

	const vaccineData = [
		{
			name: "Hepatitis B",
			recommendedAge: "Birth",
			dosesRequired: 3,
			ageInDaysMin: 0,
			ageInDaysMax: 365
		},
		{
			name: "Rotavirus",
			recommendedAge: "2 months",
			dosesRequired: 3,
			ageInDaysMin: 60,
			ageInDaysMax: 240
		},
		{
			name: "Diphtheria",
			recommendedAge: "2 months",
			dosesRequired: 5,
			ageInDaysMin: 60,
			ageInDaysMax: 1825
		},
		{
			name: "Tetanus",
			recommendedAge: "2 months",
			dosesRequired: 5,
			ageInDaysMin: 60,
			ageInDaysMax: 1825
		},
		{
			name: "Pertussis",
			recommendedAge: "2 months",
			dosesRequired: 5,
			ageInDaysMin: 60,
			ageInDaysMax: 1825
		},
		{
			name: "Haemophilus influenzae",
			recommendedAge: "2 months",
			dosesRequired: 4,
			ageInDaysMin: 60,
			ageInDaysMax: 540
		},
		{
			name: "Pneumococcal",
			recommendedAge: "2 months",
			dosesRequired: 4,
			ageInDaysMin: 60,
			ageInDaysMax: 540
		},
		{
			name: "Polio",
			recommendedAge: "2 months",
			dosesRequired: 4,
			ageInDaysMin: 60,
			ageInDaysMax: 1825
		},
		{
			name: "Influenza",
			recommendedAge: "6 months",
			dosesRequired: 2,
			ageInDaysMin: 180,
			ageInDaysMax: 3650
		},
		{
			name: "Measles",
			recommendedAge: "12 months",
			dosesRequired: 2,
			ageInDaysMin: 365,
			ageInDaysMax: 1825
		}
	];

	for (const vaccine of vaccineData) {
		const schedule = {
			id: faker.string.uuid(),
			vaccineName: vaccine.name,
			recommendedAge: vaccine.recommendedAge,
			dosesRequired: vaccine.dosesRequired,
			minimumInterval: faker.number.int({ min: 30, max: 180 }),
			isMandatory: faker.datatype.boolean(0.8),
			ageInDaysMin: vaccine.ageInDaysMin,
			ageInDaysMax: vaccine.ageInDaysMax,
			description: faker.lorem.sentence(),
			createdAt: new Date(),
			updatedAt: new Date()
		};

		try {
			await db.insert(vaccineSchedule).values(schedule).execute();
			schedules.push(schedule);
		} catch (error) {
			// Ignore duplicate key errors for upsert-like behavior
			if (!(error instanceof Error && error.message.includes("UNIQUE constraint failed"))) {
				throw error;
			}
		}
	}

	return schedules;
};

// Create guardians
const createGuardians = async (db: AppDb, patients: DbPatient[], users: DatabaseUser[]) => {
	console.log("👨‍👩‍👧 Creating guardians...");
	const guardians = [];

	for (const patient of patients) {
		if (faker.datatype.boolean(0.7)) {
			const guardianUser = faker.helpers.arrayElement(
				users.filter(u => u.role !== "DOCTOR" && u.role !== "STAFF")
			);

			const newGuardian = {
				id: faker.string.uuid(),
				patientId: patient.id,
				userId: guardianUser.id,
				relation: faker.helpers.arrayElement(["Parent", "Guardian", "Spouse", "Sibling"]),
				isPrimary: true,
				phone: faker.phone.number(),
				email: guardianUser.email
			};

			await db.insert(guardian).values(newGuardian).execute();
			guardians.push(newGuardian);
		}
	}

	return guardians;
};

// Create sample files
const createSampleFiles = async (db: AppDb, users: DatabaseUser[]) => {
	console.log("📁 Creating sample files...");
	for (let i = 0; i < 10; i++) {
		const randomUser = faker.helpers.arrayElement(users);

		await db
			.insert(files)
			.values({
				id: faker.string.uuid(),
				slug: faker.string.alphanumeric(10),
				userId: randomUser.id,
				filename: faker.system.fileName(),
				searchText: faker.lorem.words(3),
				size: faker.number.int({ min: 1000, max: 1000000 }),
				mimeType: faker.system.mimeType(),
				folderId: null,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.execute();
	}
};

// Main seed function
export async function runSeed(db: AppDb) {
	try {
		console.log("🌱 Starting comprehensive seed process...");

		// Clear existing data
		await clearAllData(db);

		// Create basic entities
		const clinicsData = await createClinics(db);
		const users = await createUsers(db);
		await associateUsersWithClinics(db, users, clinicsData);

		const doctors = await createDoctors(db, users, clinicsData);
		const staffData = await createStaff(db, users, clinicsData);
		const patients = await createPatients(db, users, clinicsData);
		const services = await createServices(db, clinicsData);

		// Create appointments and related data
		const appointments = await createAppointments(db, patients, doctors, services);
		const medicalRecords = await createMedicalRecords(db, patients, appointments, services);

		// Create additional data
		const { drugs, prescriptions } = await createDrugsAndPrescriptions(db, medicalRecords, patients, doctors);
		const payments = await createPayments(db, appointments, patients, services);
		const immunizations = await createImmunizations(db, patients, staffData);
		const feedingLogs = await createFeedingLogs(db, patients);
		const developmentalChecks = await createDevelopmentalChecks(db, patients);
		await createRatings(db, doctors, patients);
		const whoStandards = await createWHOGrowthStandards(db);
		const vaccineSchedules = await createVaccineSchedules(db);
		const guardians = await createGuardians(db, patients, users);
		await createSampleFiles(db, users);

		console.log("\n🎉 Seed completed successfully!");
		console.log("📊 Summary of created data:");
		console.log(`🏥 Clinics: ${clinicsData.length}`);
		console.log(`👥 Users: ${users.length}`);
		console.log(`👨‍⚕️ Doctors: ${doctors.length}`);
		console.log(`👨‍💼 Staff: ${staffData.length}`);
		console.log(`👤 Patients: ${patients.length}`);
		console.log(`🩺 Services: ${services.length}`);
		console.log(`📅 Appointments: ${appointments.length}`);
		console.log(`📋 Medical Records: ${medicalRecords.length}`);
		console.log(`💊 Drugs: ${drugs.length}`);
		console.log(`💊 Prescriptions: ${prescriptions.length}`);
		console.log(`💰 Payments: ${payments.length}`);
		console.log(`💉 Immunizations: ${immunizations.length}`);
		console.log(`🍼 Feeding Logs: ${feedingLogs.length}`);
		console.log(`📊 Developmental Checks: ${developmentalChecks.length}`);
		console.log("⭐ Ratings: created for doctors");
		console.log(`📏 WHO Growth Standards: ${whoStandards.length}`);
		console.log(`📋 Vaccine Schedules: ${vaccineSchedules.length}`);
		console.log(`👨‍👩‍👧 Guardians: ${guardians.length}`);
	} catch (error) {
		console.error("❌ Error during seed:", error);
		throw error;
	}
}
