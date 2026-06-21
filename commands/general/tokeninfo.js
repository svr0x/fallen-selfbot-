import axios from 'axios';

export default {
    name: 'tokeninfo',
    description: 'Get information about a Discord token',
    aliases: ['token', 'tinfo'],
    usage: '<token>',
    category: 'general',
    type: 'both',
    cooldown: 5,

    execute: async (client, message, args) => {
        const token = args[0];
        if (!token) return message.channel.send('> provide a token');

        try {
            const res = await axios.get('https://discord.com/api/v10/users/@me', {
                headers: { Authorization: token }
            });
            const u = res.data;
            const nitro = u.premium_type === 2 ? 'Nitro' : u.premium_type === 1 ? 'Classic' : u.premium_type === 3 ? 'Basic' : 'None';
            const mfa = u.mfa_enabled ? 'enabled' : 'disabled';
            const verified = u.verified ? 'yes' : 'no';
            const phone = u.phone ? 'yes' : 'no';

            return message.channel.send(
                `> username** — ${u.username}\n` +
                `> id** — ${u.id}\n` +
                `> email** — ${u.email || 'none'}\n` +
                `> phone** — ${phone}\n` +
                `> nitro** — ${nitro}\n` +
                `> 2fa** — ${mfa}\n` +
                `> verified** — ${verified}\n` +
                `> token** — valid ✓`
            );
        } catch {
            return message.channel.send('> invalid token ✗');
        }
    }
};
