import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		serviceWorker: {
			register: false
		},
		adapter: adapter({
			fallback: '200.html'
		}),
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/ptg-activity-tracker' : ''
		}
	}
};

export default config;
