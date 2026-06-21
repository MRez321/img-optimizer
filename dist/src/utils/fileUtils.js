import fs from 'fs/promises';
import path from 'path';
export const ensureDir = async (dir) => {
    await fs.mkdir(dir, { recursive: true });
};
export const getPublicUrl = (filename, type) => {
    return `/data/${type}/${filename}`;
};
//# sourceMappingURL=fileUtils.js.map