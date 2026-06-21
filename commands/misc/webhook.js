
// In-memory webhook store per client
const wbStore = new Map(); // clientId -> { webhooks: [{webhook, channelId}], spamActive: false }

function getStore(clientId) {
    if (!wbStore.has(clientId)) wbStore.set(clientId, { webhooks: [], spamActive: false });
    return wbStore.get(clientId);
}

export default {
    name: 'webhook',
    description: 'Create and spam webhooks across all channels',
    aliases: ['wb', 'wbs', 'wbss', 'wblist', 'wbdel', 'webhookspam', 'webhookstop'],
    usage: '<amount> | spam <msg> | stop | list | del',
    category: 'misc',
    type: 'server_only',
    cooldown: 5,

    execute: async (client, message, args) => {
        const store = getStore(client.user.id);
        const cmd = message.content.split(' ')[0].replace(client.prefix, '').toLowerCase();
        const sub = args[0]?.toLowerCase() || cmd;

        // ── wbss / stop ───────────────────────────────────────────────
        if (sub === 'stop' || cmd === 'wbss' || cmd === 'webhookstop') {
            store.spamActive = false;
            return message.channel.send('> webhook spam stopped');
        }

        // ── wblist / list ─────────────────────────────────────────────
        if (sub === 'list' || cmd === 'wblist') {
            if (!store.webhooks.length) return message.channel.send('> no webhooks created');
            return message.channel.send(`> **${store.webhooks.length} webhooks** active`);
        }

        // ── wbdel / del ───────────────────────────────────────────────
        if (sub === 'del' || cmd === 'wbdel') {
            if (!store.webhooks.length) return message.channel.send('> no webhooks to delete');
            const msg = await message.channel.send(`> deleting ${store.webhooks.length} webhooks...`);
            await Promise.allSettled(store.webhooks.map(({ webhook }) => webhook.delete().catch(() => {})));
            store.webhooks = [];
            return msg.edit('> all webhooks deleted');
        }

        // ── wbs / spam <msg> ──────────────────────────────────────────
        if (sub === 'spam' || cmd === 'wbs' || cmd === 'webhookspam') {
            const spamMsg = cmd === 'wbs' || cmd === 'webhookspam'
                ? args.join(' ')
                : args.slice(1).join(' ');

            if (!spamMsg.trim()) return message.channel.send('> provide a message to spam');
            if (!store.webhooks.length) return message.channel.send('> no webhooks! create some first with +wb <amount>');
            if (store.spamActive) return message.channel.send('> already spamming! use +wbss to stop first');

            store.spamActive = true;

            message.channel.send(`> spamming **${store.webhooks.length}** webhooks... (+wbss to stop)`);

            // Spam all webhooks simultaneously
            const spamWebhook = async ({ webhook }) => {
                while (store.spamActive) {
                    try {
                        await webhook.send(spamMsg);
                    } catch {}
                    await new Promise(r => setTimeout(r, 10));
                }
            };

            store.webhooks.forEach(wb => spamWebhook(wb));
            return;
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1) return message.channel.send('> usage: +wb <amount>');

        const textChannels = [...message.guild.channels.cache.values()]
            .filter(c => c.type === 'GUILD_TEXT' && c.permissionsFor(message.guild.members.me)?.has('ManageWebhooks'));

        if (!textChannels.length) return message.channel.send('> no text channels with webhook permissions');

        const msg = await message.channel.send(`> creating ${amount} webhooks...`);

        // Delete old webhooks first
        if (store.webhooks.length) {
            await Promise.allSettled(store.webhooks.map(({ webhook }) => webhook.delete().catch(() => {})));
            store.webhooks = [];
        }

        const toCreate = Math.min(amount, textChannels.length * 10); // max 10 per channel
        const created = [];

        const tasks = [];
        for (let i = 0; i < toCreate; i++) {
            const ch = textChannels[i % textChannels.length];
            tasks.push(
                ch.createWebhook(`fallen ${i + 1}`, {
                    avatar: client.user.displayAvatarURL(),
                    reason: 'fallen webhook'
                }).then(wh => ({ webhook: wh, channelId: ch.id })).catch(() => null)
            );
        }

        const results = await Promise.allSettled(tasks);
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value) created.push(r.value);
        });

        store.webhooks = created;

        return msg.edit(`> created **${created.length}** webhooks across **${textChannels.length}** channels`);
    }
};
