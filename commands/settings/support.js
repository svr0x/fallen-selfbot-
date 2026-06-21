export default {
    name: 'support',
    description: 'Get support links and developer contact',
    aliases: ['contact', 'dev'],
    usage: '',
    category: 'settings',
    type: 'both',
    cooldown: 5,

    execute: async (client, message, args) => {
        return message.channel.send(
            `> fallen** · svrOx.\n` +
            `> \n` +
            `> discord** — discord.gg/ypXHdGQaq\n` +
            `> prefix** — ${client.prefix}`
        );
    }
};
