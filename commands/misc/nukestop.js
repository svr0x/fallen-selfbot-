export default {
    name: 'nukestop',
    description: 'Stop nuke spam',
    aliases: ['ns', 'stopnuke'],
    usage: '',
    category: 'misc',
    type: 'server_only',
    cooldown: 3,

    execute: async (client, message, args) => {
        if (client._nukeSpam) {
            client._nukeSpam.active = false;
            client._nukeSpam = null;
            return message.channel.send('> nuke spam stopped');
        }
        return message.channel.send('> no active nuke spam');
    }
};
