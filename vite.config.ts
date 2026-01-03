import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'prompt',
			injectRegister: 'auto',
			manifest: {
				id: '/ptg-activity-tracker/',
				name: 'PTG Activity Tracker',
				short_name: 'PTG',
				description: 'Daily training scoring and tracking.',
				start_url: '/ptg-activity-tracker/',
				scope: '/ptg-activity-tracker/',
				display: 'standalone',
				background_color: '#f9fafb',
				theme_color: '#111827',
				icons: [
					{
						src: '/ptg-activity-tracker/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/ptg-activity-tracker/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/ptg-activity-tracker/manifest-icon-192.maskable.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: '/ptg-activity-tracker/manifest-icon-512.maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				navigateFallback: '/ptg-activity-tracker/200.html',
				additionalManifestEntries: [],
				navigateFallbackDenylist: [
					/^\/api\//,
					/\/assets\//,
					/\/app\//,
					/\.map$/,
					/\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
					/\.(?:js|css|woff2?)$/
				],
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json,woff2}'],
				cleanupOutdatedCaches: true
			},
			devOptions: {
				enabled: true
			}
		})
	]
});
