import axios from 'axios';

export default {
    name: 'tokencheck',
    description: 'Check if a Discord token is valid',
    aliases: ['checktoken', 'validtoken'],
    usage: '<token>',
    category: 'general',
    type: 'both',
    cooldown: 3,

    execute: async (client, message, args) => {
        const token = args[0];
        if (!token) return message.channel.send('> provide a token');
        try {
            const res = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: { Authorization: token }
            });
            return message.channel.send(`> valid** ✓ — @${res.data.username}`);
        } catch {
            return message.channel.send('> invalid** ✗');
        }
    }
};
