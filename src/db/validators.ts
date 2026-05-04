import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import type z from "zod";

import {
	account,
	appointment,
	clinicMembers,
	clinicSetting,
	clinics,
	developmentalChecks,
	diagnosis,
	doctor,
	doseGuideline,
	drug,
	feedingLog,
	growthRecord,
	immunization,
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
	staff,
	vaccineSchedule,
	vitalSign,
	workingDays
} from "./schema";

export const doctorCreateSchema = createInsertSchema(doctor);
export const doctorUpdateSchema = createUpdateSchema(doctor);
export const doctorSelectSchema = createSelectSchema(doctor);
export type DoctorCreate = z.infer<typeof doctorCreateSchema>;
export type DoctorUpdate = z.infer<typeof doctorUpdateSchema>;
export type DoctorSelect = z.infer<typeof doctorSelectSchema>;
export type DoctorValues = z.infer<typeof doctorCreateSchema>;

export const PatientCreateSchema = createInsertSchema(patient);
export const PatientUpdateSchema = createUpdateSchema(patient);
export const PatientSelectSchema = createSelectSchema(patient);
export type PatientCreate = z.infer<typeof PatientCreateSchema>;
export type PatientUpdate = z.infer<typeof PatientUpdateSchema>;
export type PatientSelect = z.infer<typeof PatientSelectSchema>;
export type PatientValues = z.infer<typeof PatientCreateSchema>;

export const InsertaccountSchema = createInsertSchema(account);
export const UpdateaccountSchema = createUpdateSchema(account);
export const SelectaccountSchema = createSelectSchema(account);

export const ClinicCreateSchema = createInsertSchema(clinics);
export const ClinicUpdateSchema = createUpdateSchema(clinics);
export const ClinicSelectSchema = createSelectSchema(clinics);

export const StaffCreateSchema = createInsertSchema(staff);
export const StaffUpdateSchema = createUpdateSchema(staff);
export const StaffSelectSchema = createSelectSchema(staff);

export const AppointmentCreateSchema = createInsertSchema(appointment);
export const AppointmentUpdateSchema = createUpdateSchema(appointment);
export const AppointmentSelectSchema = createSelectSchema(appointment);

export const MedicalRecordCreateSchema = createInsertSchema(medicalRecord);
export const MedicalRecordUpdateSchema = createUpdateSchema(medicalRecord);
export const MedicalRecordSelectSchema = createSelectSchema(medicalRecord);

export const DiagnosisCreateSchema = createInsertSchema(diagnosis);
export const DiagnosisUpdateSchema = createUpdateSchema(diagnosis);
export const DiagnosisSelectSchema = createSelectSchema(diagnosis);

export const PrescriptionCreateSchema = createInsertSchema(prescription);
export const PrescriptionUpdateSchema = createUpdateSchema(prescription);
export const PrescriptionSelectSchema = createSelectSchema(prescription);

export const ImmunizationCreateSchema = createInsertSchema(immunization);
export const ImmunizationUpdateSchema = createUpdateSchema(immunization);
export const ImmunizationSelectSchema = createSelectSchema(immunization);

export const GrowthRecordCreateSchema = createInsertSchema(growthRecord);
export const GrowthRecordUpdateSchema = createUpdateSchema(growthRecord);
export const GrowthRecordSelectSchema = createSelectSchema(growthRecord);

export const FeedingLogCreateSchema = createInsertSchema(feedingLog);
export const FeedingLogUpdateSchema = createUpdateSchema(feedingLog);
export const FeedingLogSelectSchema = createSelectSchema(feedingLog);

export const ServiceCreateSchema = createInsertSchema(service);
export const ServiceUpdateSchema = createUpdateSchema(service);
export const ServiceSelectSchema = createSelectSchema(service);

export const PaymentCreateSchema = createInsertSchema(payment);
export const PaymentUpdateSchema = createUpdateSchema(payment);
export const PaymentSelectSchema = createSelectSchema(payment);

export type ClinicValues = z.infer<typeof ClinicCreateSchema>;
export type StaffValues = z.infer<typeof StaffCreateSchema>;
export type AppointmentValues = z.infer<typeof AppointmentCreateSchema>;
export type MedicalRecordValues = z.infer<typeof MedicalRecordCreateSchema>;
export type PrescriptionValues = z.infer<typeof PrescriptionCreateSchema>;
export type ServiceValues = z.infer<typeof ServiceCreateSchema>;
export type PaymentValues = z.infer<typeof PaymentCreateSchema>;
export type AccountCreate = z.infer<typeof InsertaccountSchema>;
export type AccountUpdate = z.infer<typeof UpdateaccountSchema>;
export type AccountSelect = z.infer<typeof SelectaccountSchema>;
export type AccountValues = z.infer<typeof InsertaccountSchema>;

export const doctorStatusEnum = ["ACTIVE", "INACTIVE"] as const;
export type DoctorStatus = (typeof doctorStatusEnum)[number];

export const patientStatusEnum = ["ACTIVE", "INACTIVE"] as const;
export type PatientStatus = (typeof patientStatusEnum)[number];

export const AppointmentsCreateSchema = createInsertSchema(appointment);
export const ClinicSettingsCreateSchema = createInsertSchema(clinicSetting);
export const ClinicsCreateSchema = createInsertSchema(clinics);
export const DevelopmentalChecksCreateSchema = createInsertSchema(developmentalChecks);
export const DoctorsCreateSchema = createInsertSchema(doctor);
export const DoseGuidelinesCreateSchema = createInsertSchema(doseGuideline);
export const DrugsCreateSchema = createInsertSchema(drug);
export const FeedingLogsCreateSchema = createInsertSchema(feedingLog);
export const ImmunizationsCreateSchema = createInsertSchema(immunization);
export const LabTestsCreateSchema = createInsertSchema(labTest);
export const MedicalRecordsCreateSchema = createInsertSchema(medicalRecord);
export const PatientBillsCreateSchema = createInsertSchema(patientBill);
export const PatientsCreateSchema = createInsertSchema(patient);
export const PaymentsCreateSchema = createInsertSchema(payment);
export const PrescribedItemsCreateSchema = createInsertSchema(prescribedItem);
export const PrescriptionsCreateSchema = createInsertSchema(prescription);
export const RatingsCreateSchema = createInsertSchema(rating);
export const RemindersCreateSchema = createInsertSchema(reminder);
export const ServicesCreateSchema = createInsertSchema(service);
export const UsersToClinicsCreateSchema = createInsertSchema(clinicMembers);
export const VaccineSchedulesCreateSchema = createInsertSchema(vaccineSchedule);
export const VitalSignsCreateSchema = createInsertSchema(vitalSign);
export const WorkingDaysCreateSchema = createInsertSchema(workingDays);

export const AppointmentsUpdateSchema = createUpdateSchema(appointment);
export const ClinicSettingsUpdateSchema = createUpdateSchema(clinicSetting);
export const ClinicsUpdateSchema = createUpdateSchema(clinics);
export const DevelopmentalChecksUpdateSchema = createUpdateSchema(developmentalChecks);
export const DoctorsUpdateSchema = createUpdateSchema(doctor);
export const DoseGuidelinesUpdateSchema = createUpdateSchema(doseGuideline);
export const DrugsUpdateSchema = createUpdateSchema(drug);
export const FeedingLogsUpdateSchema = createUpdateSchema(feedingLog);
export const ImmunizationsUpdateSchema = createUpdateSchema(immunization);
export const LabTestsUpdateSchema = createUpdateSchema(labTest);
export const MedicalRecordsUpdateSchema = createUpdateSchema(medicalRecord);
export const PatientBillsUpdateSchema = createUpdateSchema(patientBill);
export const PatientsUpdateSchema = createUpdateSchema(patient);
export const PaymentsUpdateSchema = createUpdateSchema(payment);
export const PrescribedItemsUpdateSchema = createUpdateSchema(prescribedItem);
export const PrescriptionsUpdateSchema = createUpdateSchema(prescription);
export const RatingsUpdateSchema = createUpdateSchema(rating);
export const RemindersUpdateSchema = createUpdateSchema(reminder);
export const ServicesUpdateSchema = createUpdateSchema(service);
export const UsersToClinicsUpdateSchema = createUpdateSchema(clinicMembers);
export const VaccineSchedulesUpdateSchema = createUpdateSchema(vaccineSchedule);
export const VitalSignsUpdateSchema = createUpdateSchema(vitalSign);
export const WorkingDaysUpdateSchema = createUpdateSchema(workingDays);

export const AppointmentsSchema = createSelectSchema(appointment);
export const ClinicSettingsSchema = createSelectSchema(clinicSetting);
export const ClinicsSchema = createSelectSchema(clinics);
export const DevelopmentalChecksSchema = createSelectSchema(developmentalChecks);
export const DoctorsSchema = createSelectSchema(doctor);
export const DoseGuidelinesSchema = createSelectSchema(doseGuideline);
export const DrugsSchema = createSelectSchema(drug);
export const EncountersSchema = createSelectSchema(diagnosis);
export const FeedingLogsSchema = createSelectSchema(feedingLog);
export const ImmunizationsSchema = createSelectSchema(immunization);
export const LabTestsSchema = createSelectSchema(labTest);
export const MedicalRecordsSchema = createSelectSchema(medicalRecord);
export const PatientBillsSchema = createSelectSchema(patientBill);
export const PatientsSchema = createSelectSchema(patient);
export const PaymentsSchema = createSelectSchema(payment);
export const PrescribedItemsSchema = createSelectSchema(prescribedItem);
export const PrescriptionsSchema = createSelectSchema(prescription);
export const RatingsSchema = createSelectSchema(rating);
export const RemindersSchema = createSelectSchema(reminder);
export const ServicesSchema = createSelectSchema(service);
export const StaffSchema = createSelectSchema(staff);
export const UsersToClinicsSchema = createSelectSchema(clinicMembers);
export const VaccineSchedulesSchema = createSelectSchema(vaccineSchedule);
export const VitalSignsSchema = createSelectSchema(vitalSign);
export const WorkingDaysSchema = createSelectSchema(workingDays);

export type Appointment = z.infer<typeof AppointmentsSchema>;
export type ClinicSetting = z.infer<typeof ClinicSettingsSchema>;
export type Clinic = z.infer<typeof clinics>;
export type DevelopmentalCheck = z.infer<typeof DevelopmentalChecksSchema>;
export type Doctor = z.infer<typeof DoctorsSchema>;
export type DoseGuideline = z.infer<typeof DoseGuidelinesSchema>;
export type Drug = z.infer<typeof DrugsSchema>;
export type Encounter = z.infer<typeof EncountersSchema>;
export type FeedingLog = z.infer<typeof FeedingLogsSchema>;
export type Immunization = z.infer<typeof ImmunizationsSchema>;
export type LabTest = z.infer<typeof LabTestsSchema>;
export type MedicalRecord = z.infer<typeof MedicalRecordsSchema>;
export type PatientBill = z.infer<typeof PatientBillsSchema>;
export type Patient = z.infer<typeof PatientsSchema>;
export type Payment = z.infer<typeof PaymentsSchema>;
export type PrescribedItem = z.infer<typeof PrescribedItemsSchema>;
export type Prescription = z.infer<typeof PrescriptionsSchema>;
export type Rating = z.infer<typeof RatingsSchema>;
export type Reminder = z.infer<typeof RemindersSchema>;
export type Service = z.infer<typeof ServicesSchema>;
export type Staf = z.infer<typeof staff>;
export type UsersToClinic = z.infer<typeof UsersToClinicsSchema>;
export type VaccineSchedule = z.infer<typeof VaccineSchedulesSchema>;
export type VitalSign = z.infer<typeof VitalSignsSchema>;
export type WorkingDay = z.infer<typeof WorkingDaysSchema>;
