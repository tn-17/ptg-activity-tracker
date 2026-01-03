<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		applyThemeToDocument,
		computeEffectiveTheme,
		getStoredThemePreference,
		storeThemePreference,
		type ThemePreference
	} from '$lib/theme';
	import { resolve } from '$app/paths';

	$: pathname = String($page.url.pathname);

	let themePreference: ThemePreference = 'system';
	let effectiveTheme: 'light' | 'dark' = 'light';

	function syncTheme() {
		effectiveTheme = computeEffectiveTheme(themePreference);
		applyThemeToDocument(effectiveTheme);
	}

	function cycleThemePreference() {
		themePreference =
			themePreference === 'system' ? 'light' : themePreference === 'light' ? 'dark' : 'system';
		storeThemePreference(themePreference);
		syncTheme();
	}

	let mql: MediaQueryList | null = null;
	const onMqlChange = () => {
		if (themePreference !== 'system') return;
		syncTheme();
	};

	onMount(() => {
		themePreference = getStoredThemePreference();
		mql = window.matchMedia('(prefers-color-scheme: dark)');
		mql.addEventListener('change', onMqlChange);
		syncTheme();
	});

	onDestroy(() => {
		mql?.removeEventListener('change', onMqlChange);
	});

	const logHref = resolve('/log');
	const historyHref = resolve('/history');
	const weekHref = resolve('/week');
</script>

<nav class="nav">
	<div class="links">
		<a href={logHref} class:active={pathname === '/log'}>Log</a>
		<a href={historyHref} class:active={pathname === '/history'}>History</a>
		<a href={weekHref} class:active={pathname === '/week'}>Week</a>
	</div>

	<button
		type="button"
		class="theme"
		on:click={cycleThemePreference}
		aria-label={`Theme: ${themePreference}. Click to change.`}
		title={`Theme: ${themePreference}`}
	>
		{#if themePreference === 'system'}
			System
		{:else if themePreference === 'light'}
			Light
		{:else}
			Dark
		{/if}
	</button>
</nav>

<style>
	.nav {
		display: flex;
		gap: 12px;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px;
		border-bottom: 1px solid var(--border);
		background: var(--bg);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.links {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 3px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--surface) 70%, var(--bg));
	}

	.nav a {
		text-decoration: none;
		color: var(--text);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 12px;
		padding: 8px 10px;
		border-radius: calc(var(--radius) - 1px);
	}

	.nav a:hover {
		background: color-mix(in srgb, var(--surface) 85%, var(--text));
	}

	.nav a.active {
		background: var(--text);
		color: var(--bg);
	}

	.theme {
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		padding: 8px 10px;
		border-radius: var(--radius);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 12px;
		cursor: pointer;
		min-width: 88px;
		text-align: center;
	}

	.theme:hover {
		background: color-mix(in srgb, var(--surface) 85%, var(--text));
	}

	.theme:active {
		transform: translateY(1px);
	}

	@media (max-width: 520px) {
		.nav {
			padding: 10px 12px;
		}
		.links {
			gap: 4px;
		}
		.nav a {
			padding: 8px 8px;
		}
	}
</style>
