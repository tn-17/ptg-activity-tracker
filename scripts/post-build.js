import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '..', 'build', '200.html');
const dest = path.join(__dirname, '..', 'build', 'index.html');

try {
	fs.copyFileSync(source, dest);
	console.log('✓ Copied 200.html to index.html');
} catch (err) {
	console.error('Error copying file:', err);
	process.exit(1);
}
