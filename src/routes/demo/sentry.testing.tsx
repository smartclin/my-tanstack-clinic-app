/**
 * FILE OVERVIEW:
 * Purpose: Interactive demo page showcasing Sentry's monitoring capabilities
 * Key Concepts: Error tracking, Performance monitoring, Session replay
 * Module Type: Route Component
 * @ai_context: Demonstrates Sentry features through interactive examples with educational context
 */

import * as fs from "node:fs/promises";

import * as Sentry from "@sentry/tanstackstart-react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/demo/sentry/testing")({
	component: RouteComponent,
	errorComponent: ({ error }) => {
		useEffect(() => {
			Sentry.captureException(error);
		}, [error]);
		return (
			<div className='flex min-h-screen items-center justify-center bg-[#181423]'>
				<div className='p-8 text-center'>
					<SentryLogo />
					<h1 className='mt-4 mb-2 font-bold text-2xl text-white'>Something went wrong</h1>
					<p className='text-[#A49FB5]'>{error.message}</p>
				</div>
			</div>
		);
	}
});

// Sentry Logo Component
function SentryLogo({ size = 48 }: { size?: number }) {
	return (
		<svg
			fill='none'
			height={size}
			viewBox='0 0 40 40'
			width={size}
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M21.85 2.995a3.698 3.698 0 0 1 1.353 1.354l16.303 28.278a3.703 3.703 0 0 1-1.354 5.053 3.694 3.694 0 0 1-1.848.496h-3.828a31.149 31.149 0 0 0 0-3.09h3.815a.61.61 0 0 0 .537-.917L20.523 5.893a.61.61 0 0 0-1.057 0l-3.739 6.494a28.948 28.948 0 0 1 9.63 10.453 28.988 28.988 0 0 1 3.499 13.78v1.542h-9.852v-1.544a19.106 19.106 0 0 0-2.182-8.85 19.08 19.08 0 0 0-6.032-6.829l-1.85 3.208a15.377 15.377 0 0 1 6.382 12.484v1.542H3.696A3.694 3.694 0 0 1 0 34.473c0-.648.17-1.286.494-1.849l2.33-4.074a8.562 8.562 0 0 1 2.689 1.536L3.158 34.17a.611.611 0 0 0 .538.917h8.448a12.481 12.481 0 0 0-6.037-9.09l-1.344-.772 4.908-8.545 1.344.77a22.16 22.16 0 0 1 7.705 7.444 22.193 22.193 0 0 1 3.316 10.193h3.699a25.892 25.892 0 0 0-3.811-12.033 25.856 25.856 0 0 0-9.046-8.796l-1.344-.772 5.269-9.136a3.698 3.698 0 0 1 3.2-1.849c.648 0 1.285.17 1.847.495Z'
				fill='currentColor'
			/>
		</svg>
	);
}

// Server function that will error
const badServerFunc = createServerFn({
	method: "GET"
}).handler(async () => {
	return await Sentry.startSpan(
		{
			name: "Reading non-existent file",
			op: "file.read"
		},
		async () => {
			try {
				await fs.readFile("./doesnt-exist", "utf-8");
				return true;
			} catch (error) {
				Sentry.captureException(error);
				throw error;
			}
		}
	);
});

// Server function that will succeed but be traced
const goodServerFunc = createServerFn({
	method: "GET"
}).handler(async () => {
	return await Sentry.startSpan(
		{
			name: "Successful server operation",
			op: "demo.success"
		},
		async () => {
			await new Promise(resolve => setTimeout(resolve, 500));
			return { success: true };
		}
	);
});

// 3D Button Component inspired by Sentry wizard
function SentryButton({
	children,
	onClick,
	variant = "primary",
	disabled = false,
	loading = false
}: {
	children: React.ReactNode;
	onClick: () => void;
	variant?: "primary" | "error";
	disabled?: boolean;
	loading?: boolean;
}) {
	const baseColor = variant === "error" ? "#E50045" : "#553DB8";
	const topColor = variant === "error" ? "#FF1A5C" : "#7553FF";

	return (
		<button
			className='group w-full cursor-pointer rounded-lg border-none p-0 text-white transition-all disabled:cursor-not-allowed disabled:opacity-60'
			disabled={disabled || loading}
			onClick={onClick}
			style={{ backgroundColor: baseColor }}
			type='button'
		>
			<span
				className='flex items-center justify-center gap-3 rounded-lg px-6 py-4 font-semibold text-lg transition-transform group-hover:-translate-y-1 group-active:translate-y-0 group-disabled:translate-y-0'
				style={{
					backgroundColor: topColor,
					border: `1px solid ${baseColor}`
				}}
			>
				{loading && (
					<svg
						className='h-5 w-5 animate-spin'
						fill='none'
						viewBox='0 0 24 24'
						xmlns='http://www.w3.org/2000/svg'
					>
						<circle
							className='opacity-25'
							cx='12'
							cy='12'
							r='10'
							stroke='currentColor'
							strokeWidth='4'
						/>
						<path
							className='opacity-75'
							d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
							fill='currentColor'
						/>
					</svg>
				)}
				{children}
			</span>
		</button>
	);
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
	return (
		<div className='group rounded-xl border border-[#2D2640] bg-[#1C1825] p-4 transition-all hover:border-[#7553FF]/50'>
			<div className='mb-2 flex items-center gap-3'>
				<div className='text-[#7553FF] transition-transform group-hover:scale-110'>{icon}</div>
				<h3 className='font-semibold text-white'>{title}</h3>
			</div>
			<p className='pl-9 text-[#A49FB5] text-sm'>{description}</p>
		</div>
	);
}

// Result Badge Component
function ResultBadge({ type, spanOp, onCopy }: { type: "success" | "error"; spanOp: string; onCopy: () => void }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(spanOp);
		setCopied(true);
		onCopy();
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className='mt-4 space-y-3'>
			{type === "error" && (
				<div className='flex items-center gap-2 rounded-lg border border-[#E50045]/30 bg-[#E50045]/10 px-4 py-3'>
					<svg
						className='h-5 w-5 text-[#FF1A5C]'
						fill='none'
						stroke='currentColor'
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						viewBox='0 0 24 24'
					>
						<title>Error captured</title>
						<path d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
					</svg>
					<span className='font-medium text-[#FF1A5C] text-sm'>Error captured and sent to Sentry</span>
				</div>
			)}

			{type === "success" && (
				<div className='flex items-center gap-2 rounded-lg border border-[#00BF4D]/30 bg-[#00F261]/10 px-4 py-3'>
					<svg
						className='h-5 w-5 text-[#00F261]'
						fill='none'
						stroke='currentColor'
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						viewBox='0 0 24 24'
					>
						<title>Trace complete</title>
						<path d='M5 13l4 4L19 7' />
					</svg>
					<span className='font-medium text-[#00F261] text-sm'>Trace completed successfully</span>
				</div>
			)}

			<button
				className='relative flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[#7553FF]/30 bg-[#7553FF]/10 px-4 py-2 transition-all hover:bg-[#7553FF]/20'
				onClick={handleCopy}
				type='button'
			>
				<span className='text-[#B3A1FF] text-sm'>span.op:</span>
				<code className='font-mono text-[#7553FF] text-sm'>{spanOp}</code>
				<svg
					className='ml-auto h-4 w-4 text-[#B3A1FF]'
					fill='none'
					stroke='currentColor'
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth='2'
					viewBox='0 0 24 24'
				>
					<title>Copy to clipboard</title>
					<path d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
				</svg>
				{copied && (
					<span className='absolute -top-8 left-1/2 -translate-x-1/2 animate-pulse rounded bg-[#00F261] px-2 py-1 font-medium text-[#181423] text-xs'>
						Copied!
					</span>
				)}
			</button>
		</div>
	);
}

// Progress Bar Component
function ProgressBar({ loading }: { loading: boolean }) {
	return (
		<div className='mt-4 flex items-center gap-3'>
			<div
				className={`h-3 w-3 rounded-full transition-all ${loading ? "animate-pulse bg-[#7553FF]" : "bg-[#00F261]"}`}
			/>
			<div className='h-2 flex-1 overflow-hidden rounded-full bg-[#2D2640]'>
				<div
					className='h-full rounded-full bg-gradient-to-r from-[#7553FF] to-[#B3A1FF] transition-all duration-500'
					style={{ width: loading ? "60%" : "100%" }}
				/>
			</div>
			<span className='w-16 text-right text-[#A49FB5] text-xs'>{loading ? "Running..." : "Complete"}</span>
		</div>
	);
}

function RouteComponent() {
	const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
	const [results, setResults] = useState<Record<string, { type: "success" | "error"; spanOp: string }>>({});
	const [sentryConfigured, setSentryConfigured] = useState<boolean | null>(null);

	useEffect(() => {
		// Check if Sentry DSN environment variable is set
		const hasDsn = !!import.meta.env.VITE_SENTRY_DSN;
		setSentryConfigured(hasDsn);
	}, []);

	// Don't show warning until we've checked on the client
	const showWarning = sentryConfigured === false;

	const handleClientError = async () => {
		setIsLoading(prev => ({ ...prev, clientError: true }));
		try {
			await Sentry.startSpan({ name: "Client Error Flow Demo", op: "demo.client-error" }, async () => {
				Sentry.setContext("demo", {
					feature: "client-error-demo",
					triggered_at: new Date().toISOString()
				});
				throw new Error("Client-side error demonstration");
			});
		} catch (error) {
			Sentry.captureException(error);
			setResults(prev => ({
				...prev,
				clientError: { type: "error", spanOp: "demo.client-error" }
			}));
		} finally {
			setIsLoading(prev => ({ ...prev, clientError: false }));
		}
	};

	const handleServerError = async () => {
		setIsLoading(prev => ({ ...prev, serverError: true }));
		try {
			await Sentry.startSpan({ name: "Server Error Flow Demo", op: "demo.server-error" }, async () => {
				Sentry.setContext("demo", {
					feature: "server-error-demo",
					triggered_at: new Date().toISOString()
				});
				await badServerFunc();
			});
		} catch (error) {
			Sentry.captureException(error);
			setResults(prev => ({
				...prev,
				serverError: { type: "error", spanOp: "demo.server-error" }
			}));
		} finally {
			setIsLoading(prev => ({ ...prev, serverError: false }));
		}
	};

	const handleClientTrace = async () => {
		setIsLoading(prev => ({ ...prev, clientTrace: true }));
		await Sentry.startSpan({ name: "Client Operation", op: "demo.client-trace" }, async () => {
			await new Promise(resolve => setTimeout(resolve, 1000));
		});
		setResults(prev => ({
			...prev,
			clientTrace: { type: "success", spanOp: "demo.client-trace" }
		}));
		setIsLoading(prev => ({ ...prev, clientTrace: false }));
	};

	const handleServerTrace = async () => {
		setIsLoading(prev => ({ ...prev, serverTrace: true }));
		try {
			await Sentry.startSpan({ name: "Server Operation", op: "demo.server-trace" }, async () => {
				await goodServerFunc();
			});
			setResults(prev => ({
				...prev,
				serverTrace: { type: "success", spanOp: "demo.server-trace" }
			}));
		} finally {
			setIsLoading(prev => ({ ...prev, serverTrace: false }));
		}
	};

	return (
		<div
			className='min-h-screen text-white'
			style={{
				fontFamily:
					'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
				background: "linear-gradient(180deg, #181423 0%, #1C1825 50%, #181423 100%)"
			}}
		>
			<div className='mx-auto max-w-5xl px-6 py-16'>
				{/* Header */}
				<div className='mb-16 text-center'>
					<div className='mb-8 inline-flex items-center gap-4'>
						<div className='text-[#7553FF]'>
							<SentryLogo size={56} />
						</div>
						<div className='text-left'>
							<h1 className='font-bold text-3xl text-white tracking-tight'>Sentry Demo</h1>
							<p className='text-[#A49FB5] text-sm'>Error monitoring & performance tracing</p>
						</div>
					</div>
					<p className='mx-auto max-w-xl text-[#A49FB5] text-lg leading-relaxed'>
						Click the buttons below to trigger errors and traces, then view them in your{" "}
						<a
							className='text-[#7553FF] underline transition-colors hover:text-[#B3A1FF]'
							href='https://sentry.io'
							rel='noopener noreferrer'
							target='_blank'
						>
							Sentry dashboard
						</a>
						.
					</p>
				</div>

				{/* Sentry Not Initialized Warning */}
				{showWarning && (
					<div className='mb-8 flex items-center gap-3 rounded-xl border border-[#E5A000]/30 bg-[#E5A000]/10 px-6 py-4'>
						<svg
							className='h-6 w-6 flex-shrink-0 text-[#E5A000]'
							fill='none'
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							viewBox='0 0 24 24'
						>
							<title>Warning</title>
							<path d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
						</svg>
						<div>
							<p className='font-medium text-[#E5A000]'>Sentry is not initialized</p>
							<p className='mt-1 text-[#A49FB5] text-sm'>
								Set the{" "}
								<code className='rounded bg-[#1C1825] px-1.5 py-0.5 text-[#B3A1FF]'>
									VITE_SENTRY_DSN
								</code>{" "}
								environment variable to enable error tracking and performance monitoring.
							</p>
						</div>
					</div>
				)}

				{/* Features Grid */}
				<div className='mb-12 grid grid-cols-1 gap-4 md:grid-cols-4'>
					<FeatureCard
						description='Client & server error tracking'
						icon={
							<svg
								className='h-6 w-6'
								fill='currentColor'
								viewBox='0 0 24 24'
							>
								<path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
							</svg>
						}
						title='Error Monitoring'
					/>
					<FeatureCard
						description='Tracing and spans visualization'
						icon={
							<svg
								className='h-6 w-6'
								fill='currentColor'
								viewBox='0 0 24 24'
							>
								<path d='M13 3v18h-2V3h2zm6 6v12h-2V9h2zM7 14v7H5v-7h2z' />
							</svg>
						}
						title='Performance'
					/>
					<FeatureCard
						description='Real user session playback'
						icon={
							<svg
								className='h-6 w-6'
								fill='currentColor'
								viewBox='0 0 24 24'
							>
								<path d='M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z' />
							</svg>
						}
						title='Session Replay'
					/>
					<FeatureCard
						description='Instant issue notifications'
						icon={
							<svg
								className='h-6 w-6'
								fill='currentColor'
								viewBox='0 0 24 24'
							>
								<path d='M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z' />
							</svg>
						}
						title='Real-time Alerts'
					/>
				</div>

				{/* Testing Panels */}
				<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
					{/* Client-Side Panel */}
					<div className='rounded-2xl border border-[#2D2640] bg-[#1C1825] p-8'>
						<div className='mb-6 flex items-center gap-3'>
							<div className='h-3 w-3 rounded-full bg-[#00F261]' />
							<h2 className='font-semibold text-xl'>Client-Side Testing</h2>
						</div>

						<div className='space-y-4'>
							<div>
								<SentryButton
									disabled={sentryConfigured === false}
									loading={isLoading.clientError}
									onClick={handleClientError}
									variant='error'
								>
									Trigger Client Error
								</SentryButton>
								{isLoading.clientError && <ProgressBar loading={isLoading.clientError} />}
								{results.clientError && !isLoading.clientError && (
									<ResultBadge
										onCopy={() => {}}
										spanOp={results.clientError.spanOp}
										type={results.clientError.type}
									/>
								)}
							</div>

							<div>
								<SentryButton
									disabled={sentryConfigured === false}
									loading={isLoading.clientTrace}
									onClick={handleClientTrace}
									variant='primary'
								>
									Test Client Trace
								</SentryButton>
								{isLoading.clientTrace && <ProgressBar loading={isLoading.clientTrace} />}
								{results.clientTrace && !isLoading.clientTrace && (
									<ResultBadge
										onCopy={() => {}}
										spanOp={results.clientTrace.spanOp}
										type={results.clientTrace.type}
									/>
								)}
							</div>
						</div>
					</div>

					{/* Server-Side Panel */}
					<div className='rounded-2xl border border-[#2D2640] bg-[#1C1825] p-8'>
						<div className='mb-6 flex items-center gap-3'>
							<div className='h-3 w-3 rounded-full bg-[#7553FF]' />
							<h2 className='font-semibold text-xl'>Server-Side Testing</h2>
						</div>

						<div className='space-y-4'>
							<div>
								<SentryButton
									disabled={sentryConfigured === false}
									loading={isLoading.serverError}
									onClick={handleServerError}
									variant='error'
								>
									Trigger Server Error
								</SentryButton>
								{isLoading.serverError && <ProgressBar loading={isLoading.serverError} />}
								{results.serverError && !isLoading.serverError && (
									<ResultBadge
										onCopy={() => {}}
										spanOp={results.serverError.spanOp}
										type={results.serverError.type}
									/>
								)}
							</div>

							<div>
								<SentryButton
									disabled={sentryConfigured === false}
									loading={isLoading.serverTrace}
									onClick={handleServerTrace}
									variant='primary'
								>
									Test Server Trace
								</SentryButton>
								{isLoading.serverTrace && <ProgressBar loading={isLoading.serverTrace} />}
								{results.serverTrace && !isLoading.serverTrace && (
									<ResultBadge
										onCopy={() => {}}
										spanOp={results.serverTrace.spanOp}
										type={results.serverTrace.type}
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Footer Note */}
				<div className='mt-12 text-center'>
					<p className='text-[#6E6C75] text-sm'>
						This page uses{" "}
						<code className='rounded bg-[#1C1825] px-2 py-1 text-[#B3A1FF]'>
							@sentry/tanstackstart-react
						</code>{" "}
						for full-stack error monitoring.
						<br />
						<a
							className='text-[#7553FF] underline transition-colors hover:text-[#B3A1FF]'
							href='https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/'
							rel='noopener noreferrer'
							target='_blank'
						>
							Read the documentation →
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
