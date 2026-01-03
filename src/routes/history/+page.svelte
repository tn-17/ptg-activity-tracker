<script lang="ts">
	import { resolve } from '$app/paths';
	import { deleteDayLog, listDayLogsByUpdatedAtDesc } from '$lib/db/dayLogsRepo';
	import { getSundayWeekId } from '$lib/date/week';
	import { computeDayScores } from '$lib/domain/scoring';
	import type { DayScores } from '$lib/domain/scoring';
	import {
		formatRatingLabel,
		READINESS_LABELS,
		TRAINING_RATING_LABELS
	} from '$lib/domain/ratingLabels';
	import type { DayLog } from '$lib/domain/types';
	import { computeWeeklySummaries, type WeeklySummary } from '$lib/domain/weekly';
	import { onMount } from 'svelte';

	type DeloadReason = WeeklySummary['deloadReasons'][number];

	function formatDeloadReasons(reasons: DeloadReason[]): string {
		const labels: Record<DeloadReason, string> = {
			scheduled: 'scheduled',
			fatigued_days: '4+ fatigued days',
			high_average: 'high 3-week average'
		};
		return reasons.map((r) => labels[r]).join(', ');
	}

	type WeekGroup = {
		week: WeeklySummary;
	};

	let loading = true;
	let groups: WeekGroup[] = [];
	let confirmingDeleteDate: string | null = null;
	let deletingDate: string | null = null;
	let deleteError: string | null = null;

	function buildWeekGroups(days: DayLog[]): WeekGroup[] {
		const weeksById = new Map<string, DayLog[]>();
		for (const day of days) {
			const weekStart = getSundayWeekId(day.date);
			const bucket = weeksById.get(weekStart);
			if (bucket) bucket.push(day);
			else weeksById.set(weekStart, [day]);
		}

		const weeks = Array.from(weeksById.entries())
			.map(([weekStart, ds]) => ({
				weekStart,
				days: ds.slice().sort((a, b) => (a.date > b.date ? -1 : 1))
			}))
			.sort((a, b) => (a.weekStart > b.weekStart ? 1 : -1));

		const summaries = computeWeeklySummaries(weeks);
		return summaries.map((week) => ({ week }));
	}

	async function refresh() {
		loading = true;
		try {
			const days = await listDayLogsByUpdatedAtDesc(400);
			groups = buildWeekGroups(days);
		} finally {
			loading = false;
		}
	}

	function onDeleteClick(date: string) {
		deleteError = null;
		confirmingDeleteDate = date;
	}

	function onCancelDelete() {
		confirmingDeleteDate = null;
	}

	async function onConfirmDelete(date: string) {
		if (deletingDate === date) return;
		deleteError = null;
		deletingDate = date;
		try {
			await deleteDayLog(date as any);
			confirmingDeleteDate = null;
			await refresh();
		} catch (e) {
			deleteError = e instanceof Error ? e.message : 'Failed to delete log entry.';
		} finally {
			deletingDate = null;
		}
	}

	onMount(refresh);
</script>

<h1>History</h1>

<a class="new" href={resolve('/log')}>New / Today</a>

{#if loading}
	<p>Loading…</p>
{:else if groups.length === 0}
	<p>No entries yet. Go to <a href={resolve('/log')}>Log</a> to create one.</p>
{:else}
	{#if deleteError}
		<p class="error">{deleteError}</p>
	{/if}
	{#each groups as g (g.week.weekStart)}
		<section class="week">
			<h2>Week of {g.week.weekStart}</h2>
			{#if g.week.deload}
				<p class="deload">
					Deload: yes{#if g.week.deloadReasons.length > 0}
						Reasons: {formatDeloadReasons(g.week.deloadReasons)}{/if}
				</p>
			{:else}
				<p class="deload">Deload: no</p>
			{/if}
			<div class="list">
				{#each g.week.days as d (d.day.date)}
					<div class="rowWrap">
						<a class="row" href={resolve('/log') + `?date=${d.day.date}`}>
							<span class="date">{d.day.date}</span>
							<span class="meta">{formatRatingLabel(READINESS_LABELS[d.day.readiness])}</span>
							<span class="tier"
								>{formatRatingLabel(TRAINING_RATING_LABELS[d.scores.trainingRating])}</span
							>
							<span class="total">{d.scores.totalPoints}</span>
						</a>
						{#if confirmingDeleteDate === d.day.date}
							<div class="confirm" role="group" aria-label={`Confirm delete for ${d.day.date}`}>
								<button
									type="button"
									class="delete danger"
									on:click={() => void onConfirmDelete(d.day.date)}
									disabled={deletingDate === d.day.date || loading}
								>
									{deletingDate === d.day.date ? '…' : 'Confirm'}
								</button>
								<button type="button" class="delete" on:click={onCancelDelete}> Cancel </button>
							</div>
						{:else}
							<button
								type="button"
								class="delete"
								on:click={() => onDeleteClick(d.day.date)}
								disabled={deletingDate === d.day.date || loading}
								aria-label={`Delete log entry for ${d.day.date}`}
								title="Delete"
							>
								Del
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/each}
{/if}

<style>
	.new {
		display: inline-block;
		border: 1px solid var(--primary);
		background: var(--primary);
		color: var(--primary-text);
		padding: 10px 12px;
		border-radius: 8px;
		font-weight: 700;
		margin: 8px 0 16px;
	}
	.new:hover {
		filter: brightness(1.05);
	}
	.week {
		margin: 16px 0;
	}
	.list {
		display: grid;
		gap: 8px;
	}

	.rowWrap {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 8px;
		align-items: stretch;
	}

	.confirm {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}

	.row {
		text-align: left;
		display: grid;
		grid-template-columns: 120px 1fr 90px 60px;
		gap: 12px;
		align-items: center;
		padding: 10px 12px;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: var(--surface);
		text-decoration: none;
		color: inherit;
	}

	.row:hover {
		background: color-mix(in srgb, var(--surface) 92%, var(--text) 8%);
	}

	.delete {
		min-width: 46px;
		padding: 0 10px;
		display: grid;
		place-items: center;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: color-mix(in srgb, var(--surface) 75%, var(--bg));
		color: var(--text);
		font-weight: 900;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		height: 100%;
	}

	.delete:hover {
		border-color: color-mix(in srgb, var(--border) 70%, transparent);
		background: color-mix(in srgb, var(--surface) 70%, var(--text));
		color: var(--bg);
	}

	.delete.danger {
		border-color: color-mix(in srgb, #ef4444 55%, var(--border));
		background: color-mix(in srgb, #ef4444 18%, var(--surface));
		color: color-mix(in srgb, #ef4444 75%, var(--text));
	}

	.delete.danger:hover {
		background: #ef4444;
		border-color: #ef4444;
		color: #ffffff;
	}

	.delete:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.meta {
		color: var(--muted);
		font-size: 12px;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	.total {
		text-align: right;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-weight: 900;
	}

	.tier {
		text-transform: capitalize;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	.error {
		margin: 12px 0;
		padding: 10px 12px;
		border-radius: var(--radius);
		border: 1px solid color-mix(in srgb, #ef4444 55%, var(--border));
		background: color-mix(in srgb, #ef4444 12%, var(--surface));
		color: color-mix(in srgb, #ef4444 75%, var(--text));
	}

	@media (max-width: 900px) {
		.rowWrap {
			grid-template-columns: 1fr;
		}
		.row {
			grid-template-columns: 1fr;
			gap: 6px;
		}
		.total {
			text-align: left;
		}
		.confirm {
			grid-template-columns: 1fr 1fr;
		}
		.delete {
			width: 100%;
			height: 42px;
		}
	}
</style>
