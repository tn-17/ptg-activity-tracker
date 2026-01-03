<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

	function dismiss(): void {
		offlineReady.set(false);
		needRefresh.set(false);
	}

	async function reload(): Promise<void> {
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
		<span>Update available.</span>
		<div class="actions">
			<button type="button" on:click={reload}>Reload</button>
			<button type="button" on:click={dismiss} class="secondary">Later</button>
		</div>
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
