<script lang="ts">
	import { onMount } from 'svelte';
	import { listDayLogsByUpdatedAtDesc } from '$lib/db/dayLogsRepo';
	import { getSundayWeekId, sundayWeekStart } from '$lib/date/week';
	import {
		computeConsistencyStreakWeeks,
		computeWeeklySummaries,
		computeWinStreakDays,
		type WeeklySummary
	} from '$lib/domain/weekly';

	let loading = true;
	let summaries: WeeklySummary[] = [];

	function groupByWeek(
		days: Awaited<ReturnType<typeof listDayLogsByUpdatedAtDesc>>
	): Array<[string, typeof days]> {
		const sorted = days.slice().sort((a, b) => (a.date > b.date ? -1 : 1));

		const groups: Array<[string, typeof days]> = [];
		for (const day of sorted) {
			const weekStart = getSundayWeekId(day.date);
			const existing = groups.find(([w]) => w === weekStart);
			if (existing) existing[1].push(day);
			else groups.push([weekStart, [day]]);
		}
		return groups;
	}

	function thisWeekId(): string {
		const start = sundayWeekStart(new Date());
		const y = start.getFullYear();
		const m = String(start.getMonth() + 1).padStart(2, '0');
		const d = String(start.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	async function refresh() {
		loading = true;
		try {
			const days = await listDayLogsByUpdatedAtDesc(500);
			const byWeek = groupByWeek(days);
			summaries = computeWeeklySummaries(byWeek.map(([weekStart, days]) => ({ weekStart, days })));
		} finally {
			loading = false;
		}
	}

	onMount(refresh);

	$: currentWeek = summaries.find((s) => s.weekStart === thisWeekId()) ?? null;
	$: winStreakDays = computeWinStreakDays(summaries.flatMap((s) => s.days.map((d) => d.day)));
	$: consistencyStreakWeeks = computeConsistencyStreakWeeks(summaries);

	function formatDeloadReasons(reasons: WeeklySummary['deloadReasons']): string {
		const labels: Record<WeeklySummary['deloadReasons'][number], string> = {
			scheduled: 'scheduled',
			fatigued_days: '4+ fatigued days',
			high_average: 'high 3-week average'
		};
		return reasons.map((r) => labels[r]).join(', ');
	}
</script>

<h1>Weekly Dashboard</h1>

{#if loading}
	<p>Loading…</p>
{:else}
	{#if currentWeek}
		<section class="card highlight">
			<h2>This week ({currentWeek.weekStart})</h2>
			<div class="kv"><span>Training points</span><span>{currentWeek.trainingPoints}</span></div>
			<div class="kv"><span>Wins</span><span>{currentWeek.wins}</span></div>
			<div class="kv"><span>Missed days</span><span>{currentWeek.missedDays}</span></div>
			<div class="kv"><span>Weekly rating</span><span>{currentWeek.weeklyRating}</span></div>
			<div class="kv"><span>Deload</span><span>{currentWeek.deload ? 'yes' : 'no'}</span></div>
			{#if currentWeek.deload && currentWeek.deloadReasons.length > 0}
				<div class="kv">
					<span>Deload reasons</span><span>{formatDeloadReasons(currentWeek.deloadReasons)}</span>
				</div>
			{/if}
			<div class="kv"><span>Win streak</span><span>{winStreakDays} days</span></div>
			<div class="kv">
				<span>Consistency streak</span><span>{consistencyStreakWeeks} weeks</span>
			</div>
		</section>
	{/if}

	{#if summaries.length === 0}
		<p>No entries yet.</p>
	{:else}
		{#each summaries as s (s.weekStart)}
			<section class="card">
				<h2>Week of {s.weekStart}</h2>
				<div class="kv"><span>Training points</span><span>{s.trainingPoints}</span></div>
				<div class="kv"><span>Wins</span><span>{s.wins}</span></div>
				<div class="kv"><span>Missed days</span><span>{s.missedDays}</span></div>
				<div class="kv"><span>Weekly rating</span><span>{s.weeklyRating}</span></div>
				<div class="kv"><span>Deload</span><span>{s.deload ? 'yes' : 'no'}</span></div>
			</section>
		{/each}
	{/if}
{/if}

<style>
	.card {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px;
		margin: 12px 0;
		background: var(--surface);
	}
	.highlight {
		border-color: var(--primary);
	}
	.kv {
		display: flex;
		justify-content: space-between;
		padding: 4px 0;
	}
</style>
