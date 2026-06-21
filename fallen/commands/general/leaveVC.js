import { log } from '../../utils/functions.js';

export default {
    name: 'leavevc',
    description: 'Leave the current voice channel',
    aliases: ['lvc', 'disconnectvc', 'dc'],
    usage: '',
    category: 'general',
    type: 'server_only',
    permissions: ['SendMessages'],
    cooldown: 5,

    execute: async (client, message, args) => {
        if (!message.guild) return;
        try {
            const channelName = voice.channel?.name || 'voice channel';
            client.ws.shards.first().send({
                op: 4,
                d: {
                    guild_id: message.guild.id,
                    channel_id: null,
                    self_mute: false,
                    self_deaf: false,
                },
            });
            client.lastJoinedVoiceChannel = null;
            await message.channel.send(`> Left **${channelName}** 👋`);
        } catch (error) {
            log(`Error leaving vc: ${error.message}`, 'error');
        }
    },
};
