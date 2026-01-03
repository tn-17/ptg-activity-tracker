<script lang="ts">
	import { onMount } from 'svelte';
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

	let handlingChunkFailure = false;
	let offlineError = false;

	function isChunkLoadFailure(reason: unknown): boolean {
		const message =
			reason instanceof Error
				? reason.message
				: typeof reason === 'string'
					? reason
					: typeof reason === 'object' && reason !== null && 'message' in reason
						? String((reason as { message: unknown }).message)
						: '';

		return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed/i.test(
			message
		);
	}

	async function recoverFromChunkFailure(reason: unknown): Promise<void> {
		if (handlingChunkFailure) return;
		if (!isChunkLoadFailure(reason)) return;
		handlingChunkFailure = true;

		if (!navigator.onLine) {
			needRefresh.set(true);
			offlineError = true;
			handlingChunkFailure = false;
			return;
		}

		try {
			await updateServiceWorker(true);
		} finally {
			location.reload();
		}
	}

	onMount(() => {
		const onUnhandledRejection = (event: PromiseRejectionEvent): void => {
			void recoverFromChunkFailure(event.reason);
		};

		const onError = (event: ErrorEvent): void => {
			void recoverFromChunkFailure(event.error ?? event.message);
		};

		const onOnline = (): void => {
			if (offlineError && $needRefresh) offlineError = false;
		};

		window.addEventListener('unhandledrejection', onUnhandledRejection);
		window.addEventListener('error', onError);
		window.addEventListener('online', onOnline);

		return () => {
			window.removeEventListener('unhandledrejection', onUnhandledRejection);
			window.removeEventListener('error', onError);
			window.removeEventListener('online', onOnline);
		};
	});

	function dismiss(): void {
		offlineReady.set(false);
		needRefresh.set(false);
		offlineError = false;
	}

	async function reload(): Promise<void> {
		offlineError = false;
		offlineReady.set(false);
		needRefresh.set(false);
		await updateServiceWorker(true);
	}
</script>

{#if $offlineReady}
	<div class="toast" role="status" aria-live="polite">
		<span>Ready to work offline.</span>
		<button type="button" on:click={dismiss}>Dismiss</button>
	</div>
{/if}

{#if $needRefresh}
	<div class="toast" role="status" aria-live="polite">
		{#if offlineError}
			<span>You are offline. Reconnect to update.</span>
			<button type="button" on:click={dismiss}>Dismiss</button>
		{:else}
			<span>Update available.</span>
			<div class="actions">
				<button type="button" on:click={reload}>Reload</button>
				<button type="button" on:click={dismiss} class="secondary">Later</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		left: 16px;
		right: 16px;
		bottom: 16px;
		max-width: 960px;
		margin: 0 auto;
		padding: 12px 12px;
		border-radius: 14px;
		background: var(--text);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border: 1px solid var(--border);
		box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
		z-index: 50;
	}

	.actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	button {
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.12);
		color: inherit;
		padding: 8px 10px;
		border-radius: 10px;
		cursor: pointer;
	}

	button.secondary {
		background: transparent;
	}
</style>
