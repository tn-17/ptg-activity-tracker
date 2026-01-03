import type { ActivityDefinition } from './types';

export const TRAINING_CAP_POINTS = 63;
export const LIFESTYLE_CAP_POINTS = 45;

export const ACTIVITY_DEFINITIONS: ActivityDefinition[] = [
	{
		key: 'mobility_lower_body_limber_11',
		label: 'Lower body mobility (Limber 11)',
		category: 'mobility',
		points: 3,
		group: 'Mobility'
	},
	{
		key: 'mobility_upper_body_simple_6',
		label: 'Upper body mobility (Simple 6)',
		category: 'mobility',
		points: 3,
		group: 'Mobility'
	},
	{
		key: 'mobility_lower_back_stretches',
		label: 'Lower back stretches',
		category: 'mobility',
		points: 2,
		group: 'Mobility'
	},
	{
		key: 'conditioning_jumps_throws',
		label: 'Jumps & throws',
		category: 'conditioning',
		points: 3,
		group: 'Conditioning'
	},
	{
		key: 'conditioning_easy',
		label: 'Easy conditioning',
		category: 'conditioning',
		points: 5,
		group: 'Conditioning',
		repeatable: true,
		durationMinutes: 15
	},
	{
		key: 'conditioning_medium',
		label: 'Medium conditioning',
		category: 'conditioning',
		points: 7,
		group: 'Conditioning',
		repeatable: true,
		durationMinutes: 10
	},
	{
		key: 'conditioning_hard',
		label: 'Hard conditioning',
		category: 'conditioning',
		points: 8,
		group: 'Conditioning',
		repeatable: true,
		durationMinutes: 5
	},
	{
		key: 'strength_push',
		label: 'Push',
		category: 'strength',
		points: 7,
		group: 'Strength'
	},
	{
		key: 'strength_pull',
		label: 'Pull',
		category: 'strength',
		points: 7,
		group: 'Strength'
	},
	{
		key: 'strength_legs',
		label: 'Legs',
		category: 'strength',
		points: 10,
		group: 'Strength'
	},
	{
		key: 'strength_abs',
		label: 'Abs',
		category: 'strength',
		points: 5,
		group: 'Strength'
	},
	{
		key: 'strength_compression',
		label: 'Compression',
		category: 'strength',
		points: 3,
		group: 'Strength'
	},
	{
		key: 'nutrition_omad',
		label: 'OMAD',
		category: 'nutrition',
		points: 8,
		group: 'Nutrition'
	},
	{
		key: 'nutrition_no_carbs',
		label: 'No carbs',
		category: 'nutrition',
		points: 10,
		group: 'Nutrition'
	},
	{
		key: 'nutrition_protein_goal',
		label: 'Protein goal',
		category: 'nutrition',
		points: 3,
		group: 'Nutrition'
	},
	{
		key: 'nutrition_fat_goal',
		label: 'Fat goal',
		category: 'nutrition',
		points: 5,
		group: 'Nutrition'
	},
	{
		key: 'nutrition_water_goal',
		label: 'Water goal',
		category: 'nutrition',
		points: 2,
		group: 'Nutrition'
	},
	{
		key: 'misc_wake_up_early',
		label: 'Wake up early',
		category: 'miscellaneous',
		points: 8,
		group: 'Miscellaneous'
	},
	{
		key: 'misc_exercise_immediately',
		label: 'Exercise immediately after waking up',
		category: 'miscellaneous',
		points: 6,
		group: 'Miscellaneous'
	},
	{
		key: 'misc_cold_shower',
		label: 'Cold shower for one minute',
		category: 'miscellaneous',
		points: 3,
		group: 'Miscellaneous'
	}
];
