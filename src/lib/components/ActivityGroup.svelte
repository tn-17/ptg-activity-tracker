<script lang="ts">
	import type { ActivityDefinition, ActivityKey } from '$lib/domain/types';

	type Activity = ActivityDefinition & {
		repeatable?: boolean;
		durationMinutes?: number;
	};

	type Props = {
		group: string;
		activities: Activity[];

		// Non-repeatable (once-per-day) completion state
		completed: Partial<Record<ActivityKey, boolean>>;
		onToggle: (key: ActivityKey, checked: boolean) => void;

		// Repeatable counts (e.g. conditioning_easy/medium/hard)
		counts?: Partial<Record<ActivityKey, number>>;
		onCountChange: (key: ActivityKey, count: number) => void;

		disabledKeys?: Partial<Record<ActivityKey, boolean>>;
		disabledReasonByKey?: Partial<Record<ActivityKey, string>>;
	};

	let {
		group,
		activities,
		completed,
		onToggle,
		counts = {},
		onCountChange,
		disabledKeys,
		disabledReasonByKey
	}: Props = $props();

	function clampCount(n: unknown) {
		const asNum = typeof n === 'number' ? n : Number(n);
		if (!Number.isFinite(asNum)) return 0;
		return Math.max(0, Math.floor(asNum));
	}

	function setCount(key: ActivityKey, next: number) {
		onCountChange(key, clampCount(next));
	}
</script>

<section class="group">
	<h2>{group}</h2>
	<div class="items">
		{#each activities as a (a.key)}
			{#if a.repeatable ?? false}
				<div class="item repeatable" class:disabled={disabledKeys?.[a.key] ?? false}>
					<div class="main">
						<div class="label">
							<span>{a.label}</span>
							{#if a.durationMinutes}
								<span class="meta">{a.durationMinutes}m</span>
							{/if}
							{#if disabledReasonByKey?.[a.key]}
								<span class="reason">({disabledReasonByKey[a.key]})</span>
							{/if}
						</div>
						<span class="points">{a.points}pt ea</span>
					</div>

					<div class="counter" aria-label={`Count for ${a.label}`}>
						<button
							type="button"
							class="step"
							disabled={disabledKeys?.[a.key] ?? false}
							onclick={() => setCount(a.key, (counts?.[a.key] ?? 0) - 1)}
						>
							-
						</button>
						<input
							type="number"
							min="0"
							inputmode="numeric"
							disabled={disabledKeys?.[a.key] ?? false}
							value={counts?.[a.key] ?? 0}
							oninput={(e) => setCount(a.key, Number((e.currentTarget as HTMLInputElement).value))}
						/>

						<button
							type="button"
							class="step"
							disabled={disabledKeys?.[a.key] ?? false}
							onclick={() => setCount(a.key, (counts?.[a.key] ?? 0) + 1)}
						>
							+
						</button>
					</div>
				</div>
			{:else}
				<label class="item" class:disabled={disabledKeys?.[a.key] ?? false}>
					<input
						type="checkbox"
						disabled={disabledKeys?.[a.key] ?? false}
						checked={completed[a.key] ?? false}
						onchange={(e) => onToggle(a.key, (e.currentTarget as HTMLInputElement).checked)}
					/>
					<span class="label">
						{a.label}
						{#if disabledReasonByKey?.[a.key]}
							<span class="reason">({disabledReasonByKey[a.key]})</span>
						{/if}
					</span>
					<span class="points">{a.points}pt</span>
				</label>
			{/if}
		{/each}
	</div>
</section>

<style>
	.group {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px;
		background: var(--surface);
	}
	.items {
		display: grid;
		gap: 8px;
	}
	.item {
		display: grid;
		grid-template-columns: 20px 1fr auto;
		align-items: center;
		gap: 10px;
		padding: 8px;
		border-radius: 6px;
	}
	.item:hover {
		background: color-mix(in srgb, var(--surface) 70%, var(--text));
	}
	.item.disabled {
		opacity: 0.6;
	}
	.item.repeatable {
		grid-template-columns: 1fr auto;
		gap: 12px;
	}
	.item.repeatable:hover {
		background: color-mix(in srgb, var(--surface) 80%, var(--text));
	}
	.main {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
		min-width: 0;
	}
	.label {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
	}
	.meta {
		color: var(--muted);
		font-size: 12px;
		white-space: nowrap;
	}
	.counter {
		display: grid;
		grid-template-columns: 34px 56px 34px;
		align-items: center;
		gap: 6px;
	}
	.counter input {
		width: 56px;
		text-align: center;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: 8px;
		padding: 6px 8px;
		font-variant-numeric: tabular-nums;
	}
	.step {
		height: 32px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: color-mix(in srgb, var(--surface) 92%, var(--text));
		color: var(--text);
	}
	.step:hover {
		filter: brightness(1.05);
	}
	.step:disabled {
		opacity: 0.6;
	}
	.step:disabled:hover {
		filter: none;
	}
	.reason {
		color: var(--muted);
		font-size: 12px;
		margin-left: 6px;
	}
	.points {
		font-variant-numeric: tabular-nums;
		color: var(--muted);
		white-space: nowrap;
	}
</style>
