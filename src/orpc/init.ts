// src/orpc/init.ts

import { ORPCError, os } from "@orpc/server";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { db } from "@/db";
import { auth } from "@/lib/auth";

import type { OrpcContext } from "./context";

export const base = os.$context<{ headers: Headers }>();

// Public DB middleware (no auth required)
export const dbMiddleware = base.middleware(async ({ next }) => {
	return next({
		context: {
			db // inject Drizzle singleton
		}
	});
});

// Auth + DB middleware
export const authMiddleware = base.middleware(async ({ context, next }) => {
	const headers = context.headers ?? getRequestHeaders();
	const sessionData = await auth.api.getSession({ headers });

	if (!sessionData?.session || !sessionData?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}

	return next({
		context: {
			db, // Drizzle instance
			auth, // Better‑Auth instance
			session: sessionData.session,
			user: sessionData.user,
			clinicId: sessionData.user.primaryClinic?.id ?? null,
			isAuthenticated: true,
			ip: headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? undefined,
			userAgent: headers.get("user-agent") ?? undefined,
			headers,
			requireRole: (role: string) => {
				if (sessionData.user.role !== role) {
					throw new ORPCError("FORBIDDEN");
				}
			}
		} satisfies OrpcContext
	});
});

// Export pre‑configured bases
export const publicProcedure = base.use(dbMiddleware);
export const authorized = base.use(authMiddleware);
export const protectedProcedure = authorized.use(dbMiddleware);
