const cache = new Map(); // token -> { status, checkedAt }
const CACHE_MS = 30000;

export async function checkTokenHealth(token) {
    const cached = cache.get(token);
    if (cached && (Date.now() - cached.checkedAt) < CACHE_MS) {
        return cached.status;
    }

    let status = 'unknown';
    try {
        const res = await fetch('https://discord.com/api/v9/users/@me', {
            method: 'GET',
            headers: { Authorization: token },
        });

        if (res.status === 200) {
            const body = await res.json();
            status = (body.disabled_reason || body.flags) ? 'limited' : 'safe';
        } else if (res.status === 401) {
            status = 'dead';
        } else if (res.status === 429) {
            status = 'limited';
        } else {
            status = 'unknown';
        }
    } catch {
        status = 'unknown';
    }

    cache.set(token, { status, checkedAt: Date.now() });
    return status;
}

export function statusLabel(status) {
    if (status === 'safe') return 'safe';
    if (status === 'limited') return 'limited';
    if (status === 'dead') return 'dead';
    return 'unknown';
}
