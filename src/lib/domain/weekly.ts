import { computeDayScores, type DayScores } from './scoring';
import type { DayLog, IsoDateString } from './types';

export type WeeklyRating =
	| 'needs_improvement'
	| 'minimum'
	| 'solid'
	| 'great'
	| 'amazing'
	| 'above_and_beyond';

export type WeeklyStreaks = {
	winStreakDays: number;
	consistencyStreakWeeks: number;
};

export function computeWinStreakDays(days: DayLog[]): number {
	const sorted = days.slice().sort((a, b) => (a.date > b.date ? 1 : -1));
	let streak = 0;
	for (let i = sorted.length - 1; i >= 0; i--) {
		const scores = computeDayScores(sorted[i]);
		if (!scores.dailyWin) break;
		streak += 1;
	}
	return streak;
}

export function computeConsistencyStreakWeeks(weeks: WeeklySummary[]): number {
	const sorted = weeks.slice().sort((a, b) => (a.weekStart > b.weekStart ? 1 : -1));
	let streak = 0;
	for (let i = sorted.length - 1; i >= 0; i--) {
		const w = sorted[i];
		const meetsWeeklyMinimum = w.trainingPoints >= 175;
		const meetsMissedConstraint = w.missedDays < 2;
		if (!meetsWeeklyMinimum || !meetsMissedConstraint) break;
		streak += 1;
	}
	return streak;
}

export type DeloadReason = 'scheduled' | 'fatigued_days' | 'high_average';

type EvaluatedWeek = {
	weekStart: IsoDateString;
	days: DayLog[];
	summary: WeeklySummary;
};

function average(nums: number[]): number {
	if (nums.length === 0) return 0;
	return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}

export function computeWeekDeload(
	weekStart: IsoDateString,
	days: DayLog[],
	context: {
		priorWeeks: Array<{
			weekStart: IsoDateString;
			days: DayLog[];
			deload: boolean;
			trainingPoints: number;
		}>;
	}
): { deload: boolean; reasons: DeloadReason[] } {
	const reasons = new Set<DeloadReason>();

	const nonDeloadStreak = (() => {
		let streak = 0;
		for (const w of context.priorWeeks
			.slice()
			.sort((a, b) => (a.weekStart > b.weekStart ? 1 : -1))) {
			if (w.deload) streak = 0;
			else streak += 1;
		}
		return streak;
	})();
	if (nonDeloadStreak >= 3) reasons.add('scheduled');

	const fatiguedDays = days.reduce((acc, d) => acc + (d.readiness === 'fatigued' ? 1 : 0), 0);
	if (fatiguedDays >= 4) reasons.add('fatigued_days');

	const last3 = context.priorWeeks
		.slice()
		.sort((a, b) => (a.weekStart > b.weekStart ? 1 : -1))
		.slice(-3);
	if (last3.length >= 3 && average(last3.map((w) => w.trainingPoints)) > 350)
		reasons.add('high_average');

	return { deload: reasons.size > 0, reasons: Array.from(reasons) };
}

export function computeWeeklySummaries(
	weeks: Array<{ weekStart: IsoDateString; days: DayLog[] }>
): WeeklySummary[] {
	const sortedWeeks = weeks.slice().sort((a, b) => (a.weekStart > b.weekStart ? 1 : -1));
	const evaluated: EvaluatedWeek[] = [];

	for (const w of sortedWeeks) {
		const priorWeeks = evaluated.map((e) => ({
			weekStart: e.weekStart,
			days: e.days,
			deload: e.summary.deload,
			trainingPoints: e.summary.trainingPoints
		}));

		const deloadEval = computeWeekDeload(w.weekStart, w.days, { priorWeeks });
		const summary = computeWeeklySummary(w.weekStart, w.days, {
			deload: deloadEval.deload,
			deloadReasons: deloadEval.reasons
		});

		evaluated.push({ weekStart: w.weekStart, days: w.days, summary });
	}

	return evaluated.map((e) => e.summary).sort((a, b) => (a.weekStart > b.weekStart ? -1 : 1));
}

export type WeeklySummary = {
	weekStart: string;
	deload: boolean;
	deloadReasons: DeloadReason[];

	trainingPoints: number;
	weeklyRating: WeeklyRating;

	wins: number;
	missedDays: number;
	fatiguedDays: number;

	days: Array<{ day: DayLog; scores: DayScores }>;
};

const WEEKLY_THRESHOLDS = { minimum: 175, solid: 259, great: 329, amazing: 371, above: 420 };

function computeWeeklyRating(trainingPoints: number, deload: boolean): WeeklyRating {
	const t = deload
		? {
				minimum: WEEKLY_THRESHOLDS.minimum * 0.5,
				solid: WEEKLY_THRESHOLDS.solid * 0.5,
				great: WEEKLY_THRESHOLDS.great * 0.5,
				amazing: WEEKLY_THRESHOLDS.amazing * 0.5,
				above: WEEKLY_THRESHOLDS.above * 0.5
			}
		: WEEKLY_THRESHOLDS;

	if (trainingPoints >= t.above) return 'above_and_beyond';
	if (trainingPoints >= t.amazing) return 'amazing';
	if (trainingPoints >= t.great) return 'great';
	if (trainingPoints >= t.solid) return 'solid';
	if (trainingPoints >= t.minimum) return 'minimum';
	return 'needs_improvement';
}

export function computeWeeklySummary(
	weekStart: string,
	days: DayLog[],
	options?: { deload?: boolean; deloadReasons?: DeloadReason[] }
): WeeklySummary {
	const deload = options?.deload ?? false;
	const deloadReasons = options?.deloadReasons ?? [];
	const derived = days.map((day) => ({ day, scores: computeDayScores(day, { deload }) }));

	const trainingPoints = derived.reduce((acc, d) => acc + d.scores.cappedTrainingPoints, 0);
	const wins = derived.reduce((acc, d) => acc + (d.scores.dailyWin ? 1 : 0), 0);
	const missedDays = derived.reduce(
		(acc, d) => acc + (d.scores.trainingRating === 'missed' ? 1 : 0),
		0
	);
	const fatiguedDays = derived.reduce(
		(acc, d) => acc + (d.day.readiness === 'fatigued' ? 1 : 0),
		0
	);

	return {
		weekStart,
		deload,
		deloadReasons,
		trainingPoints,
		weeklyRating: computeWeeklyRating(trainingPoints, deload),
		wins,
		missedDays,
		fatiguedDays,
		days: derived.sort((a, b) => (a.day.date > b.day.date ? -1 : 1))
	};
}
