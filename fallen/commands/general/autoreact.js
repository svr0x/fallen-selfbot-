/**
 * +ar <emoji> [flags]           - autoreact on own messages
 * +ar @user <emoji> [flags]     - autoreact on target user messages
 * +ar <amount> <emoji> -alts            - alt tokens react on own messages
 * +ar @user <amount> <emoji> -alts      - alt tokens react on target user messages
 * +ar clear                     - clear own autoreact
 * +ar clear @user               - clear target user autoreact
 * 
 * flags: -boost or -burst = super/burst react
 *        -alts = use your own hosted alt tokens instead of this client
 * max 5 emojis
 */

import { getAltClients, ownerIdFor } from '../../utils/AltsManager.js';

// In-memory store: { self: { emojis, burst }, targets: Map<userId, { emojis, burst }> }
const arStore = new Map(); // clientId -> store
const altArStore = new Map(); // ownerId -> { self: { amount, emojis }, targets: Map<userId, { amount, emojis }> }

function getStore(clientId) {
    if (!arStore.has(clientId)) {
        arStore.set(clientId, { self: null, targets: new Map() });
    }
    return arStore.get(clientId);
}

function getAltStore(ownerId) {
    if (!altArStore.has(ownerId)) {
        altArStore.set(ownerId, { self: null, targets: new Map() });
    }
    return altArStore.get(ownerId);
}

async function altsReact(ownerId, message, amount, emojis) {
    const clients = getAltClients(ownerId, amount);
    for (const altClient of clients) {
        for (const emoji of emojis) {
            try { await message.react(emoji); } catch {}
        }
    }
}

export const autoReactHandler = async (client, message) => {
    const store = getStore(client.user.id);
    const isSelf = message.author.id === client.user.id;
    const authorId = message.author.id;

    // Self autoreact
    if (isSelf && store.self) {
        for (const emoji of store.self.emojis) {
            try {
                if (store.self.burst) {
                    await message.react(emoji, { burst: true }).catch(() => message.react(emoji));
                } else {
                    await message.react(emoji);
                }
            } catch {}
        }
    }

    // Target autoreact
    if (store.targets.has(authorId)) {
        const data = store.targets.get(authorId);
        for (const emoji of data.emojis) {
            try {
                if (data.burst) {
                    await message.react(emoji, { burst: true }).catch(() => message.react(emoji));
                } else {
                    await message.react(emoji);
                }
            } catch {}
        }
    }

    // Alts autoreact
    const ownerId = ownerIdFor(client);
    const altStore = getAltStore(ownerId);

    if (isSelf && altStore.self) {
        await altsReact(ownerId, message, altStore.self.amount, altStore.self.emojis);
    }
    if (altStore.targets.has(authorId)) {
        const data = altStore.targets.get(authorId);
        await altsReact(ownerId, message, data.amount, data.emojis);
    }
};

export default {
    name: 'ar',
    description: 'Auto-react to messages with emojis. Use -boost/-burst for super react.',
    aliases: ['autoreact'],
    usage: '[@user] <emoji> [emoji2...] [-boost/-burst] | clear [@user]',
    category: 'general',
    type: 'both',
    ownerOnly: true,
    cooldown: 3,

    execute: async (client, message, args) => {
        const store = getStore(client.user.id);
        const ownerId = ownerIdFor(client);
        const altStore = getAltStore(ownerId);

        if (!args.length) return;

        const sub = args[0].toLowerCase();

        // +ar clear / +ar clear @user
        if (sub === 'clear') {
            if (message.mentions.users.size) {
                const target = message.mentions.users.first();
                store.targets.delete(target.id);
                altStore.targets.delete(target.id);
                return message.channel.send(`\` ar clear: @${target.username} \``);
            } else {
                store.self = null;
                altStore.self = null;
                return message.channel.send('` ar clear: self `');
            }
        }

        const isAlts = args.includes('-alts');
        const burst = args.includes('-boost') || args.includes('-burst');
        const cleanArgs = args.filter(a => a !== '-boost' && a !== '-burst' && a !== '-alts');

        let targetUser = null;
        let remaining = cleanArgs;

        if (message.mentions.users.size) {
            targetUser = message.mentions.users.first();
            remaining = cleanArgs.filter(a => !a.startsWith('<@'));
        }

        if (isAlts) {
            if (!remaining.length) {
                return message.channel.send('` usage: +ar [@user] <amount> <emoji> -alts `');
            }
            const amount = parseInt(remaining[0]);
            if (!amount || amount < 1) {
                return message.channel.send('` usage: +ar [@user] <amount> <emoji> -alts `');
            }
            const emojis = remaining.slice(1, 6);
            if (!emojis.length) {
                return message.channel.send('` usage: +ar [@user] <amount> <emoji> -alts `');
            }

            if (targetUser) {
                altStore.targets.set(targetUser.id, { amount, emojis });
                return message.channel.send(`> ar -alts: @${targetUser.username} | ${amount} alts | ${emojis.join(' ')}`);
            } else {
                altStore.self = { amount, emojis };
                return message.channel.send(`> ar -alts: self | ${amount} alts | ${emojis.join(' ')}`);
            }
        }

        if (!remaining.length) return;

        // Max 5 emojis
        const emojis = remaining.slice(0, 5);

        if (targetUser) {
            store.targets.set(targetUser.id, { emojis, burst });
            return message.channel.send(
                `> ar: @${targetUser.username} | ${emojis.join(' ')} | ${burst ? 'burst' : 'normal'}`
            );
        } else {
            store.self = { emojis, burst };
            return message.channel.send(
                `> ar: self | ${emojis.join(' ')} | ${burst ? 'burst' : 'normal'}`
            );
        }
    },
};
