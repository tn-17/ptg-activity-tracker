<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	onMount(() => {
		console.log('Base path:', base);
		const target = `${base}/log`;
		console.log('Navigating to:', target);
		goto(target);
	});
</script>

<p>Redirecting to {base}/log…</p>
