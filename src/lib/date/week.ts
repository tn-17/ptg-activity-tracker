import type { IsoDateString } from '$lib/domain/types';

export type WeekId = `${number}-W${string}`;

export function isoDateFromDate(date: Date): IsoDateString {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function sundayWeekStart(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	const day = d.getDay();
	d.setDate(d.getDate() - day);
	return d;
}

export function getSundayWeekId(isoDate: IsoDateString): string {
	const [y, m, d] = isoDate.split('-').map(Number);
	const dt = new Date(y, m - 1, d);
	const start = sundayWeekStart(dt);
	const y2 = start.getFullYear();
	const m2 = String(start.getMonth() + 1).padStart(2, '0');
	const d2 = String(start.getDate()).padStart(2, '0');
	return `${y2}-${m2}-${d2}`;
}

export function addDays(isoDate: IsoDateString, daysToAdd: number): IsoDateString {
	const [y, m, d] = isoDate.split('-').map(Number);
	const dt = new Date(y, m - 1, d);
	dt.setDate(dt.getDate() + daysToAdd);
	return isoDateFromDate(dt);
}

export function getSundayWeekRange(isoDate: IsoDateString): {
	start: IsoDateString;
	end: IsoDateString;
} {
	const start = getSundayWeekId(isoDate) as IsoDateString;
	const end = addDays(start, 6);
	return { start, end };
}
