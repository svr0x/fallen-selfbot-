export default {
    name: 'status',
    description: "Changes the bot's online status (online, idle, dnd, invisible)",
    aliases: [],
    usage: '<online|idle|dnd|invisible>',
    category: 'status',
    type: 'both',
    permissions: ['SendMessages'],
    cooldown: 5,
    async execute(client, message, args) {
        const newStatus = args[0] ? args[0].toLowerCase() : null;
        const validStatuses = ['online', 'idle', 'dnd', 'invisible'];

        if (!newStatus || !validStatuses.includes(newStatus)) {
            return message.channel.send([
                '```',
                `usage: ${client.prefix}status <online|idle|dnd|invisible>`,
                `valid: ${validStatuses.join(', ')}`,
                '```'
            ].join('\n'));
        }

        try {
            client.config.selfbot.status = newStatus;
            await client.user.setStatus(newStatus);
            message.channel.send([
                '```',
                `status : ${newStatus}`,
                '```'
            ].join('\n'));
        } catch (error) {
            console.error('Error changing bot status:', error);
            message.channel.send('` error: failed to change status `');
        }
    },
};