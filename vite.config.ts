import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			manifest: {
				id: '/',
				name: 'PTG',
				short_name: 'PTG',
				description: 'Daily training scoring and tracking.',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#f9fafb',
				theme_color: '#111827',
				icons: [
					{
						src: '/icons/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icons/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icons/maskable-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				navigateFallback: '/',
				additionalManifestEntries: [{ url: '/', revision: null }],
				navigateFallbackDenylist: [
					/^\/api\//,
					/\/assets\//,
					/\/_app\//,
					/\.map$/,
					/\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
					/\.(?:js|css|woff2?)$/
				],
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json,woff2}']
			},
			devOptions: {
				enabled: true
			}
		})
	]
});
