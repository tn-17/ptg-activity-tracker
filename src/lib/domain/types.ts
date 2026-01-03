export type IsoDateString = string;

export type Readiness = 'fatigued' | 'normal' | 'good';

export type ActivityCategory =
	| 'mobility'
	| 'conditioning'
	| 'strength'
	| 'nutrition'
	| 'miscellaneous';

export type ActivityKey =
	| 'mobility_lower_body_limber_11'
	| 'mobility_upper_body_simple_6'
	| 'mobility_lower_back_stretches'
	| 'conditioning_jumps_throws'
	| 'conditioning_easy'
	| 'conditioning_medium'
	| 'conditioning_hard'
	| 'strength_push'
	| 'strength_pull'
	| 'strength_legs'
	| 'strength_abs'
	| 'strength_compression'
	| 'nutrition_omad'
	| 'nutrition_no_carbs'
	| 'nutrition_protein_goal'
	| 'nutrition_fat_goal'
	| 'nutrition_water_goal'
	| 'misc_wake_up_early'
	| 'misc_exercise_immediately'
	| 'misc_cold_shower';

export type RepeatableActivityKey =
	| 'conditioning_easy'
	| 'conditioning_medium'
	| 'conditioning_hard';

export type ActivityDefinition = {
	key: ActivityKey;
	label: string;
	category: ActivityCategory;
	points: number;
	group: string;
	repeatable?: boolean;
	durationMinutes?: number;
};

export type DayLog = {
	date: IsoDateString;
	readiness: Readiness;
	completed: Partial<Record<Exclude<ActivityKey, RepeatableActivityKey>, boolean>>;
	counts: Partial<Record<RepeatableActivityKey, number>>;
	notes?: string;
	createdAt: number;
	updatedAt: number;
};
