import fs from "node:fs/promises";

import { getRequestHeaders } from "@tanstack/react-start/server";
import { APIError, type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { admin as betterAuthAdmin, customSession, openAPI, twoFactor } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { count, eq } from "drizzle-orm";
import { isProduction } from "std-env";

import { db } from "@/db";
import * as schema from "@/db/schema";

import { ac, admin, doctor, patient, superadmin, user } from "./permissions";
import { getSettings } from "./settings";

const options = {
	appName: process.env.APP_NAME || "SMart Clinic",
	secret: process.env.AUTH_SECRET,
	baseURL: process.env.AUTH_BASE_URL,
	trustedOrigins: process.env.AUTH_BASE_URL ? [process.env.AUTH_BASE_URL] : undefined,
	experimental: { joins: true },
	advanced: {
		cookiePrefix: "__bauth",
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "true-client-ip"]
		},
		defaultCookieAttributes: {
			httpOnly: true,
			sameSite: isProduction ? "strict" : "none",
			secure: true
		}
	},
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema
	}),
	emailAndPassword: { enabled: true },
	databaseHooks: {
		user: {
			create: {
				before: async (user, ctx) => {
					const [settings, result] = await Promise.all([
						getSettings(),
						db.select().from(schema.configStore).where(eq(schema.configStore.key, "admin_onboarded")).get()
					]);
					const isOnboarded = result?.value === "true";

					if (settings.requireInvite) {
						const invite = ctx?.body?.invite as string | undefined;
						if (!invite) {
							throw new APIError("BAD_REQUEST", {
								message: "Invite code is required for registration."
							});
						}
						const inviteRecord = db
							.select()
							.from(schema.invites)
							.where(eq(schema.invites.code, invite))
							.get();
						if (
							!inviteRecord ||
							(inviteRecord.expiresAt && inviteRecord.expiresAt < new Date()) ||
							inviteRecord.usedBy !== null
						) {
							throw new APIError("BAD_REQUEST", {
								message: "Invite code is invalid or has expired."
							});
						}
					}

					return {
						data: { ...user, role: isOnboarded ? "user" : "superadmin" }
					};
				},
				after: async (user, ctx) => {
					try {
						let clinicId: string;

						// Check if user already has a clinic relationship
						const hasClinic = await db.query.clinicMembers.findFirst({
							where: eq(schema.clinicMembers.userId, user.id),
							columns: { clinicId: true }
						});

						if (!hasClinic) {
							// Create a new clinic for the user or assign to default
							const clinicData = ctx?.body?.clinicData;

							if (clinicData) {
								// Create new clinic
								const newClinic = await db
									.insert(schema.clinics)
									.values({
										id: "Smart1",
										name: clinicData.name,
										address: clinicData.address
										// other clinic fields
									})
									.returning({ id: schema.clinics.id });

								clinicId = newClinic[0].id;
							} else {
								// Assign to default clinic
								const defaultClinic = await db.query.clinics.findFirst({
									columns: { id: true }
								});

								if (!defaultClinic) {
									// Create a default clinic if none exists
									const newDefaultClinic = await db
										.insert(schema.clinics)
										.values({
											id: "Smart1",
											name: "Default Clinic",
											address: "Default Address"
										})
										.returning({ id: schema.clinics.id });

									clinicId = newDefaultClinic[0].id;
								} else {
									clinicId = defaultClinic.id;
								}
							}

							// Connect user to clinic
							await db.insert(schema.clinicMembers).values({
								userId: user.id,
								role: user.role === "superadmin" ? "admin" : "doctor",
								clinicId: clinicId
							});

							// Update user with default clinic ID
							await db.update(schema.user).set({ clinicId: clinicId }).where(eq(schema.user.id, user.id));
						}
					} catch (error) {
						console.error(`Post-create error for ${user.email}:`, error);
					}

					// Additional operations after user creation
					const updates: Promise<unknown>[] = [];
					const inviteCode = ctx?.body?.invite as string | undefined;

					if (inviteCode) {
						updates.push(
							db
								.update(schema.invites)
								.set({ usedBy: user.id, usedAt: new Date() })
								.where(eq(schema.invites.code, inviteCode))
								.execute()
						);
					}

					if (user.role === "superadmin") {
						updates.push(
							db
								.insert(schema.configStore)
								.values({ key: "admin_onboarded", value: "true" })
								.onConflictDoNothing()
								.execute()
						);
					}

					updates.push(
						getSettings().then(settings =>
							db.insert(schema.userQuota).values({
								userId: user.id,
								quota: user.role === "superadmin" ? -1 : settings.defaultUserQuota,
								fileCountQuota: user.role === "superadmin" ? -1 : settings.defaultUserFileCountQuota,
								inviteQuota: user.role === "superadmin" ? -1 : settings.defaultInvitesQuota
							})
						)
					);

					await Promise.all(updates);
				}
			},
			delete: {
				before: async user => {
					const userFiles = await db
						.select({ id: schema.files.id })
						.from(schema.files)
						.where(eq(schema.files.userId, user.id));

					setImmediate(async () => {
						const BATCH_SIZE = 20;
						for (let i = 0; i < userFiles.length; i += BATCH_SIZE) {
							const batch = userFiles.slice(i, i + BATCH_SIZE);
							await Promise.allSettled(
								batch.map(file => fs.unlink(`./storage/${file.id}`).catch(() => {}))
							);
						}
					});
				}
			}
		}
	},
	user: {
		deleteUser: { enabled: true },
		additionalFields: {
			apiKey: { type: "string", required: false, input: false },
			clinicId: { type: "string", required: false, input: true }
		}
	},
	plugins: [
		betterAuthAdmin({
			ac,
			roles: { superadmin, admin, patient, doctor, user },
			adminRoles: ["superadmin", "admin"]
		}),
		twoFactor(),
		openAPI({
			theme: "deepSpace"
		})
	]
} satisfies BetterAuthOptions;

export const auth = betterAuth({
	...options,
	hooks: {
		before: createAuthMiddleware(async ({ path, request }) => {
			if (path === "/sign-up/email") {
				const settings = await getSettings();
				if (!settings.signUpEnabled) {
					throw new APIError("FORBIDDEN", {
						message: "User sign-up is disabled at the moment."
					});
				}
			}

			if (path.includes("/delete-user")) {
				const session = await auth.api.getSession({
					headers: request?.headers ?? getRequestHeaders()
				});
				if (!session) {
					throw new APIError("UNAUTHORIZED");
				}
				if (session.user.role === "admin" || session.user.role === "superadmin") {
					const result = db
						.select({ count: count(schema.user.id) })
						.from(schema.user)
						.where(eq(schema.user.role, session.user.role))
						.get();
					if (result?.count ?? 0 <= 1) {
						throw new APIError("FORBIDDEN", {
							message: `Cannot delete the only ${session.user.role} user.`
						});
					}
				}
			}
		})
	},
	plugins: [
		...(options.plugins ?? []),
		customSession(async ({ user, session }) => {
			const [userQuota, userClinics, primaryClinic] = await Promise.all([
				db.query.userQuota.findFirst({
					where: (userQuota, { eq }) => eq(userQuota.userId, user.id)
				}),
				db.query.clinicMembers.findMany({
					where: (clinicMembers, { eq }) => eq(clinicMembers.userId, user.id),
					with: {
						clinic: true
					}
				}),
				user.clinicId
					? db.query.clinics.findFirst({
							where: (clinics, { eq }) => eq(clinics.id, user.clinicId as string)
						})
					: undefined
			]);

			return {
				user: {
					...user,
					quota: userQuota,
					primaryClinic,
					clinics:
						userClinics?.map(cm => ({
							id: cm.clinic.id,
							name: cm.clinic.name,
							email: cm.clinic.email,
							memberRole: cm.role,
							joinedAt: cm.createdAt,
							isPrimary: cm.clinic.id === user.clinicId
						})) || []
				},
				session
			};
		}, options),
		tanstackStartCookies()
	]
});

export type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
export type User = Session["user"];
export type Clinic = Session["user"]["primaryClinic"];
export type UserClinic = Session["user"]["clinics"][number];
export type UserRole = User["role"];
export type AuthSession = typeof auth.$Infer.Session;
