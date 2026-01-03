import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '..', 'build', '200.html');
const dest = path.join(__dirname, '..', 'build', 'index.html');
const ghPages404 = path.join(__dirname, '..', 'build', '404.html');

try {
	fs.copyFileSync(source, dest);
	console.log('✓ Copied 200.html to index.html');
	fs.copyFileSync(source, ghPages404);
	console.log('✓ Copied 200.html to 404.html (GitHub Pages refresh fallback)');
} catch (err) {
	console.error('Error copying file:', err);
	process.exit(1);
}
