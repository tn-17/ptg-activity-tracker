<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { ACTIVITY_DEFINITIONS } from '$lib/domain/activities';
	import type { ActivityKey, IsoDateString, Readiness } from '$lib/domain/types';

	type RepeatableActivityKey = 'conditioning_easy' | 'conditioning_medium' | 'conditioning_hard';
	import { computeDayScores } from '$lib/domain/scoring';
	import type { DayScores } from '$lib/domain/scoring';
	import {
		formatRatingLabel,
		LIFESTYLE_RATING_LABELS,
		READINESS_LABELS,
		TRAINING_RATING_LABELS
	} from '$lib/domain/ratingLabels';

	type ScoringDayLog = {
		date: IsoDateString;
		readiness: Readiness;
		completed: Partial<Record<Exclude<ActivityKey, RepeatableActivityKey>, boolean>>;
		counts: Partial<Record<RepeatableActivityKey, number>>;
		notes?: string;
		createdAt: number;
		updatedAt: number;
	};
	import { isoDateFromDate } from '$lib/date/week';
	import ActivityGroup from '$lib/components/ActivityGroup.svelte';
	import { getDayLog, upsertDayLog } from '$lib/db/dayLogsRepo';

	const readinessLevels = ['fatigued', 'normal', 'good'] as const;

	let date: IsoDateString = isoDateFromDate(new Date());
	$: {
		const qsDate = $page.url.searchParams.get('date');
		if (qsDate) date = qsDate;
	}

	let readiness = 'normal' as Readiness;
	let completed: Partial<Record<Exclude<ActivityKey, RepeatableActivityKey>, boolean>> = {};
	let counts: Partial<Record<RepeatableActivityKey, number>> = {};
	let notes = '';

	let loading = false;
	let saving = false;
	let lastSavedAt: number | null = null;
	let saveError: string | null = null;

	let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
	let autosaveQueued = false;
	let lastSavedSnapshot = '';
	let ignoreNextChange = false;

	const groups = Array.from(new Set(ACTIVITY_DEFINITIONS.map((a) => a.group)));

	$: scores = computeDayScores({
		date,
		readiness,
		completed,
		counts,
		notes,
		createdAt: 0,
		updatedAt: 0
	} satisfies ScoringDayLog as any) as DayScores;

	function computeSnapshot() {
		return JSON.stringify({ date, readiness, completed, counts, notes });
	}

	async function loadForDate(d: IsoDateString) {
		loading = true;
		try {
			const existing = await getDayLog(d);
			ignoreNextChange = true;

			if (existing) {
				readiness = existing.readiness as Readiness;
				completed = existing.completed ?? {};
				counts = ((existing as any).counts ?? {}) as Partial<Record<RepeatableActivityKey, number>>;
				notes = existing.notes ?? '';
				lastSavedAt = existing.updatedAt;
				lastSavedSnapshot = JSON.stringify({
					date: existing.date,
					readiness: existing.readiness,
					completed: existing.completed,
					counts: (existing as any).counts,
					notes: existing.notes
				});
			} else {
				readiness = 'normal' as unknown as Readiness;
				completed = {};
				counts = {};
				notes = '';
				lastSavedAt = null;
				lastSavedSnapshot = JSON.stringify({
					date: d,
					readiness: 'normal',
					completed: {},
					counts: {},
					notes: ''
				});
			}

			saveError = null;
		} finally {
			loading = false;
		}
	}

	async function save(reason: 'manual' | 'autosave') {
		if (saving) {
			autosaveQueued = autosaveQueued || reason === 'autosave';
			return;
		}

		saveError = null;
		saving = true;
		try {
			const saved = await upsertDayLog({
				date,
				readiness,
				completed,
				counts,
				notes
			} as any);
			lastSavedAt = saved.updatedAt;
			lastSavedSnapshot = computeSnapshot();
		} catch (e) {
			saveError = e instanceof Error ? e.message : 'Failed to save.';
		} finally {
			saving = false;
			if (autosaveQueued) {
				autosaveQueued = false;
				queueAutosave();
			}
		}
	}

	function toggle(key: ActivityKey, checked: boolean) {
		completed = { ...completed, [key]: checked };
	}

	function setCount(key: ActivityKey, count: number) {
		const safe = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
		counts = { ...counts, [key]: safe };
	}

	function queueAutosave() {
		if (loading) return;
		if (ignoreNextChange) {
			ignoreNextChange = false;
			return;
		}

		const snapshot = computeSnapshot();
		if (snapshot === lastSavedSnapshot) return;

		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveTimer = setTimeout(() => {
			autosaveTimer = null;
			void save('autosave');
		}, 650);
	}

	$: queueAutosave();

	function onSaveClick() {
		void save('manual');
	}

	function activitiesForGroup(group: string) {
		return ACTIVITY_DEFINITIONS.filter((a) => a.group === group);
	}

	function addDays(iso: IsoDateString, days: number): IsoDateString {
		// Parse as UTC noon to avoid timezone shifts across DST.
		const dt = new Date(`${iso}T12:00:00.000Z`);
		if (!Number.isFinite(dt.getTime())) return iso;
		dt.setUTCDate(dt.getUTCDate() + days);
		return isoDateFromDate(dt);
	}

	function goToDate(next: IsoDateString) {
		const url = new URL($page.url);
		url.searchParams.set('date', next);
		goto(url.pathname + url.search, { replaceState: false, keepFocus: true, noScroll: true });
	}

	onMount(() => {
		void loadForDate(date);
	});

	let lastLoadedDate: IsoDateString | null = null;
	$: if (lastLoadedDate !== date && typeof window !== 'undefined') {
		lastLoadedDate = date;
		void loadForDate(date);
	}
</script>

<h1>Daily Log</h1>

<div class="controls">
	<div class="dateControl">
		<label>
			<span>Date</span>
			<input type="date" bind:value={date} />
		</label>

		<div class="dateNav" aria-label="Day navigation">
			<button type="button" class="ghost" on:click={() => goToDate(addDays(date, -1))}>
				Prev
			</button>
			<button type="button" class="ghost" on:click={() => goToDate(addDays(date, 1))}>
				Next
			</button>
		</div>
	</div>

	<label>
		<span>Readiness</span>
		<select bind:value={readiness}>
			{#each readinessLevels as r (r)}
				<option value={r}>{formatRatingLabel(READINESS_LABELS[r])}</option>
			{/each}
		</select>
	</label>
</div>

{#if loading}
	<p>Loading...</p>
{:else}
	<div class="grid">
		<div class="left">
			{#each groups as g (g)}
				<ActivityGroup
					group={g}
					activities={activitiesForGroup(g)}
					{completed}
					counts={counts as unknown as Partial<Record<ActivityKey, number>>}
					onToggle={toggle}
					onCountChange={setCount}
				/>
			{/each}
		</div>

		<aside class="right">
			<section class="card">
				<h2>Summary</h2>
				<div class="kv">
					<span>Mobility</span><span>{(scores as any).rawByCategory.mobility}</span>
				</div>
				<div class="kv">
					<span>Conditioning</span><span>{(scores as any).rawByCategory.conditioning}</span>
				</div>
				<div class="kv">
					<span>Strength</span><span>{(scores as any).rawByCategory.strength}</span>
				</div>
				<div class="kv">
					<span>Nutrition</span><span>{(scores as any).rawByCategory.nutrition}</span>
				</div>
				<div class="kv">
					<span>Miscellaneous</span><span>{(scores as any).rawByCategory.miscellaneous}</span>
				</div>
				<hr />
				<div class="kv">
					<span>Training (capped)</span><span>{(scores as any).cappedTrainingPoints}</span>
				</div>
				<div class="kv">
					<span>Lifestyle (capped)</span><span>{(scores as any).cappedLifestylePoints}</span>
				</div>
				<div class="kv"><span>Total</span><span>{scores.totalPoints}</span></div>
				<hr />
				<div class="kv">
					<span>MED met</span><span>{(scores as any).medMet ? 'yes' : 'no'}</span>
				</div>
				<div class="kv"><span>Daily win</span><span>{scores.dailyWin ? 'yes' : 'no'}</span></div>
				<div class="kv">
					<span>Training rating</span>
					<span>{formatRatingLabel(TRAINING_RATING_LABELS[scores.trainingRating])}</span>
				</div>
				<div class="kv">
					<span>Lifestyle rating</span>
					<span>{formatRatingLabel(LIFESTYLE_RATING_LABELS[scores.lifestyleRating])}</span>
				</div>
			</section>

			<section class="card">
				<h2>Notes</h2>
				<textarea rows={6} bind:value={notes}></textarea>
			</section>

			<button class="save" on:click={onSaveClick} disabled={saving}>
				{saving ? 'Saving...' : 'Save'}
			</button>
			{#if saveError}
				<p class="error">{saveError}</p>
			{/if}
			{#if lastSavedAt}
				<p class="muted">Saved {new Date(lastSavedAt).toLocaleString()}</p>
			{/if}
		</aside>
	</div>
{/if}

<style>
	.controls {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		margin: 16px 0;
	}

	.controls label {
		display: grid;
		gap: 6px;
	}

	.controls label span {
		font-size: 12px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--muted);
	}

	.dateControl {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: end;
		gap: 10px;
	}

	.dateNav {
		display: flex;
		gap: 6px;
	}

	.ghost {
		height: 42px;
		padding: 0 10px;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background: color-mix(in srgb, var(--surface) 75%, var(--bg));
		color: var(--text);
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		cursor: pointer;
	}

	.ghost:hover {
		background: color-mix(in srgb, var(--surface) 70%, var(--text));
	}

	.ghost:active {
		transform: translateY(1px);
	}

	.controls input,
	.controls select {
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 10px 10px;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 16px;
	}

	.left {
		display: grid;
		gap: 12px;
	}

	.card {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 12px;
		background: var(--surface);
	}

	.right {
		display: grid;
		gap: 12px;
		align-content: start;
		position: sticky;
		top: 56px;
		height: fit-content;
	}

	.card h2 {
		margin: 0 0 8px;
		font-size: 13px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.kv {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: baseline;
		justify-content: space-between;
		padding: 6px 0;
		gap: 12px;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	hr {
		border: 0;
		border-top: 1px solid var(--border);
		margin: 10px 0;
	}

	textarea {
		width: 100%;
		resize: vertical;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text);
		border-radius: var(--radius);
		padding: 10px 10px;
	}

	.save {
		width: 100%;
		padding: 10px 12px;
		border-radius: var(--radius);
		border: 1px solid var(--primary);
		background: var(--primary);
		color: var(--primary-text);
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.save:hover {
		filter: brightness(1.05);
	}

	.save:active {
		transform: translateY(1px);
	}

	.save:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.save:disabled:hover {
		filter: none;
	}

	.muted {
		color: var(--muted);
		font-size: 12px;
		margin-top: 8px;
		font-family: var(--font-mono);
	}

	.error {
		margin-top: 8px;
		color: #ef4444;
		font-size: 13px;
	}

	@media (max-width: 900px) {
		.controls {
			grid-template-columns: 1fr;
		}
		.dateControl {
			grid-template-columns: 1fr;
		}
		.dateNav {
			justify-content: stretch;
		}
		.ghost {
			flex: 1;
		}
		.grid {
			grid-template-columns: 1fr;
		}
		.right {
			position: static;
			top: auto;
		}
	}
</style>
