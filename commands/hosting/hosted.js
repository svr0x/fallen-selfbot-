import { startHosted, stopHosted, hostedClients, getHostedDB } from '../../utils/HostManager.js';

export default {
    name: 'hosted',
    description: 'Host a token as a selfbot with its own prefix',
    aliases: ['host'],
    usage: '<token> <prefix> | stop <token> | list',
    category: 'hosting',
    type: 'both',
    ownerOnly: true,
    cooldown: 5,

    execute: async (client, message, args) => {
        const ansi = (t) => `\`\`\`ansi\n${t}\n\`\`\``;
        const gray = (t) => `\u001b[30m${t}\u001b[0m`;
        const blue = (t) => `\u001b[0;34m${t}\u001b[0m`;
        const green = (t) => `\u001b[0;32m${t}\u001b[0m`;
        const red = (t) => `\u001b[0;31m${t}\u001b[0m`;

        if (!args.length) {
            return message.channel.send(ansi(
                `${gray('Usage')}: ${blue(`${client.prefix}hosted <token> <prefix>`)}\n` +
                `${gray('Stop')} : ${blue(`${client.prefix}hosted stop <token>`)}\n` +
                `${gray('List')} : ${blue(`${client.prefix}hosted list`)}`
            ));
        }

        const sub = args[0].toLowerCase();

        // ── hosted list ───────────────────────────────────────────────
        if (sub === 'list') {
            const clients = [...hostedClients.values()];
            if (!clients.length) {
                return message.channel.send(ansi(`${gray('Hosted List')}: ${blue('No hosted tokens')}`));
            }

            const pad = (s, l) => s + ' '.repeat(Math.max(0, l - s.length));
            let lines = `${gray('Hosted List')} ${gray('|')} ${blue(`${clients.length} online`)}\n\n`;
            clients.forEach((h, i) => {
                const uptime = Math.floor((Date.now() - h.startedAt) / 1000);
                const h2 = Math.floor(uptime / 3600);
                const m2 = Math.floor((uptime % 3600) / 60);
                lines += `${gray(`[${i + 1}]`)} ${blue(`@${h.username}`)} ${gray('|')} ${blue(`prefix: ${h.prefix}`)} ${gray('|')} ${green(`${h2}h ${m2}m`)}\n`;
            });

            return message.channel.send(ansi(lines.trim()));
        }

        // ── hosted stop <token> ───────────────────────────────────────
        if (sub === 'stop') {
            const token = args[1];
            if (!token) return message.channel.send(ansi(`${red('Error')}: ${blue('Provide token to stop')}`));

            const result = await stopHosted(token);
            if (result.success) {
                return message.channel.send(ansi(`${gray('Hosted')}: ${red(`@${result.username} stopped`)}`));
            } else {
                return message.channel.send(ansi(`${red('Error')}: ${blue(result.error)}`));
            }
        }

        // ── hosted <token> <prefix> ───────────────────────────────────
        const token = args[0];
        const prefix = args[1];

        if (!token || !prefix) {
            return message.channel.send(ansi(`${red('Error')}: ${blue('Usage: hosted <token> <prefix>')}`));
        }

        await message.channel.send(ansi(`${gray('Hosting')}: ${blue('Connecting...')}`));

        const result = await startHosted(token, prefix, message.author.id);

        if (result.success) {
            return message.channel.send(ansi(
                `${gray('Hosted')}: ${green(`@${result.username}`)}\n` +
                `${gray('Prefix')}: ${blue(prefix)}\n` +
                `${gray('ID')}    : ${blue(result.id)}\n` +
                `${gray('Status')}: ${green('online')}`
            ));
        } else {
            return message.channel.send(ansi(`${red('Error')}: ${blue(result.error)}`));
        }
    }
};
