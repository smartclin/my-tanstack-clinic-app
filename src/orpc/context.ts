import { ORPCError } from "@orpc/server";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { type AppDb, db } from "@/db";
import { type AuthSession, auth } from "@/lib/auth";

import type { UserRole } from "../lib/permissions";

export type OrpcContext = {
	session: AuthSession["session"] | null;
	auth: typeof auth;
	user: AuthSession["user"] | null;
	clinicId: string | null;
	db: AppDb;
	isAuthenticated: boolean;
	ip?: string;
	userAgent?: string;
	headers: Headers;
	requireRole: (role: UserRole) => void;
};

export type CreateContextOptions = {
	headers?: Headers;
};

export async function createContext(_options: CreateContextOptions = {}): Promise<OrpcContext> {
	const headers = _options.headers ?? getRequestHeaders();
	const data = await auth.api.getSession({ headers });

	return {
		db,
		auth,
		user: data?.user ?? null,
		session: data?.session ?? null,
		clinicId: data?.user?.primaryClinic?.id ?? null,
		ip: headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? undefined,
		userAgent: headers.get("user-agent") ?? undefined,
		isAuthenticated: !!data?.user,
		headers,
		requireRole: (role: UserRole) => {
			if (data?.user?.role !== role) {
				throw new ORPCError("FORBIDDEN");
			}
		}
	};
}
export type Context = ReturnType<typeof createContext>;
