import { log } from '../../utils/functions.js';
import { getAltClients, ownerIdFor } from '../../utils/AltsManager.js';

export default {
    name: 'joinvc',
    description: 'Join a voice channel by ID or name',
    aliases: ['jvc', 'vc', 'connectvc'],
    usage: '<channel_id/name> | <amount> <channel_id/name> -alts',
    category: 'general',
    type: 'server_only',
    permissions: ['SendMessages'],
    cooldown: 3,

    execute: async (client, message, args) => {
        if (!message.guild) return;

        const isAlts = args.includes('-alts');
        const cleanArgs = args.filter(a => a !== '-alts');

        if (isAlts) {
            if (cleanArgs.length < 2) {
                return message.channel.send('` usage: +jvc <amount> <channel_id/name> -alts `');
            }
            const amount = parseInt(cleanArgs[0]);
            if (!amount || amount < 1) {
                return message.channel.send('` usage: +jvc <amount> <channel_id/name> -alts `');
            }
            const identifier = cleanArgs.slice(1).join(' ');

            let channel;
            const urlMatch = identifier.match(/discord\.com\/channels\/\d+\/(\d+)/);
            if (urlMatch) {
                channel = message.guild.channels.cache.get(urlMatch[1]);
            } else if (identifier.match(/^\d+$/)) {
                channel = message.guild.channels.cache.get(identifier);
            } else {
                channel = message.guild.channels.cache.find(c =>
                    (c.type === 'GUILD_VOICE' || c.type === 'GUILD_STAGE_VOICE') &&
                    c.name.toLowerCase() === identifier.toLowerCase()
                );
            }

            if (!channel || (channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE')) {
                return message.channel.send(`> voice channel not found: **${identifier}**`);
            }

            const ownerId = ownerIdFor(client);
            const altClients = getAltClients(ownerId, amount);
            if (!altClients.length) {
                return message.channel.send('` no alts hosted, use +alts <token> first `');
            }

            await message.channel.send(`> deploying ${altClients.length} alts to **${channel.name}**...`);

            for (const altClient of altClients) {
                try {
                    altClient.ws.shards.first().send({
                        op: 4,
                        d: {
                            guild_id: message.guild.id,
                            channel_id: channel.id,
                            self_mute: client.config?.vc_command?.mute ?? true,
                            self_deaf: client.config?.vc_command?.deafen ?? true,
                        },
                    });
                } catch {}
            }
            return;
        }

        const identifier = args.join(' ');
        if (!identifier) return;

        // Check if already in a VC in this guild
        const me = message.guild.members.cache.get(client.user.id);
        if (me?.voice?.channelId) {
            const currentChannel = me.voice.channel;
            return message.channel.send(`> already in **${currentChannel?.name || 'a voice channel'}**`);
        }

        let channel;
        const urlMatch = identifier.match(/discord\.com\/channels\/\d+\/(\d+)/);
        if (urlMatch) {
            channel = message.guild.channels.cache.get(urlMatch[1]);
        } else if (identifier.match(/^\d+$/)) {
            channel = message.guild.channels.cache.get(identifier);
        } else {
            channel = message.guild.channels.cache.find(c =>
                (c.type === 'GUILD_VOICE' || c.type === 'GUILD_STAGE_VOICE') &&
                c.name.toLowerCase() === identifier.toLowerCase()
            );
        }

        if (!channel || (channel.type !== 'GUILD_VOICE' && channel.type !== 'GUILD_STAGE_VOICE')) {
            return message.channel.send(`> voice channel not found: **${identifier}**`);
        }

        try {
            await message.channel.send(`> Joining **${channel.name}**`);
            client.ws.shards.first().send({
                op: 4,
                d: {
                    guild_id: message.guild.id,
                    channel_id: channel.id,
                    self_mute: client.config?.vc_command?.mute ?? true,
                    self_deaf: client.config?.vc_command?.deafen ?? true,
                },
            });
            client.lastJoinedVoiceChannel = { guildId: message.guild.id, channelId: channel.id };
            setTimeout(async () => {
                await message.channel.send(`> Successfully joined **${channel.name}**`);
            }, 1500);
        } catch (error) {
            log(`Error joining vc: ${error.message}`, 'error');
        }
    },
};
