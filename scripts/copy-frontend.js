import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const frontendDist = path.join(__dirname, '../front/dist');
const serverDistPublic = path.join(__dirname, '../server/dist/public');

async function copyFrontend() {
    try {
        // Clean previous public folder if exists
        await fs.remove(serverDistPublic);

        // Copy frontend build
        await fs.copy(frontendDist, serverDistPublic);

        console.log('✅ Frontend built and copied to server/dist/public');
    } catch (err) {
        console.error('❌ Copy failed:', err);
        process.exit(1);
    }
}

copyFrontend();