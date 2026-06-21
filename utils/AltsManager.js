import { Client } from 'discord.js-selfbot-v13';

// ownerId -> Map<token, { client, username, id }>
const altsByOwner = new Map();

function getAltsMap(ownerId) {
    if (!altsByOwner.has(ownerId)) {
        altsByOwner.set(ownerId, new Map());
    }
    return altsByOwner.get(ownerId);
}

export async function addAlt(ownerId, token) {
    const alts = getAltsMap(ownerId);

    if (alts.has(token)) {
        return { success: false, error: 'Token already added as an alt' };
    }

    try {
        const altClient = new Client({ checkUpdate: false });
        await altClient.login(token);

        alts.set(token, {
            client: altClient,
            token,
            username: altClient.user?.username || 'Unknown',
            id: altClient.user?.id || 'Unknown',
        });

        return { success: true, username: altClient.user.username, id: altClient.user.id };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export async function removeAlt(ownerId, identifier) {
    const alts = getAltsMap(ownerId);

    for (const [token, data] of alts) {
        if (token === identifier || data.id === identifier || data.username === identifier) {
            try { await data.client.destroy(); } catch {}
            alts.delete(token);
            return { success: true, username: data.username };
        }
    }
    return { success: false, error: 'Alt not found' };
}

export function getAlts(ownerId) {
    return [...getAltsMap(ownerId).values()];
}

export function getAltCount(ownerId) {
    return getAltsMap(ownerId).size;
}

export function getAltClients(ownerId, amount) {
    const alts = getAlts(ownerId);
    if (!amount || amount >= alts.length) return alts.map(a => a.client);
    return alts.slice(0, amount).map(a => a.client);
}

export function ownerIdFor(client) {
    // Always key by this client's OWN id — keeps alts isolated per
    // account (main or hosted), never shared across hosted users.
    return client.user.id;
}
