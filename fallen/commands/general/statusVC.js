export default {
    name: 'statusvc',
    description: 'Show current voice channel status',
    aliases: ['svc', 'vcstatus'],
    usage: '',
    category: 'general',
    type: 'server_only',
    permissions: ['SendMessages'],
    cooldown: 3,

    execute: async (client, message, args) => {
        if (!message.guild) return;
        const voice = message.guild.members.cache.get(client.user.id)?.voice;
        if (!voice?.channelId) return message.channel.send('` not in vc `');
        return message.channel.send(`\` vc: ${voice.channel?.name} | mute: ${voice.selfMute} | deaf: ${voice.selfDeaf} \``);
    },
};
