import { openDB, type IDBPDatabase } from 'idb';

import { DB_NAME, DB_VERSION, type ActivityTrackerDbSchema } from './schema';

let dbPromise: Promise<IDBPDatabase<ActivityTrackerDbSchema>> | undefined;
let db: IDBPDatabase<ActivityTrackerDbSchema> | undefined;

export function getDb(): Promise<IDBPDatabase<ActivityTrackerDbSchema>> {
	if (!dbPromise) {
		dbPromise = openDB<ActivityTrackerDbSchema>(DB_NAME, DB_VERSION, {
			upgrade(db, _oldVersion, _newVersion, transaction) {
				if (!db.objectStoreNames.contains('dayLogs')) {
					const store = db.createObjectStore('dayLogs', { keyPath: 'date' });
					store.createIndex('by-updatedAt', 'updatedAt');
					return;
				}

				const store = transaction.objectStore('dayLogs');
				if (!store.indexNames.contains('by-updatedAt')) {
					store.createIndex('by-updatedAt', 'updatedAt');
				}
			},
			blocked() {
				console.warn(`IndexedDB upgrade blocked for ${DB_NAME}. Close other tabs/windows.`);
			},
			blocking() {
				console.warn(`IndexedDB connection is blocking a newer version for ${DB_NAME}. Closing.`);
				db?.close();
			},
			terminated() {
				console.warn(`IndexedDB connection terminated unexpectedly for ${DB_NAME}.`);
			}
		}).then((opened) => {
			db = opened;
			db.onversionchange = () => {
				db?.close();
			};
			return opened;
		});
	}

	return dbPromise;
}
