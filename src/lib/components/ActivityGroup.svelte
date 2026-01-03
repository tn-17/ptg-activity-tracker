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
		border-radius: var(--radius);
		padding: 12px;
		background: var(--surface);
	}

	h2 {
		margin: 0 0 8px;
		font-size: 14px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.items {
		display: grid;
		gap: 6px;
	}

	.item {
		display: grid;
		grid-template-columns: 24px 1fr auto;
		align-items: center;
		gap: 10px;
		padding: 10px 10px;
		border-radius: calc(var(--radius) - 1px);
		border: 1px solid transparent;
		cursor: pointer;
		user-select: none;
	}

	.item:hover {
		background: color-mix(in srgb, var(--surface) 88%, var(--text));
		border-color: color-mix(in srgb, var(--border) 70%, transparent);
	}

	.item:active {
		transform: translateY(1px);
	}

	.item:focus-within {
		border-color: var(--primary);
	}

	.item.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.item.repeatable {
		grid-template-columns: 1fr auto;
		gap: 12px;
		cursor: default;
	}

	.item.repeatable:active {
		transform: none;
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
		font-weight: 700;
	}

	.meta {
		color: var(--muted);
		font-size: 12px;
		white-space: nowrap;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	/* Custom checkbox (keep native input for a11y) */
	.item input[type='checkbox'] {
		appearance: none;
		-webkit-appearance: none;
		margin: 0;
		width: 18px;
		height: 18px;
		border-radius: 3px;
		border: 2px solid var(--border);
		background: var(--surface);
		display: grid;
		place-content: center;
	}

	.item input[type='checkbox']::before {
		content: '';
		width: 10px;
		height: 10px;
		scale: 0;
		transition: 120ms scale ease;
		background: var(--primary);
	}

	.item input[type='checkbox']:checked {
		border-color: var(--primary);
	}

	.item input[type='checkbox']:checked::before {
		scale: 1;
	}

	.counter {
		display: grid;
		grid-template-columns: 34px 62px 34px;
		align-items: stretch;
		gap: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		background: var(--surface);
	}

	.counter input {
		width: 62px;
		height: 34px;
		text-align: center;
		background: var(--surface);
		border: 0;
		color: var(--text);
		padding: 6px 6px;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	/* remove native spin buttons - keep input numeric */
	.counter input::-webkit-outer-spin-button,
	.counter input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.counter input[type='number'] {
		-moz-appearance: textfield;
	}

	.step {
		height: 34px;
		border: 0;
		background: color-mix(in srgb, var(--surface) 88%, var(--text));
		color: var(--text);
		font-weight: 900;
		cursor: pointer;
	}

	.step:hover {
		background: color-mix(in srgb, var(--surface) 78%, var(--text));
	}

	.step:active {
		transform: translateY(1px);
	}

	.step:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.step:disabled:hover {
		background: color-mix(in srgb, var(--surface) 88%, var(--text));
	}

	.reason {
		color: var(--muted);
		font-size: 12px;
		margin-left: 6px;
		font-weight: 600;
	}

	.points {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		color: var(--muted);
		white-space: nowrap;
	}
</style>
