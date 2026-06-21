import axios from 'axios';
import { log } from '../../utils/functions.js';

const questSessions = new Map();

const QUEST_APPS = [
    { id: '1257216895776673842', name: 'Fortnite' },
    { id: '432980957394370572',  name: 'League of Legends' },
    { id: '1158921349741690991', name: 'Valorant' },
    { id: '356869127172399104',  name: 'Minecraft' },
];

function getHeaders(token) {
    return {
        'Authorization': token,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9164 Chrome/124.0.6367.243 Electron/30.2.0 Safari/537.36',
        'X-Discord-Locale': 'en-US',
        'X-Discord-Timezone': 'Asia/Manila',
        'X-Super-Properties': Buffer.from(JSON.stringify({
            os: 'Windows',
            browser: 'Discord Client',
            release_channel: 'stable',
            client_version: '1.0.9164',
            os_version: '10.0.22621',
            os_arch: 'x64',
            system_locale: 'en-US',
            has_client_mods: false,
        })).toString('base64'),
        'Origin': 'https://discord.com',
        'Referer': 'https://discord.com/channels/@me',
    };
}

async function apiGet(token, url) {
    const endpoints = [
        `https://discord.com/api/v10${url}`,
        `https://discord.com/api/v9${url}`,
    ];
    for (const endpoint of endpoints) {
        try {
            const res = await axios.get(endpoint, { headers: getHeaders(token) });
            return res.data;
        } catch (e) {
            log(`API error ${endpoint}: ${e.response?.status} ${e.message}`, 'debug');
        }
    }
    return null;
}

async function apiPost(token, url, body = {}) {
    const endpoints = [
        `https://discord.com/api/v10${url}`,
        `https://discord.com/api/v9${url}`,
    ];
    for (const endpoint of endpoints) {
        try {
            const res = await axios.post(endpoint, body, { headers: getHeaders(token) });
            return res.data;
        } catch {}
    }
    return null;
}

async function apiPut(token, url, body = {}) {
    const endpoints = [
        `https://discord.com/api/v10${url}`,
        `https://discord.com/api/v9${url}`,
    ];
    for (const endpoint of endpoints) {
        try {
            const res = await axios.put(endpoint, body, { headers: getHeaders(token) });
            return res.data;
        } catch {}
    }
    return null;
}

async function getQuests(token) {
    // Try multiple known endpoints
    const urls = [
        '/users/@me/quests?with_config=true',
        '/users/@me/quests',
        '/quests/@me',
        '/users/@me/quests?include_config=true',
    ];
    for (const url of urls) {
        const data = await apiGet(token, url);
        if (data !== null) {
            return Array.isArray(data) ? data : (data?.quests || data?.items || []);
        }
    }
    return null;
}

async function getOrbBalance(token) {
    const urls = [
        '/users/@me/orbs/balance',
        '/users/@me/quests/orbs',
        '/users/@me/billing/orbs',
        '/users/@me/orbs',
    ];
    for (const url of urls) {
        try {
            const res = await axios.get(`https://discord.com/api/v10${url}`, {
                headers: getHeaders(token)
            });
            const data = res.data;
            const balance = data?.balance ?? data?.orb_balance ?? data?.amount ?? data?.total ?? data?.orbs;
            if (balance !== undefined && balance !== null) return balance;
        } catch {}
    }
    try {
        const res = await axios.get('https://discord.com/api/v10/users/@me/quests?with_config=true', {
            headers: getHeaders(token)
        });
        const data = res.data;
        const balance = data?.orb_balance ?? data?.balance ?? data?.user_orbs;
        if (balance !== undefined && balance !== null) return balance;
    } catch {}
    return null;
}

export default {
    name: 'quest',
    description: 'Auto-complete Discord quests for orbs/rewards',
    aliases: ['quests', 'queststart', 'queststop', 'questlist', 'questrefresh', 'qlist', 'qs'],
    usage: '[start|stop|status|list|refresh]',
    category: 'general',
    type: 'both',
    ownerOnly: true,
    cooldown: 5,

    execute: async (client, message, args) => {
        const token = client.token;
        const clientId = client.user.id;
        const cmd = message.content.split(' ')[0].replace(client.prefix, '').toLowerCase();
        const sub = args[0]?.toLowerCase() || cmd;

        const div = '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯';

        // ── queststop ─────────────────────────────────────────────────
        if (sub === 'stop' || sub === 'queststop') {
            const session = questSessions.get(clientId);
            if (!session) return message.channel.send('> No active quest session!');
            clearInterval(session.interval);
            clearInterval(session.activityInterval);
            questSessions.delete(clientId);
            try { await client.user.setActivity(null); } catch {}
            return message.channel.send(`> Stopped quest: **${session.questName}**`);
        }

        // ── queststatus ───────────────────────────────────────────────
        if (sub === 'status') {
            const session = questSessions.get(clientId);
            if (!session) return message.channel.send('> No active quest session!');
            const elapsed = Date.now() - session.startTime;
            const elapsedMin = Math.floor(elapsed / 60000);
            const elapsedSec = Math.floor((elapsed % 60000) / 1000);
            const targetMin = Math.floor(session.targetMs / 60000);
            const pct = Math.min(100, Math.floor((elapsed / session.targetMs) * 100));
            const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
            return message.channel.send(
                `> **Quest Status**\n` +
                `> Quest: **${session.questName}**\n` +
                `> Progress: \`${bar}\` ${pct}%\n` +
                `> Time: **${elapsedMin}m ${elapsedSec}s** / **${targetMin}m**\n` +
                `> Heartbeats: **${session.heartbeats}**`
            );
        }

        if (['list', 'questlist', 'qlist', 'qs', 'refresh', 'questrefresh'].includes(sub)) {
            const fetchMsg = await message.channel.send('> Fetching quest data...');
            const quests = await getQuests(token);

            if (quests === null) {
                return fetchMsg.edit(
                    `> ❌ **Failed to fetch quests!**\n` +
                    `> Possible reasons:\n` +
                    `> • Token expired/invalid\n` +
                    `> • No active quest event on Discord\n` +
                    `> • API rate limited, try again later`
                );
            }

            const username = client.user.username;
            const orbBalance = client._orbBalance ?? await getOrbBalance(token) ?? 'N/A';

            // Helper to get proper quest name
            const getQuestName = (q) =>
                q.config?.messages?.['en-US']?.questName
                || q.config?.messages?.['en-US']?.title
                || q.config?.name
                || q.config?.title
                || null;

            const available = quests.filter(q => {
                if (!getQuestName(q)) return false;
                const p = q.user_status?.progress?.quest_gem_count || q.user_status?.progress;
                const claimed = q.user_status?.claimed_at || q.user_status?.completed_at;
                if (claimed) return false;
                const cur = p?.value || p?.current || 0;
                const req = p?.required || p?.total || 1;
                return cur < req;
            });

            // inProgress = started but not finished
            const inProgress = quests.filter(q => {
                const p = q.user_status?.progress?.quest_gem_count || q.user_status?.progress;
                const claimed = q.user_status?.claimed_at || q.user_status?.completed_at;
                if (claimed) return false;
                const cur = p?.value || p?.current || 0;
                const req = p?.required || p?.total || 1;
                return cur > 0 && cur < req;
            });

            let out = `> **Username:** ${username}\n`;
            out += `> **Orbs Balance:** ${orbBalance !== null ? orbBalance : 'N/A'}\n\n`;
            out += `> **Available:** ${available.length}\n`;

            if (available.length) {
                available.forEach(q => {
                    const name = getQuestName(q);
                    const p = q.user_status?.progress?.quest_gem_count || q.user_status?.progress;
                    const cur = p?.value || p?.current || 0;
                    const req = p?.required || p?.total || 1;
                    const pctStr = cur > 0 ? ` — ${Math.floor((cur / req) * 100)}%` : '';
                    out += `> • ${name}${pctStr}\n`;
                });
            }

            out += `\n> **In Progress:** ${inProgress.length}\n`;
            if (inProgress.length) {
                inProgress.forEach(q => {
                    const name = getQuestName(q) || q.quest_id || q.id;
                    const p = q.user_status?.progress?.quest_gem_count || q.user_status?.progress;
                    const cur = p?.value || p?.current || 0;
                    const req = p?.required || p?.total || 1;
                    const pct = Math.floor((cur / req) * 100);
                    const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
                    out += `> • ${name} — \`${bar}\` ${pct}%\n`;
                });
            }

            out += `\n> ${div}\n`;
            out += `> \`+questrefresh\` - Refresh quest data\n`;
            out += `> \`+queststop\` - Stop auto-completer\n`;
            out += `> \`+questlist\` - List all quests\n`;
            out += `> \`+queststart\` - Start auto-completing`;

            return fetchMsg.edit(out);
        }

        // ── queststart ────────────────────────────────────────────────
        if (sub === 'start' || sub === 'queststart') {
            if (questSessions.has(clientId)) {
                return message.channel.send('> Already running! Use `+queststop` first.');
            }

            const fetchMsg = await message.channel.send('> Fetching quests...');
            const quests = await getQuests(token);

            if (quests === null) return fetchMsg.edit('> ❌ Failed to fetch quests! Check token.');
            if (!quests.length) return fetchMsg.edit('> No active quests found!');

            const quest = quests.find(q => {
                const p = q.user_status?.progress?.quest_gem_count || q.user_status?.progress;
                return !p || ((p.value || p.current || 0) < (p.required || p.total || 1));
            }) || quests[0];

            const questName = quest.config?.messages?.['en-US']?.questName
                || quest.config?.name
                || quest.quest_id
                || quest.id
                || 'Unknown Quest';

            const progress = quest.user_status?.progress?.quest_gem_count || quest.user_status?.progress;
            const required = progress?.required || progress?.total || 900;
            const targetMs = required * 1000;
            const questId = quest.id || quest.quest_id;

            await apiPut(token, `/quests/${questId}/enroll`);

            const app = QUEST_APPS[Math.floor(Math.random() * QUEST_APPS.length)];
            const startTime = Date.now();
            let heartbeats = 0;

            try {
                await client.user.setActivity(app.name, {
                    type: 'PLAYING',
                    applicationId: app.id,
                    startTimestamp: new Date(startTime),
                });
            } catch {}

            const interval = setInterval(async () => {
                const elapsed = Date.now() - startTime;
                heartbeats++;

                const ok = await apiPost(token, `/quests/${questId}/heartbeat`, { stream_type: 'guild_stream' });
                log(`Quest heartbeat #${heartbeats} — ${ok !== null ? 'OK' : 'FAILED'}`, 'debug');

                const session = questSessions.get(clientId);
                if (session) session.heartbeats = heartbeats;

                if (elapsed >= targetMs) {
                    clearInterval(interval);
                    clearInterval(activityInterval);
                    questSessions.delete(clientId);
                    try { await client.user.setActivity(null); } catch {}
                    message.channel.send(
                        `> ✅ **Quest Complete!**\n> **${questName}** finished!\n> Go claim your reward in Discord! 🎁`
                    ).catch(() => {});
                }
            }, 30000);

            const activityInterval = setInterval(async () => {
                if (!questSessions.has(clientId)) { clearInterval(activityInterval); return; }
                try {
                    await client.user.setActivity(app.name, {
                        type: 'PLAYING',
                        applicationId: app.id,
                        startTimestamp: new Date(startTime),
                    });
                } catch {}
            }, 300000);

            questSessions.set(clientId, {
                interval, activityInterval,
                questId, startTime, targetMs,
                questName, heartbeats: 0, app,
            });

            const targetMin = Math.ceil(targetMs / 60000);
            return fetchMsg.edit(
                `> ✅ **Quest auto-completer started!**\n` +
                `> Quest: **${questName}**\n` +
                `> Target: **${targetMin} minutes**\n` +
                `> Faking: **${app.name}**\n` +
                `> Use \`+quest status\` to check progress!`
            );
        }
    }
};
