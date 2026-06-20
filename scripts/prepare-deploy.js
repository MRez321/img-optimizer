import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rootDist = path.join(__dirname, '../dist');
const frontDist = path.join(__dirname, '../front/dist');
const serverDist = path.join(__dirname, '../server/dist');

async function prepareDeploy() {
    try {
        console.log('🚀 Preparing deploy-ready dist folder...');

        // Clean previous root dist
        await fs.remove(rootDist);

        // Create final dist structure
        await fs.ensureDir(rootDist);

        // Copy all contents from server/dist directly to root dist (not inside a server/ folder)
        await fs.copy(serverDist, rootDist, { overwrite: true });

        // Copy frontend build into public folder at root
        const publicDir = path.join(rootDist, 'public');
        await fs.copy(frontDist, publicDir);

        console.log('✅ Frontend copied to dist/public');

        // Create data folders
        await fs.ensureDir(path.join(rootDist, 'data', 'optimized'));
        await fs.ensureDir(path.join(rootDist, 'data', 'uploads'));
        console.log('✅ Empty data/optimized and data/uploads folders created');

        // Create clean production package.json
        const serverPackagePath = path.join(__dirname, '../server/package.json');
        const serverPackage = await fs.readJson(serverPackagePath);

        const prodPackage = {
            name: "img-optimizer",
            version: serverPackage.version || "1.0.0",
            type: "module",
            main: "server.js",
            scripts: {
                start: "node server.js"
            },
            dependencies: serverPackage.dependencies || {}
        };

        await fs.writeJson(path.join(rootDist, 'package.json'), prodPackage, { spaces: 2 });

        console.log('✅ Production package.json created');
        console.log('🎉 Deploy-ready folder created at: /dist');

    } catch (err) {
        console.error('❌ Deploy preparation failed:', err.message);
        process.exit(1);
    }
}

prepareDeploy();