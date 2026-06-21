import { badReplySessions } from './badreply.js';

export default {
    name: 'spack',
    description: 'Stop chatpack on a user or all users',
    aliases: ['stopcpack', 'stoppack'],
    usage: '[@user]',
    category: 'troll',
    type: 'both',
    cooldown: 3,

    async execute(client, message, args) {
        if (message.mentions.users.size) {
            const target = message.mentions.users.first();
            const keys = [
                `${message.guild?.id || 'dm'}_${target.id}`,
                `${message.guild?.id || 'dm'}_${target.id}_alts`,
            ];
            let stopped = false;
            for (const sessionKey of keys) {
                if (badReplySessions.has(sessionKey)) {
                    const session = badReplySessions.get(sessionKey);
                    if (session.task) session.task.stop();
                    badReplySessions.delete(sessionKey);
                    stopped = true;
                }
            }
            if (stopped) return message.channel.send(`> stopped cpack on **${target.username}**`);
            return message.channel.send('> no active session for that user');
        }
        // stop all
        for (const [, session] of badReplySessions) {
            if (session.task) session.task.stop();
        }
        badReplySessions.clear();
        return message.channel.send('> all cpack sessions stopped');
    }
};
