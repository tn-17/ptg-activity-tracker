export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

export function getStoredThemePreference(): ThemePreference {
	if (typeof window === 'undefined') return 'system';
	const raw = window.localStorage.getItem(STORAGE_KEY);
	return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

export function storeThemePreference(pref: ThemePreference): void {
	window.localStorage.setItem(STORAGE_KEY, pref);
}

export function computeEffectiveTheme(pref: ThemePreference): 'light' | 'dark' {
	if (pref === 'light' || pref === 'dark') return pref;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemeToDocument(theme: 'light' | 'dark'): void {
	document.documentElement.dataset.theme = theme;
	document.documentElement.style.colorScheme = theme;
}
