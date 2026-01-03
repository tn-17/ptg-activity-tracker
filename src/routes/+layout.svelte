<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';
	import PwaReloadPrompt from '$lib/components/PwaReloadPrompt.svelte';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
	<title>PTG Activity Tracker</title>

	<link rel="icon" href={favicon} />

	<link rel="manifest" href="{base}/manifest.webmanifest" />
	<meta name="theme-color" content="#111827" />

	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="PTG Activity Tracker" />
	<link rel="apple-touch-icon" href="{base}/icons/apple-touch-icon.png" />

	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<Nav />
<PwaReloadPrompt />

<main class="main">
	{@render children()}
</main>

<style>
	.main {
		max-width: 960px;
		margin: 0 auto;
		padding: 16px;
	}
</style>
