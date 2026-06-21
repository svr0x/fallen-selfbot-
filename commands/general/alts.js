import { addAlt, removeAlt, getAlts, ownerIdFor } from '../../utils/AltsManager.js';

export default {
    name: 'alts',
    description: 'Manage your own alt tokens (isolated per client — main and each hosted account have separate alts)',
    aliases: ['altstoken', 'addalt'],
    usage: '<token> | list | remove <token/id/username>',
    category: 'general',
    type: 'both',
    ownerOnly: true,
    cooldown: 3,

    execute: async (client, message, args) => {
        const ownerId = ownerIdFor(client);

        if (!args.length) {
            return message.channel.send('` usage: +alts <token> | +alts list | +alts remove <token/id/username> `');
        }

        const sub = args[0].toLowerCase();

        if (sub === 'list') {
            const alts = getAlts(ownerId);
            if (!alts.length) {
                return message.channel.send('` no alts hosted `');
            }
            const lines = alts.map((a, i) => `  [${String(i + 1).padStart(2, '0')}] @${a.username}`);
            return message.channel.send(`\`\`\`\n  alts hosted (${alts.length})\n\n${lines.join('\n')}\n\`\`\``);
        }

        if (sub === 'remove') {
            const target = args[1];
            if (!target) return message.channel.send('` provide a token, id, or username to remove `');
            const result = await removeAlt(ownerId, target);
            if (!result.success) return message.channel.send(`\` failed: ${result.error} \``);
            return message.channel.send(`\` removed alt: @${result.username} \``);
        }

        const token = args[0];
        const result = await addAlt(ownerId, token);
        if (!result.success) {
            return message.channel.send(`\` failed to add alt: ${result.error} \``);
        }
        return message.channel.send(`\` alt added: @${result.username} \``);
    },
};
