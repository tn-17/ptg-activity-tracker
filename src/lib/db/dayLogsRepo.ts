import type { DayLog, IsoDateString } from '$lib/domain/types';

import { getDb } from './client';

export async function upsertDayLog(
	input: Omit<DayLog, 'createdAt' | 'updatedAt'>
): Promise<DayLog> {
	const db = await getDb();
	const existing = await db.get('dayLogs', input.date);

	const now = Date.now();
	const toSave: DayLog = {
		...input,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now
	};

	await db.put('dayLogs', toSave);
	return toSave;
}

export async function getDayLog(date: IsoDateString): Promise<DayLog | undefined> {
	const db = await getDb();
	return db.get('dayLogs', date);
}

export async function listDayLogsByUpdatedAtDesc(limit = 200): Promise<DayLog[]> {
	const db = await getDb();
	const tx = db.transaction('dayLogs', 'readonly');
	const index = tx.store.index('by-updatedAt');
	const all = await index.getAll(undefined, limit);
	await tx.done;
	return all.slice().sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function listDayLogsInRange(
	startInclusive: IsoDateString,
	endInclusive: IsoDateString
): Promise<DayLog[]> {
	const db = await getDb();
	const keys = await db.getAllKeys('dayLogs');

	return Promise.all(
		keys.filter((k) => k >= startInclusive && k <= endInclusive).map((k) => db.get('dayLogs', k))
	).then((values) => values.filter((v): v is DayLog => Boolean(v)));
}

export async function deleteDayLog(date: IsoDateString): Promise<void> {
	const db = await getDb();
	await db.delete('dayLogs', date);
}
