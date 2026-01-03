import type { LifestyleRating, TrainingRating } from './scoring';
import type { WeeklyRating } from './weekly';
import type { Readiness } from './types';

export type RatingLabel = {
	emoji: string;
	label: string;
};

export function formatRatingLabel(r: RatingLabel): string {
	return `${r.emoji} ${r.label}`;
}

export const TRAINING_RATING_LABELS: Record<TrainingRating, RatingLabel> = {
	missed: { emoji: '❌', label: 'Missed' },
	okay: { emoji: '👍', label: 'Okay' },
	solid: { emoji: '✅', label: 'Solid' },
	great: { emoji: '🌟', label: 'Great' },
	amazing: { emoji: '🔥', label: 'Amazing' },
	above_and_beyond: { emoji: '🚀', label: 'Above & Beyond' }
};

export const LIFESTYLE_RATING_LABELS: Record<LifestyleRating, RatingLabel> = {
	missed: { emoji: '❌', label: 'Missed' },
	okay: { emoji: '👍', label: 'Okay' },
	solid: { emoji: '✅', label: 'Solid' },
	great: { emoji: '⭐', label: 'Great' }
};

export const WEEKLY_RATING_LABELS: Record<WeeklyRating, RatingLabel> = {
	needs_improvement: { emoji: '❌', label: 'Needs improvement' },
	minimum: { emoji: '👍', label: 'Minimum' },
	solid: { emoji: '✅', label: 'Solid' },
	great: { emoji: '🌟', label: 'Great' },
	amazing: { emoji: '🔥', label: 'Amazing' },
	above_and_beyond: { emoji: '🚀', label: 'Above & Beyond' }
};

export const READINESS_LABELS: Record<Readiness, RatingLabel> = {
	fatigued: { emoji: '🔴', label: 'Fatigued' },
	normal: { emoji: '🟡', label: 'Normal' },
	good: { emoji: '🟢', label: 'Good' }
};
