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
</script>

<nav class="nav">
	<div class="links">
		<a href="/log" class:active={pathname === '/log'}>Log</a>
		<a href="/history" class:active={pathname === '/history'}>History</a>
		<a href="/week" class:active={pathname === '/week'}>Week</a>
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
		gap: 16px;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid var(--border);
		background: var(--bg);
	}
	.links {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.nav a {
		text-decoration: none;
		color: inherit;
		font-weight: 600;
	}
	.nav a.active {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.theme {
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		padding: 6px 10px;
		border-radius: 999px;
		font-weight: 700;
		cursor: pointer;
	}
	.theme:hover {
		filter: brightness(0.98);
	}
	:root[data-theme='dark'] .theme:hover {
		filter: brightness(1.08);
	}
</style>
