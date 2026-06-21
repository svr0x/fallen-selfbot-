import fs from 'fs';
import path from 'path';

const afkFilePath = path.join(process.cwd(), 'data', 'afk.json');

function ensureAfkFile() {
    const dir = path.dirname(afkFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(afkFilePath)) {
        fs.writeFileSync(afkFilePath, JSON.stringify({}));
    }
}

export function readAfkData() {
    ensureAfkFile();
    try {
        const data = fs.readFileSync(afkFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('[ERROR] Error reading AFK data:', error);
        return {};
    }
}

export function writeAfkData(data) {
    ensureAfkFile();
    try {
        fs.writeFileSync(afkFilePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error('[ERROR] Error writing AFK data:', error);
    }
}
