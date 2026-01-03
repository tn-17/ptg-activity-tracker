import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_PATH = 'C:/Users/T/Downloads/NanoBanana-2026-01-02.png';
const STATIC_DIR = path.resolve('static');

// Background color sampled from the source image background (dark navy).
// Used for edge color decontamination.
const BG = { r: 9, g: 12, b: 24 };

function clamp01(x) {
	return Math.max(0, Math.min(1, x));
}

/**
 * Creates an alpha-matted version of the emblem by computing a soft matte
 * against a known dark background and performing edge color decontamination
 * to avoid blue fringing.
 */
async function createTransparentEmblemPng() {
	const src = sharp(SOURCE_PATH, { failOn: 'none' });
	const meta = await src.metadata();
	if (!meta.width || !meta.height) throw new Error('Unable to read source image dimensions');
	if (meta.width !== meta.height) {
		throw new Error(`Expected square source image, got ${meta.width}x${meta.height}`);
	}

	// Work in raw RGBA.
	const { data, info } = await src.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const w = info.width;
	const h = info.height;

	const out = Buffer.allocUnsafe(w * h * 4);

	// Matte heuristic:
	// - Background is close to BG.
	// - Foreground (coin + halo) is generally brighter / different chroma.
	// Compute alpha from "distance" to BG with a soft ramp.
	const t0 = 0.038; // start of transition
	const t1 = 0.2; // end of transition

	for (let i = 0; i < w * h; i++) {
		const idx = i * 4;
		const r = data[idx];
		const g = data[idx + 1];
		const b = data[idx + 2];

		const dr = (r - BG.r) / 255;
		const dg = (g - BG.g) / 255;
		const db = (b - BG.b) / 255;
		const dist = Math.sqrt(dr * dr + dg * dg + db * db);

		let a = (dist - t0) / (t1 - t0);
		a = clamp01(a);
		// Slightly emphasize edge softness (keeps halo).
		a = Math.pow(a, 0.85);

		// Color decontamination: remove BG contribution in semi-transparent pixels.
		// Formula: fg = (C - (1-a)*BG) / a
		let rr = r;
		let gg = g;
		let bb = b;
		if (a > 0 && a < 1) {
			rr = (r - (1 - a) * BG.r) / a;
			gg = (g - (1 - a) * BG.g) / a;
			bb = (b - (1 - a) * BG.b) / a;
			rr = Math.max(0, Math.min(255, rr));
			gg = Math.max(0, Math.min(255, gg));
			bb = Math.max(0, Math.min(255, bb));
		}

		out[idx] = Math.round(rr);
		out[idx + 1] = Math.round(gg);
		out[idx + 2] = Math.round(bb);
		out[idx + 3] = Math.round(a * 255);
	}

	return { w, h, rgba: out };
}

async function writePngFromRaw({ w, h, rgba }, outPath) {
	await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
		.png({ compressionLevel: 9 })
		.toFile(outPath);
}

async function writeIconSizes(baseSharpImg) {
	const iconsDir = path.join(STATIC_DIR, 'icons');

	// Regular PWA icons (no extra padding; keep the circular emblem filling canvas).
	await baseSharpImg
		.clone()
		.resize(192, 192, { fit: 'cover' })
		.png({ compressionLevel: 9 })
		.toFile(path.join(STATIC_DIR, 'pwa-192x192.png'));

	await baseSharpImg
		.clone()
		.resize(512, 512, { fit: 'cover' })
		.png({ compressionLevel: 9 })
		.toFile(path.join(STATIC_DIR, 'pwa-512x512.png'));

	// Keep legacy copies under static/icons/ in sync.
	await baseSharpImg
		.clone()
		.resize(192, 192, { fit: 'cover' })
		.png({ compressionLevel: 9 })
		.toFile(path.join(iconsDir, 'pwa-192x192.png'));

	await baseSharpImg
		.clone()
		.resize(512, 512, { fit: 'cover' })
		.png({ compressionLevel: 9 })
		.toFile(path.join(iconsDir, 'pwa-512x512.png'));

	// Maskable: center the same circle with safe padding.
	// Keep transparent background; Android will apply its own mask.
	const padRatio = 0.18; // ~18% padding each side (conservative)
	const inner192 = Math.round(192 * (1 - padRatio * 2));
	const inner512 = Math.round(512 * (1 - padRatio * 2));

	const empty192 = sharp({
		create: { width: 192, height: 192, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
	});
	const innerImg192 = await baseSharpImg
		.clone()
		.resize(inner192, inner192, { fit: 'cover' })
		.png()
		.toBuffer();
	await empty192
		.composite([
			{
				input: innerImg192,
				left: Math.floor((192 - inner192) / 2),
				top: Math.floor((192 - inner192) / 2)
			}
		])
		.png({ compressionLevel: 9 })
		.toFile(path.join(STATIC_DIR, 'manifest-icon-192.maskable.png'));

	const empty512 = sharp({
		create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
	});
	const innerImg512 = await baseSharpImg
		.clone()
		.resize(inner512, inner512, { fit: 'cover' })
		.png()
		.toBuffer();
	await empty512
		.composite([
			{
				input: innerImg512,
				left: Math.floor((512 - inner512) / 2),
				top: Math.floor((512 - inner512) / 2)
			}
		])
		.png({ compressionLevel: 9 })
		.toFile(path.join(STATIC_DIR, 'manifest-icon-512.maskable.png'));

	// Keep legacy maskable filename in sync (used by older configs).
	await sharp({
		create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
	})
		.composite([
			{
				input: innerImg512,
				left: Math.floor((512 - inner512) / 2),
				top: Math.floor((512 - inner512) / 2)
			}
		])
		.png({ compressionLevel: 9 })
		.toFile(path.join(iconsDir, 'maskable-512x512.png'));
}

async function main() {
	await fs.access(SOURCE_PATH);
	await fs.access(STATIC_DIR);

	const raw = await createTransparentEmblemPng();
	const outTransparentPath = path.join(STATIC_DIR, 'ptg-icon-circle.transparent.png');
	await writePngFromRaw(raw, outTransparentPath);

	const base = sharp(outTransparentPath).ensureAlpha();
	await writeIconSizes(base);

	console.log('Wrote:', outTransparentPath);
	console.log('Updated: static/pwa-192x192.png, static/pwa-512x512.png');
	console.log(
		'Updated: static/manifest-icon-192.maskable.png, static/manifest-icon-512.maskable.png'
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
