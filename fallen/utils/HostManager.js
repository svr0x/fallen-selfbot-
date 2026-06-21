/**
 * HostManager - Manages hosted selfbot tokens
 * Each hosted token runs as its own Client with its own prefix
 */

import { Client } from 'discord.js-selfbot-v13';
import { loadCommands } from '../handlers/CommandHandler.js';
import { log } from './functions.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'hosted.json');

// In-memory map of hosted clients: token -> { client, prefix, username, status }
export const hostedClients = new Map();

function loadDB() {
    if (!fs.existsSync(DB_PATH)) return [];
    try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
    catch { return []; }
}

function saveDB(entries) {
    fs.writeFileSync(DB_PATH, JSON.stringify(entries, null, 2));
}

export function getHostedDB() { return loadDB(); }

/**
 * Start a hosted client
 * @param {string} token 
 * @param {string} prefix 
 * @param {string} ownerId - The main selfbot owner's Discord ID
 */
export async function startHosted(token, prefix, ownerId) {
    // Check prefix conflict
    for (const [, data] of hostedClients) {
        if (data.prefix === prefix) {
            return { success: false, error: `Prefix "${prefix}" already in use by @${data.username}` };
        }
    }

    // Check token already hosted
    if (hostedClients.has(token)) {
        return { success: false, error: 'Token already hosted' };
    }

    try {
        const hostedClient = new Client({ checkUpdate: false });
        hostedClient.prefix = prefix;
        hostedClient.noprefix = false;
        hostedClient.cooldowns = new Map();
        hostedClient.ownerId = ownerId;

        // Auto-allow owner ID on this hosted client
        hostedClient._allowedUsers = [ownerId];

        await loadCommands(hostedClient);

        await hostedClient.login(token);

        const entry = {
            token,
            prefix,
            username: hostedClient.user?.username || 'Unknown',
            id: hostedClient.user?.id || 'Unknown',
            startedAt: Date.now(),
            status: 'online'
        };

        hostedClients.set(token, { client: hostedClient, ...entry });

        // Save to DB
        const db = loadDB().filter(e => e.token !== token);
        db.push({ token, prefix, username: entry.username, id: entry.id, startedAt: entry.startedAt, ownerId });
        saveDB(db);

        return { success: true, username: entry.username, id: entry.id };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Stop a hosted client by token
 */
export async function stopHosted(token) {
    const data = hostedClients.get(token);
    if (!data) return { success: false, error: 'Token not found in hosted list' };

    try {
        await data.client.destroy();
        hostedClients.delete(token);

        const db = loadDB().filter(e => e.token !== token);
        saveDB(db);

        return { success: true, username: data.username };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Restore hosted clients on bot startup
 */
export async function restoreHosted(ownerId) {
    const db = loadDB();
    if (!db.length) return;
    log(`Restoring ${db.length} hosted clients...`, 'info');
    for (const entry of db) {
        const result = await startHosted(entry.token, entry.prefix, ownerId);
        if (result.success) log(`Restored hosted: @${result.username} [${entry.prefix}]`, 'success');
        else log(`Failed to restore hosted token: ${result.error}`, 'error');
    }
}
