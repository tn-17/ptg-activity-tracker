import type { DBSchema } from 'idb';

import type { DayLog, IsoDateString } from '$lib/domain/types';

export const DB_NAME = 'activity-tracker';
export const DB_VERSION = 3;

export type ActivityTrackerDbSchema = DBSchema & {
	dayLogs: {
		key: IsoDateString;
		value: DayLog;
		indexes: { 'by-updatedAt': number };
	};
};
