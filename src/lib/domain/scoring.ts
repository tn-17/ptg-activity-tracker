import { ACTIVITY_DEFINITIONS, LIFESTYLE_CAP_POINTS, TRAINING_CAP_POINTS } from './activities';
import type { ActivityCategory, ActivityKey, DayLog } from './types';

export type TrainingRating = 'missed' | 'okay' | 'solid' | 'great' | 'amazing' | 'above_and_beyond';

export type LifestyleRating = 'missed' | 'okay' | 'solid' | 'great';

export type DayScores = {
	rawByCategory: Record<ActivityCategory, number>;
	cappedTrainingPoints: number;
	cappedLifestylePoints: number;
	totalPoints: number;

	medMet: boolean;
	dailyWin: boolean;

	trainingRating: TrainingRating;
	lifestyleRating: LifestyleRating;
};

function pointsByKey(): Map<ActivityKey, number> {
	return new Map(ACTIVITY_DEFINITIONS.map((a) => [a.key, a.points] as const));
}

function categoryByKey(): Map<ActivityKey, ActivityCategory> {
	return new Map(ACTIVITY_DEFINITIONS.map((a) => [a.key, a.category] as const));
}

function sumNonRepeatables(day: DayLog): Record<ActivityCategory, number> {
	const byCategory: Record<ActivityCategory, number> = {
		mobility: 0,
		conditioning: 0,
		strength: 0,
		nutrition: 0,
		miscellaneous: 0
	};

	const pts = pointsByKey();
	const cat = categoryByKey();

	for (const [key, done] of Object.entries(day.completed) as Array<[ActivityKey, boolean]>) {
		if (!done) continue;
		const category = cat.get(key);
		if (!category) continue;
		byCategory[category] += pts.get(key) ?? 0;
	}

	return byCategory;
}

function sumRepeatables(day: DayLog): Record<ActivityCategory, number> {
	const byCategory: Record<ActivityCategory, number> = {
		mobility: 0,
		conditioning: 0,
		strength: 0,
		nutrition: 0,
		miscellaneous: 0
	};

	const pts = pointsByKey();
	const cat = categoryByKey();

	for (const [key, countRaw] of Object.entries(day.counts) as Array<[ActivityKey, number]>) {
		const count = Number.isFinite(countRaw) ? Math.max(0, Math.floor(countRaw)) : 0;
		if (count <= 0) continue;
		const category = cat.get(key);
		if (!category) continue;
		byCategory[category] += (pts.get(key) ?? 0) * count;
	}

	return byCategory;
}

type ScoringOptions = {
	deload?: boolean;
};

function computeMedMet(day: DayLog, options?: ScoringOptions): boolean {
	const deload = options?.deload ?? false;

	const mobilityMet =
		Boolean(day.completed.mobility_lower_body_limber_11) ||
		Boolean(day.completed.mobility_upper_body_simple_6);

	const strengthMet = deload
		? Boolean(day.completed.strength_push) ||
			Boolean(day.completed.strength_pull) ||
			Boolean(day.completed.strength_legs)
		: (Boolean(day.completed.strength_push) || Boolean(day.completed.strength_pull)) &&
			Boolean(day.completed.strength_legs);

	const conditioningMet = deload
		? (day.counts.conditioning_easy ?? 0) > 0
		: (day.counts.conditioning_easy ?? 0) > 0 ||
			(day.counts.conditioning_medium ?? 0) > 0 ||
			(day.counts.conditioning_hard ?? 0) > 0;

	return mobilityMet && strengthMet && conditioningMet;
}

function computeTrainingRating(trainingPoints: number, medMet: boolean): TrainingRating {
	if (!medMet) return 'missed';

	if (trainingPoints < 37) return 'okay';
	if (trainingPoints < 47) return 'solid';
	if (trainingPoints < 53) return 'great';
	if (trainingPoints < 60) return 'amazing';
	return 'above_and_beyond';
}

function computeLifestyleRating(lifestylePoints: number): LifestyleRating {
	if (lifestylePoints < 12) return 'missed';
	if (lifestylePoints < 22) return 'okay';
	if (lifestylePoints < 32) return 'solid';
	return 'great';
}

export function computeDayScores(day: DayLog, options?: ScoringOptions): DayScores {
	const nonRepeatable = sumNonRepeatables(day);
	const repeatable = sumRepeatables(day);

	const rawByCategory: Record<ActivityCategory, number> = {
		mobility: nonRepeatable.mobility + repeatable.mobility,
		conditioning: nonRepeatable.conditioning + repeatable.conditioning,
		strength: nonRepeatable.strength + repeatable.strength,
		nutrition: nonRepeatable.nutrition + repeatable.nutrition,
		miscellaneous: nonRepeatable.miscellaneous + repeatable.miscellaneous
	};

	const rawTrainingPoints =
		rawByCategory.mobility + rawByCategory.conditioning + rawByCategory.strength;
	const rawLifestylePoints = rawByCategory.nutrition + rawByCategory.miscellaneous;

	const cappedTrainingPoints = Math.min(rawTrainingPoints, TRAINING_CAP_POINTS);
	const cappedLifestylePoints = Math.min(rawLifestylePoints, LIFESTYLE_CAP_POINTS);
	const totalPoints = cappedTrainingPoints + cappedLifestylePoints;

	const medMet = computeMedMet(day, options);
	const dailyWin = medMet;

	const trainingRating = computeTrainingRating(cappedTrainingPoints, medMet);
	const lifestyleRating = computeLifestyleRating(cappedLifestylePoints);

	return {
		rawByCategory,
		cappedTrainingPoints,
		cappedLifestylePoints,
		totalPoints,
		medMet,
		dailyWin,
		trainingRating,
		lifestyleRating
	};
}
