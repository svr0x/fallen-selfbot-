import { hostedClients } from '../../utils/HostManager.js';
import { getAltCount } from '../../utils/AltsManager.js';

export default {
    name: 'hts',
    description: 'Show status of all hosted tokens',
    aliases: ['hostedstatus', 'hostingstatus'],
    usage: '',
    category: 'hosting',
    type: 'both',
    ownerOnly: true,
    cooldown: 3,

    execute: async (client, message, args) => {
        const ansi = (t) => `\`\`\`ansi\n${t}\n\`\`\``;
        const gray  = (t) => `\u001b[30m${t}\u001b[0m`;
        const blue  = (t) => `\u001b[0;34m${t}\u001b[0m`;
        const green = (t) => `\u001b[0;32m${t}\u001b[0m`;
        const red   = (t) => `\u001b[0;31m${t}\u001b[0m`;
        const bold  = (t) => `\u001b[1m\u001b[4m${t}\u001b[0m`;
        const pad   = (s, l) => s + ' '.repeat(Math.max(0, l - s.length));

        const clients = [...hostedClients.values()];

        let header = ansi(`${gray('Hosted Tokens Status')} ${gray('|')} ${blue(`${clients.length} hosted`)}`);

        if (!clients.length) {
            return message.channel.send(header + ansi(`${blue('No hosted tokens online')}`));
        }

        let lines = `${bold('Hosted Tokens & Alts')}\n\n`;
        clients.forEach((h, i) => {
            const uptime = Math.floor((Date.now() - h.startedAt) / 1000);
            const hrs  = Math.floor(uptime / 3600);
            const mins = Math.floor((uptime % 3600) / 60);
            const secs = uptime % 60;

            const altCount = getAltCount(h.id);
            const altsLabel = altCount > 0 ? `${altCount} alts hosted` : 'no hosted alts tokens';

            lines += `${gray(pad(`[${i + 1}]`, 4))} ${blue(pad(`@${h.username}`, 20))} ${gray('|')} `;
            lines += `${blue(pad(`prefix: ${h.prefix}`, 14))} ${gray('|')} `;
            lines += `${green(`${hrs}h ${mins}m ${secs}s`)} ${gray('|')} `;
            lines += `${blue(altsLabel)}\n`;
        });

        return message.channel.send(header + ansi(lines.trim()));
    }
};
