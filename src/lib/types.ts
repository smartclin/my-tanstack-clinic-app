import type { auth } from "./auth";

export const UPLOAD_STATUS = {
	PENDING: "pending",
	UPLOADING: "uploading",
	PAUSED: "paused",
	COMPLETED: "completed",
	ERROR: "error"
} as const;

export const UPLOADER_CONFIG = {
	DEFAULT_ENDPOINT: "/api/upload",
	DEFAULT_CONCURRENT_LIMIT: 5,
	DEFAULT_RETRY_DELAYS: [0, 3000, 5000, 10000] as number[],
	MAX_FILE_LIST_HEIGHT: 300,
	PROGRESS_BAR_HEIGHT: 1.5,
	CHUNK_SIZE: 25 * 1024 * 1024
} as const;
export const COMMON_FILE_EXTENSIONS = [
	"exe",
	"bat",
	"sh",
	"cmd",
	"js",
	"ts",
	"jsx",
	"tsx",
	"py",
	"rb",
	"php",
	"dll",
	"msi",
	"apk",
	"dmg",
	"iso",
	"zip",
	"rar",
	"7z",
	"tar",
	"gz"
];
export const unknownError = "An unknown error occurred. Please try again later.";

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];

export interface UploadControl {
	start: () => void;
	pause: () => void;
	cancel: () => void;
}

export interface FileUploadState {
	status: UploadStatus;
	progress: number;
}

export type FileRow = {
	id: string;
	filename: string;
	size: number;
	mimeType: string;
	slug: string;
};

export type FolderRow = {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	parentId: string | null;
	userId: string;
};

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export type SnakeToCamelCase<S extends string> = S extends `${infer Head}_${infer Tail}`
	? `${Lowercase<Head>}${Capitalize<SnakeToCamelCase<Tail>>}`
	: Lowercase<S>;

export type CamelCaseKeys<T> =
	T extends Array<infer U>
		? Array<CamelCaseKeys<U>>
		: T extends object
			? {
					[K in keyof T as SnakeToCamelCase<K & string>]: CamelCaseKeys<T[K]>;
				}
			: T;

// Re-export Session as SessionData for consistency
export type SessionData = Session;
