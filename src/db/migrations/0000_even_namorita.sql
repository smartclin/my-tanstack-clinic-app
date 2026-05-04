CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `appointment` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`doctor_id` text NOT NULL,
	`service_id` text,
	`doctor_specialty` text,
	`clinic_id` text NOT NULL,
	`appointment_date` integer NOT NULL,
	`time` text,
	`duration_minutes` integer,
	`appointment_price` integer,
	`status` text DEFAULT 'PENDING',
	`type` text NOT NULL,
	`note` text,
	`reason` text,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `appointments_clinic_date_status_idx` ON `appointment` (`clinic_id`,`appointment_date`,`status`);--> statement-breakpoint
CREATE INDEX `appointments_doctor_date_status_idx` ON `appointment` (`doctor_id`,`appointment_date`,`status`);--> statement-breakpoint
CREATE INDEX `appointments_patient_date_idx` ON `appointment` (`patient_id`,`appointment_date`);--> statement-breakpoint
CREATE INDEX `appointments_is_deleted_idx` ON `appointment` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `users_to_clinics` (
	`user_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`role` text,
	PRIMARY KEY(`user_id`, `clinic_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_to_clinics_user_id_unique` ON `users_to_clinics` (`user_id`);--> statement-breakpoint
CREATE TABLE `clinic_setting` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`opening_time` text NOT NULL,
	`closing_time` text NOT NULL,
	`working_days` text NOT NULL,
	`default_appointment_duration` integer DEFAULT 30,
	`require_emergency_contact` integer DEFAULT true,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clinic_setting_clinic_id_unique` ON `clinic_setting` (`clinic_id`);--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`address` text,
	`phone` text,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clinics_name_unique` ON `clinics` (`name`);--> statement-breakpoint
CREATE INDEX `clinics_is_deleted_idx` ON `clinics` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `config_store` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `developmental_check` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`check_date` integer NOT NULL,
	`age_months` integer NOT NULL,
	`motor_skills` text NOT NULL,
	`language_skills` text NOT NULL,
	`social_skills` text NOT NULL,
	`cognitive_skills` text NOT NULL,
	`milestones_met` text,
	`milestones_pending` text,
	`concerns` text,
	`recommendations` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `developmental_check_patient_date_idx` ON `developmental_check` (`patient_id`,`check_date`);--> statement-breakpoint
CREATE INDEX `developmental_check_age_months_idx` ON `developmental_check` (`age_months`);--> statement-breakpoint
CREATE TABLE `developmental_milestones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`patient_id` text NOT NULL,
	`milestone` text NOT NULL,
	`age_achieved` text NOT NULL,
	`date_recorded` integer NOT NULL,
	`notes` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `diagnosis` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`doctor_id` text NOT NULL,
	`clinic_id` text,
	`appointment_id` text,
	`medical_id` text NOT NULL,
	`date` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`type` text,
	`diagnosis` text,
	`treatment` text,
	`notes` text,
	`symptoms` text NOT NULL,
	`prescribed_medications` text,
	`follow_up_plan` text,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnosis_medical_id_unique` ON `diagnosis` (`medical_id`);--> statement-breakpoint
CREATE INDEX `diagnoses_clinic_date_idx` ON `diagnosis` (`clinic_id`,`date`);--> statement-breakpoint
CREATE INDEX `diagnoses_doctor_date_idx` ON `diagnosis` (`doctor_id`,`date`);--> statement-breakpoint
CREATE INDEX `diagnoses_patient_date_idx` ON `diagnosis` (`patient_id`,`date`);--> statement-breakpoint
CREATE INDEX `diagnoses_is_deleted_idx` ON `diagnosis` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `doctor` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`name` text NOT NULL,
	`user_id` text,
	`clinic_id` text,
	`specialty` text NOT NULL,
	`license_number` text,
	`phone` text,
	`address` text,
	`department` text,
	`img` text,
	`color_code` text,
	`availability_status` text,
	`available_from_week_day` integer,
	`available_to_week_day` integer,
	`is_active` integer,
	`status` text,
	`available_from_time` text,
	`available_to_time` text,
	`type` text DEFAULT 'FULL',
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`appointment_price` integer,
	`role` text,
	`rating` integer,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doctor_user_id_unique` ON `doctor` (`user_id`);--> statement-breakpoint
CREATE INDEX `doctors_clinic_id_is_active_idx` ON `doctor` (`clinic_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `doctors_specialty_clinic_id_idx` ON `doctor` (`specialty`,`clinic_id`);--> statement-breakpoint
CREATE INDEX `doctors_is_deleted_idx` ON `doctor` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `dose_guidelines` (
	`id` text PRIMARY KEY NOT NULL,
	`drug_id` text NOT NULL,
	`route` text NOT NULL,
	`clinical_indication` text NOT NULL,
	`min_dose_per_kg` real,
	`max_dose_per_kg` real,
	`dose_unit` text,
	`frequency_days` text,
	`gestational_age_weeks_min` real,
	`gestational_age_weeks_max` real,
	`post_natal_age_days_min` real,
	`post_natal_age_days_max` real,
	`max_dose_per_24h` real,
	`stock_concentration_mg_ml` real,
	`final_concentration_mg_ml` real,
	`min_infusion_time_min` integer,
	`compatibility_diluent` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `drugs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drugs_name_unique` ON `drugs` (`name`);--> statement-breakpoint
CREATE TABLE `feeding_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`date` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`type` text NOT NULL,
	`duration` integer,
	`amount` real,
	`breast` text,
	`notes` text
);
--> statement-breakpoint
CREATE INDEX `feeding_logs_patient_date_idx` ON `feeding_logs` (`patient_id`,`date`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`user_id` text NOT NULL,
	`folder_id` text,
	`filename` text NOT NULL,
	`search_text` text DEFAULT '' NOT NULL,
	`size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_slug_unique` ON `files` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_files_slug` ON `files` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_files_search_text` ON `files` (`search_text`);--> statement-breakpoint
CREATE INDEX `idx_files_folder_id` ON `files` (`folder_id`);--> statement-breakpoint
CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_folders_user_id` ON `folders` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_folders_parent_id` ON `folders` (`parent_id`);--> statement-breakpoint
CREATE TABLE `growth_record` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text,
	`patient_id` text NOT NULL,
	`gender` text,
	`age_days` integer,
	`age_months` integer,
	`head_circumference` integer,
	`bmi` integer,
	`weight_for_age_z` integer,
	`height_for_age_z` integer,
	`bmi_for_age_z` integer,
	`hc_for_age_z` integer,
	`weight` real,
	`height` real,
	`notes` text,
	`date` integer NOT NULL,
	`recorded_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `growth_records_patient_date_idx` ON `growth_record` (`patient_id`,`date`);--> statement-breakpoint
CREATE TABLE `guardians` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`user_id` text NOT NULL,
	`relation` text NOT NULL,
	`is_primary` integer DEFAULT false,
	`phone` text,
	`email` text
);
--> statement-breakpoint
CREATE INDEX `guardians_patient_id_idx` ON `guardians` (`patient_id`);--> statement-breakpoint
CREATE INDEX `guardians_user_id_idx` ON `guardians` (`user_id`);--> statement-breakpoint
CREATE TABLE `immunization` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text,
	`patient_id` text NOT NULL,
	`vaccine` text NOT NULL,
	`date` integer NOT NULL,
	`dose` text,
	`lot_number` text,
	`administered_by_staff_id` text,
	`notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false
);
--> statement-breakpoint
CREATE INDEX `immunizations_clinic_patient_vaccine_date_idx` ON `immunization` (`clinic_id`,`patient_id`,`vaccine`,`date`);--> statement-breakpoint
CREATE INDEX `immunizations_clinic_patient_date_idx` ON `immunization` (`clinic_id`,`patient_id`,`date`);--> statement-breakpoint
CREATE TABLE `invites` (
	`code` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer,
	`created_by` text,
	`used_by` text,
	`used_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`used_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `invites_used_by_idx` ON `invites` (`used_by`);--> statement-breakpoint
CREATE TABLE `lab_test` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text,
	`record_id` text NOT NULL,
	`service_id` text NOT NULL,
	`test_date` integer NOT NULL,
	`result` text NOT NULL,
	`status` text NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `lab_tests_service_id_idx` ON `lab_test` (`service_id`);--> statement-breakpoint
CREATE INDEX `lab_tests_record_id_idx` ON `lab_test` (`record_id`);--> statement-breakpoint
CREATE TABLE `medical_record` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`appointment_id` text NOT NULL,
	`doctor_id` text,
	`clinic_id` text NOT NULL,
	`diagnosis` text,
	`symptoms` text,
	`treatment_plan` text,
	`lab_request` text,
	`notes` text,
	`attachments` text,
	`diagnosis_date` integer,
	`status` text DEFAULT 'ACTIVE',
	`medications` text,
	`follow_up_date` integer,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `medical_records_patient_appointment_unique` ON `medical_record` (`patient_id`,`appointment_id`);--> statement-breakpoint
CREATE INDEX `medical_records_clinic_followup_idx` ON `medical_record` (`clinic_id`,`follow_up_date`);--> statement-breakpoint
CREATE INDEX `medical_records_patient_created_idx` ON `medical_record` (`patient_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `medical_records_doctor_idx` ON `medical_record` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `medical_records_is_deleted_idx` ON `medical_record` (`is_deleted`);--> statement-breakpoint
CREATE TABLE `patient` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text,
	`phone` text,
	`emergency_contact_number` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`date_of_birth` integer NOT NULL,
	`gender` text DEFAULT 'MALE',
	`marital_status` text,
	`nutritional_status` text,
	`address` text,
	`emergency_contact_name` text,
	`relation` text,
	`allergies` text,
	`medical_conditions` text,
	`medical_history` text,
	`image` text,
	`color_code` text,
	`role` text,
	`status` text DEFAULT 'ACTIVE',
	`is_active` integer DEFAULT true,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false,
	`created_by_id` text,
	`updated_by_id` text,
	`blood_group` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patient_user_id_unique` ON `patient` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `patient_email_unique` ON `patient` (`email`);--> statement-breakpoint
CREATE INDEX `patients_clinic_active_deleted_idx` ON `patient` (`clinic_id`,`is_active`,`is_deleted`,`created_at`);--> statement-breakpoint
CREATE INDEX `patients_date_of_birth_idx` ON `patient` (`date_of_birth`);--> statement-breakpoint
CREATE INDEX `patients_clinic_status_idx` ON `patient` (`clinic_id`,`status`);--> statement-breakpoint
CREATE INDEX `patients_name_idx` ON `patient` (`last_name`,`first_name`);--> statement-breakpoint
CREATE TABLE `patient_bill` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text,
	`bill_id` text NOT NULL,
	`service_id` text NOT NULL,
	`service_date` integer NOT NULL,
	`quantity` integer NOT NULL,
	`unit_cost` integer,
	`total_cost` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text,
	`bill_id` text,
	`patient_id` text,
	`appointment_id` text,
	`bill_date` integer NOT NULL,
	`payment_date` integer,
	`discount` integer,
	`total_amount` integer,
	`amount_paid` integer,
	`amount` integer,
	`status` text DEFAULT 'PAID',
	`insurance` text,
	`insurance_id` text,
	`service_date` integer,
	`due_date` integer,
	`paid_date` integer,
	`notes` text,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false,
	`payment_method` text DEFAULT 'CASH',
	`receipt_number` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_appointment_id_unique` ON `payment` (`appointment_id`);--> statement-breakpoint
CREATE INDEX `payments_is_deleted_idx` ON `payment` (`is_deleted`);--> statement-breakpoint
CREATE INDEX `payments_patient_status_idx` ON `payment` (`patient_id`,`status`);--> statement-breakpoint
CREATE INDEX `payments_status_due_date_idx` ON `payment` (`status`,`due_date`);--> statement-breakpoint
CREATE INDEX `payments_patient_payment_date_idx` ON `payment` (`patient_id`,`payment_date`);--> statement-breakpoint
CREATE TABLE `prescribed_items` (
	`id` text PRIMARY KEY NOT NULL,
	`prescription_id` text NOT NULL,
	`drug_id` text NOT NULL,
	`dosage_value` real NOT NULL,
	`dosage_unit` text NOT NULL,
	`frequency` text NOT NULL,
	`duration` text NOT NULL,
	`instructions` text,
	`drug_route` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`medical_record_id` text NOT NULL,
	`doctor_id` text,
	`patient_id` text NOT NULL,
	`encounter_id` text NOT NULL,
	`medication_name` text,
	`instructions` text,
	`issued_date` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`end_date` integer,
	`status` text DEFAULT 'active',
	`clinic_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `prescriptions_clinic_id_idx` ON `prescriptions` (`clinic_id`);--> statement-breakpoint
CREATE TABLE `rating` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`staff_id` text,
	`patient_id` text,
	`rating` integer NOT NULL,
	`comment` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminder` (
	`id` text PRIMARY KEY NOT NULL,
	`appointment_id` text NOT NULL,
	`method` text NOT NULL,
	`sent_at` integer NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reminder_appointment_id_unique` ON `reminder` (`appointment_id`);--> statement-breakpoint
CREATE TABLE `service` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text,
	`service_name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`category` text,
	`duration` integer,
	`is_available` integer DEFAULT true,
	`icon` text,
	`color` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`deleted_at` integer,
	`is_deleted` integer DEFAULT false
);
--> statement-breakpoint
CREATE INDEX `services_is_deleted_idx` ON `service` (`is_deleted`);--> statement-breakpoint
CREATE INDEX `services_service_name_idx` ON `service` (`service_name`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`name` text NOT NULL,
	`phone` text,
	`user_id` text,
	`clinic_id` text,
	`address` text NOT NULL,
	`department` text,
	`img` text,
	`license_number` text,
	`color_code` text,
	`hire_date` integer,
	`salary` real,
	`role` text NOT NULL,
	`status` text DEFAULT 'ACTIVE',
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`deleted_at` integer,
	`is_active` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_user_id_unique` ON `staff` (`user_id`);--> statement-breakpoint
CREATE INDEX `staffs_deleted_at_idx` ON `staff` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `two_factor` (
	`id` text PRIMARY KEY NOT NULL,
	`secret` text NOT NULL,
	`backup_codes` text NOT NULL,
	`user_id` text NOT NULL,
	`verified` integer DEFAULT true,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `twoFactor_secret_idx` ON `two_factor` (`secret`);--> statement-breakpoint
CREATE INDEX `twoFactor_userId_idx` ON `two_factor` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`role` text,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer,
	`two_factor_enabled` integer DEFAULT false,
	`api_key` text,
	`clinic_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_quota` (
	`user_id` text PRIMARY KEY NOT NULL,
	`quota` integer DEFAULT 0 NOT NULL,
	`used_quota` integer DEFAULT 0 NOT NULL,
	`file_count` integer DEFAULT 0 NOT NULL,
	`file_count_quota` integer DEFAULT 0 NOT NULL,
	`invite_count` integer DEFAULT 0 NOT NULL,
	`invite_quota` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `vaccine_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`vaccine_name` text NOT NULL,
	`recommended_age` text NOT NULL,
	`doses_required` integer NOT NULL,
	`minimum_interval` integer,
	`is_mandatory` integer DEFAULT true,
	`description` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`age_in_days_min` integer,
	`age_in_days_max` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vaccine_schedule_name_age_unique` ON `vaccine_schedule` (`vaccine_name`,`recommended_age`);--> statement-breakpoint
CREATE INDEX `vaccine_schedule_age_range_idx` ON `vaccine_schedule` (`age_in_days_min`,`age_in_days_max`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `vital_sign` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text,
	`patient_id` text NOT NULL,
	`medical_id` text NOT NULL,
	`encounter_id` text,
	`growth_record_id` text,
	`recorded_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`body_temperature` real,
	`systolic` integer,
	`diastolic` integer,
	`heart_rate` integer,
	`respiratory_rate` integer,
	`oxygen_saturation` integer,
	`gender` text,
	`notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`age_days` integer,
	`age_months` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vital_sign_medical_id_unique` ON `vital_sign` (`medical_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `vital_sign_encounter_id_unique` ON `vital_sign` (`encounter_id`);--> statement-breakpoint
CREATE INDEX `vital_signs_clinic_recorded_idx` ON `vital_sign` (`clinic_id`,`recorded_at`);--> statement-breakpoint
CREATE INDEX `vital_signs_patient_recorded_idx` ON `vital_sign` (`patient_id`,`recorded_at`);--> statement-breakpoint
CREATE INDEX `vital_signs_encounter_idx` ON `vital_sign` (`encounter_id`);--> statement-breakpoint
CREATE TABLE `who_growth_standards` (
	`id` text PRIMARY KEY NOT NULL,
	`age_in_months` integer,
	`age_days` integer NOT NULL,
	`gender` text NOT NULL,
	`measurement_type` text NOT NULL,
	`l_value` real NOT NULL,
	`m_value` real NOT NULL,
	`s_value` real NOT NULL,
	`sd0` real NOT NULL,
	`sd1neg` real NOT NULL,
	`sd1pos` real NOT NULL,
	`sd2neg` real NOT NULL,
	`sd2pos` real NOT NULL,
	`sd3neg` real NOT NULL,
	`sd3pos` real NOT NULL,
	`sd4neg` real,
	`sd4pos` real,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `working_day` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`day` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `working_days_doctor_id_day_unique` ON `working_day` (`doctor_id`,`day`);--> statement-breakpoint
CREATE VIEW `appointment_schedule_mv` AS select "appointment"."id", "appointment"."appointment_date", "appointment"."time", "appointment"."status", "appointment"."type", "appointment"."reason", "appointment"."duration_minutes", "patient"."id", "patient"."first_name" || ' ' || "patient"."last_name" as "patientName", (strftime('%Y', 'now') - strftime('%Y', datetime("patient"."date_of_birth"/1000, 'unixepoch'))) * 12 + (strftime('%m', 'now') - strftime('%m', datetime("patient"."date_of_birth"/1000, 'unixepoch'))) as "patientAgeMonths", "patient"."gender", "patient"."phone", "doctor"."id", "doctor"."name", "doctor"."specialty", "doctor"."color_code", "service"."id", "service"."service_name", "service"."category", "service"."price", "payment"."status", "payment"."total_amount", "payment"."amount_paid", "appointment"."clinic_id", ("patient"."first_name" || ' ' || "patient"."last_name" || ' ' || "doctor"."name" || ' ' || COALESCE("appointment"."reason", '') || ' ' || COALESCE("service"."service_name", '') || ' ' || CAST("appointment"."status" AS TEXT)) as "searchVector", (unixepoch() * 1000) as "updatedAt" from "appointment" inner join "patient" on "patient"."id" = "appointment"."patient_id" inner join "doctor" on "doctor"."id" = "appointment"."doctor_id" left join "diagnosis" on "diagnosis"."id" = "appointment"."id" left join "service" on "service"."id" = "appointment"."service_id" left join "payment" on "payment"."appointment_id" = "appointment"."id";--> statement-breakpoint
CREATE VIEW `clinic_dashboard_mv` AS select "clinics"."id", "clinics"."name", (
    SELECT COUNT(*) FROM "appointment" WHERE "appointment"."clinic_id" = "clinics"."id"
  ) as "totalAppointments", (
    SELECT COUNT(*) FROM "appointment"
    WHERE date("appointment"."appointment_date"/1000, 'unixepoch') = date('now') AND "appointment"."clinic_id" = "clinics"."id"
  ) as "todayAppointments", (
    SELECT COUNT(*) FROM "appointment"
    WHERE date("appointment"."appointment_date"/1000, 'unixepoch') > date('now') AND "appointment"."status" IN ('SCHEDULED', 'PENDING') AND "appointment"."clinic_id" = "clinics"."id"
  ) as "upcomingAppointments", (
    SELECT COUNT(*) FROM "appointment"
    WHERE "appointment"."status" = 'COMPLETED' AND "appointment"."clinic_id" = "clinics"."id"
  ) as "completedAppointments", (
    SELECT COUNT(*) FROM "patient" WHERE "patient"."clinic_id" = "clinics"."id"
  ) as "totalPatients", (
    SELECT COUNT(*) FROM "patient"
    WHERE "patient"."is_active" = true AND "patient"."clinic_id" = "clinics"."id"
  ) as "activePatients", (
    SELECT COUNT(*) FROM "patient"
    WHERE date("patient"."created_at"/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') AND "patient"."clinic_id" = "clinics"."id"
  ) as "newPatientsThisMonth", (
        SELECT 0
      ) as "avgWaitingTime", (
    SELECT COALESCE(SUM("payment"."total_amount"), 0) FROM "payment"
    WHERE date("payment"."payment_date"/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') AND "payment"."clinic_id" = "clinics"."id"
  ) as "monthlyRevenue", (
    SELECT COALESCE(SUM("payment"."total_amount"), 0) FROM "payment"
    WHERE "payment"."clinic_id" = "clinics"."id"
  ) as "totalRevenue", (SELECT COUNT(*) FROM "doctor" WHERE "doctor"."clinic_id" = "clinics"."id" AND "doctor"."is_active" = true AND "doctor"."status" = 'ACTIVE') as "activeDoctors", (SELECT AVG("doctor"."rating") FROM "doctor" WHERE "doctor"."clinic_id" = "clinics"."id") as "averageDoctorRating", (SELECT COUNT(*) FROM "immunization" WHERE "immunization"."clinic_id" = "clinics"."id" AND "immunization"."date" <= unixepoch('now', '+7 days') * 1000) as "immunizationsDue", (SELECT COUNT(*) FROM "vital_sign" WHERE "vital_sign"."clinic_id" = "clinics"."id" AND "vital_sign"."recorded_at" < unixepoch('now', '-3 months') * 1000) as "growthChecksPending", (SELECT COUNT(*) FROM "staff" WHERE "staff"."clinic_id" = "clinics"."id") as "totalStaff", (unixepoch() * 1000) as "updatedAt" from "clinics" left join "patient" on "patient"."clinic_id" = "clinics"."id" left join "appointment" on "appointment"."clinic_id" = "clinics"."id" left join "doctor" on "doctor"."clinic_id" = "clinics"."id" left join "payment" on "payment"."clinic_id" = "clinics"."id" left join "immunization" on "immunization"."clinic_id" = "clinics"."id" left join "vital_sign" on "vital_sign"."clinic_id" = "clinics"."id" left join "staff" on "staff"."clinic_id" = "clinics"."id" group by "clinics"."id", "clinics"."name";--> statement-breakpoint
CREATE VIEW `doctor_performance_mv` AS select "doctor"."id", "doctor"."name", "doctor"."specialty", "doctor"."email", "doctor"."phone", "doctor"."rating", COUNT(DISTINCT "appointment"."id") as "totalAppointments", COUNT(DISTINCT CASE WHEN date("appointment"."appointment_date"/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') THEN "appointment"."id" END) as "appointmentsThisMonth", COUNT(DISTINCT CASE WHEN "appointment"."status" = 'COMPLETED' THEN "appointment"."id" END) as "completedAppointments", (COUNT(DISTINCT CASE WHEN "appointment"."status" = 'CANCELLED' THEN "appointment"."id" END) * 100.0 / NULLIF(COUNT(DISTINCT "appointment"."id"), 0)) as "cancellationRate", COUNT(DISTINCT "patient"."id") as "totalPatients", COUNT(DISTINCT CASE WHEN date("patient"."created_at"/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') THEN "patient"."id" END) as "newPatientsThisMonth", COALESCE(SUM("payment"."total_amount"), 0) as "totalRevenue", COALESCE(SUM(CASE WHEN date("payment"."payment_date"/1000, 'unixepoch') >= strftime('%Y-%m-01', 'now') THEN "payment"."total_amount" ELSE 0 END), 0) as "monthlyRevenue", COUNT(DISTINCT "prescriptions"."id") as "totalPrescriptions", COUNT(DISTINCT CASE WHEN "prescriptions"."status" = 'active' THEN "prescriptions"."id" END) as "activePrescriptions", COALESCE(AVG("rating"."rating"), 0) as "averagePatientRating", COUNT(DISTINCT "rating"."id") as "totalRatings", COALESCE(COUNT(DISTINCT "appointment"."id") / NULLIF(COUNT(DISTINCT date("appointment"."appointment_date"/1000, 'unixepoch')), 0), 0) as "averagePatientsPerDay", "doctor"."clinic_id", (unixepoch() * 1000) as "updatedAt" from "doctor" left join "appointment" on "appointment"."doctor_id" = "doctor"."id" left join "patient" on "patient"."id" = "appointment"."patient_id" left join "payment" on "payment"."appointment_id" = "appointment"."id" left join "prescriptions" on "prescriptions"."doctor_id" = "doctor"."id" left join "rating" on "rating"."staff_id" = "doctor"."id" group by "doctor"."id", "doctor"."name", "doctor"."specialty", "doctor"."email", "doctor"."phone", "doctor"."rating", "doctor"."clinic_id";--> statement-breakpoint
CREATE VIEW `financial_overview_mv` AS select "clinics"."id", "clinics"."name", COALESCE(SUM(CASE WHEN strftime('%Y-%m-01', datetime("payment"."payment_date"/1000, 'unixepoch')) = strftime('%Y-%m-01', 'now') THEN "payment"."total_amount" ELSE 0 END), 0) as "currentMonthRevenue", COALESCE(SUM(CASE WHEN strftime('%Y-%m-01', datetime("payment"."payment_date"/1000, 'unixepoch')) = strftime('%Y-%m-01', 'now', '-1 month') THEN "payment"."total_amount" ELSE 0 END), 0) as "previousMonthRevenue", COALESCE(SUM(CASE WHEN "service"."category" = 'CONSULTATION' THEN "payment"."total_amount" ELSE 0 END), 0) as "consultationRevenue", COALESCE(SUM(CASE WHEN "service"."category" = 'PROCEDURE' THEN "payment"."total_amount" ELSE 0 END), 0) as "procedureRevenue", COALESCE(SUM(CASE WHEN "service"."category" = 'LAB_TEST' THEN "payment"."total_amount" ELSE 0 END), 0) as "labRevenue", COALESCE(SUM(CASE WHEN "service"."category" = 'VACCINATION' THEN "payment"."total_amount" ELSE 0 END), 0) as "vaccinationRevenue", COALESCE(SUM("payment"."total_amount"), 0) as "totalRevenue", COALESCE(SUM(CASE WHEN "payment"."status" = 'PAID' THEN "payment"."total_amount" ELSE 0 END), 0) as "paidAmount", (SELECT "service"."service_name" FROM "service" LEFT JOIN "payment" ON "payment"."bill_id" = "service"."id" WHERE "service"."clinic_id" = "clinics"."id" GROUP BY "service"."id", "service"."service_name" ORDER BY SUM("payment"."total_amount") DESC LIMIT 1) as "topService", (SELECT "doctor"."name" FROM "doctor" LEFT JOIN "appointment" ON "appointment"."doctor_id" = "doctor"."id" LEFT JOIN "payment" ON "payment"."appointment_id" = "appointment"."id" WHERE "doctor"."clinic_id" = "clinics"."id" GROUP BY "doctor"."id", "doctor"."name" ORDER BY SUM("payment"."total_amount") DESC LIMIT 1) as "topDoctor", (unixepoch() * 1000) as "updatedAt" from "clinics" left join "payment" on "payment"."clinic_id" = "clinics"."id" group by "clinics"."id", "clinics"."name";--> statement-breakpoint
CREATE VIEW `immunization_schedule_mv` AS select "patient"."id", "patient"."first_name" || ' ' || "patient"."last_name" as "fullName", "patient"."date_of_birth", (strftime('%Y', 'now') - strftime('%Y', datetime("patient"."date_of_birth"/1000, 'unixepoch'))) * 12 + (strftime('%m', 'now') - strftime('%m', datetime("patient"."date_of_birth"/1000, 'unixepoch'))) as "ageMonths", "immunization"."id", "immunization"."vaccine", "immunization"."dose", "immunization"."date", "vaccine_schedule"."is_mandatory", "vaccine_schedule"."description", "immunization"."notes", "patient"."clinic_id", (unixepoch() * 1000) as "updatedAt" from "patient" inner join "immunization" on "immunization"."patient_id" = "patient"."id" left join "vaccine_schedule" on "vaccine_schedule"."vaccine_name" = "immunization"."vaccine" AND "vaccine_schedule"."age_in_days_min" <= (unixepoch('now') - "patient"."date_of_birth"/1000) / 86400;--> statement-breakpoint
CREATE VIEW `medical_records_mv` AS select "medical_record"."id", "patient"."id", "patient"."first_name" || ' ' || "patient"."last_name" as "patientName", "doctor"."id", "doctor"."name", "doctor"."specialty", "diagnosis"."id", "diagnosis"."date", "diagnosis"."type", "diagnosis"."diagnosis", "diagnosis"."treatment", "appointment"."id", "appointment"."appointment_date", "appointment"."reason", "medical_record"."symptoms", "medical_record"."follow_up_date", (SELECT COUNT(*) FROM "prescriptions" WHERE "prescriptions"."encounter_id" = "diagnosis"."id") as "prescriptionCount", (SELECT COUNT(*) FROM "lab_test" WHERE "lab_test"."record_id" = "medical_record"."id") as "labTestCount", "medical_record"."clinic_id", ("patient"."first_name" || ' ' || "patient"."last_name" || ' ' || "doctor"."name" || ' ' || COALESCE("medical_record"."diagnosis", '') || ' ' || COALESCE("medical_record"."symptoms", '')) as "searchVector", (unixepoch() * 1000) as "updatedAt" from "medical_record" inner join "patient" on "patient"."id" = "medical_record"."patient_id" inner join "doctor" on "doctor"."id" = "medical_record"."doctor_id" left join "diagnosis" on "diagnosis"."medical_id" = "medical_record"."id" left join "appointment" on "appointment"."id" = "medical_record"."appointment_id" left join "vital_sign" on "vital_sign"."encounter_id" = "diagnosis"."id";--> statement-breakpoint
CREATE VIEW `patient_growth_chart_mv` AS select "patient"."id", "patient"."first_name" || ' ' || "patient"."last_name" as "fullName", "patient"."gender", "patient"."date_of_birth", "growth_record"."age_days", "growth_record"."age_months", "growth_record"."recorded_at", "growth_record"."weight", "growth_record"."height", "growth_record"."head_circumference", "growth_record"."bmi", "growth_record"."weight_for_age_z", "growth_record"."height_for_age_z", "growth_record"."hc_for_age_z", CASE
        WHEN "growth_record"."weight_for_age_z" < -3 THEN 'Severely Underweight'
        WHEN "growth_record"."weight_for_age_z" < -2 THEN 'Underweight'
        WHEN "growth_record"."weight_for_age_z" <= 1 THEN 'Normal'
        WHEN "growth_record"."weight_for_age_z" <= 2 THEN 'Overweight'
        ELSE 'Obese'
      END as "weightPercentile", CASE
        WHEN "growth_record"."height_for_age_z" < -3 THEN 'Severely Stunted'
        WHEN "growth_record"."height_for_age_z" < -2 THEN 'Stunted'
        WHEN "growth_record"."height_for_age_z" <= 1 THEN 'Normal'
        WHEN "growth_record"."height_for_age_z" <= 2 THEN 'Tall'
        ELSE 'Very Tall'
      END as "heightPercentile", "growth_record"."notes", "patient"."clinic_id", (unixepoch() * 1000) as "updatedAt" from "patient" inner join "growth_record" on "growth_record"."patient_id" = "patient"."id" order by "growth_record"."age_days";--> statement-breakpoint
CREATE VIEW `patient_overview_mv` AS select "patient"."id", "patient"."first_name" || ' ' || "patient"."last_name" as "fullName", "patient"."date_of_birth", (strftime('%Y', 'now') - strftime('%Y', datetime("patient"."date_of_birth"/1000, 'unixepoch'))) * 12 + (strftime('%m', 'now') - strftime('%m', datetime("patient"."date_of_birth"/1000, 'unixepoch'))) as "ageMonths", "patient"."gender", "patient"."blood_group", "patient"."phone", "patient"."email", "patient"."address", "patient"."allergies", "patient"."medical_conditions", COUNT(DISTINCT "appointment"."id") as "totalAppointments", MAX("appointment"."appointment_date") as "lastAppointmentDate", COUNT(DISTINCT CASE WHEN "appointment"."appointment_date" > (unixepoch() * 1000) AND "appointment"."status" IN ('SCHEDULED', 'PENDING') THEN "appointment"."id" END) as "upcomingAppointments", COUNT(DISTINCT "diagnosis"."id") as "totalEncounters", COUNT(DISTINCT "prescriptions"."id") as "totalPrescriptions", COUNT(DISTINCT CASE WHEN "prescriptions"."status" = 'active' AND ("prescriptions"."end_date" IS NULL OR "prescriptions"."end_date" > (unixepoch() * 1000)) THEN "prescriptions"."id" END) as "activePrescriptions", COUNT(DISTINCT "immunization"."id") as "totalImmunizations", (SELECT "growth_record"."weight" FROM "growth_record" WHERE "growth_record"."patient_id" = "patient"."id" ORDER BY "growth_record"."recorded_at" DESC LIMIT 1) as "lastWeight", (SELECT "growth_record"."height" FROM "growth_record" WHERE "growth_record"."patient_id" = "patient"."id" ORDER BY "growth_record"."recorded_at" DESC LIMIT 1) as "lastHeight", (SELECT "growth_record"."recorded_at" FROM "growth_record" WHERE "growth_record"."patient_id" = "patient"."id" ORDER BY "growth_record"."recorded_at" DESC LIMIT 1) as "lastGrowthCheck", (SELECT "guardians"."phone" FROM "guardians" WHERE "guardians"."patient_id" = "patient"."id" AND "guardians"."is_primary" = true LIMIT 1) as "guardianPhone", "patient"."clinic_id", (unixepoch() * 1000) as "updatedAt" from "patient" left join "appointment" on "appointment"."patient_id" = "patient"."id" left join "diagnosis" on "diagnosis"."patient_id" = "patient"."id" left join "prescriptions" on "prescriptions"."patient_id" = "patient"."id" left join "immunization" on "immunization"."patient_id" = "patient"."id" left join "vital_sign" on "vital_sign"."patient_id" = "patient"."id" left join "guardians" on "guardians"."patient_id" = "patient"."id" group by "patient"."id", "patient"."first_name", "patient"."last_name", "patient"."date_of_birth", "patient"."gender", "patient"."blood_group", "patient"."phone", "patient"."email", "patient"."address", "patient"."allergies", "patient"."medical_conditions", "patient"."clinic_id";