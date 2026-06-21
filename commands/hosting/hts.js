import { hostedClients } from '../../utils/HostManager.js';
import { getAltCount, getAlts } from '../../utils/AltsManager.js';
import { checkTokenHealth } from '../../utils/TokenHealth.js';

export default {
    name: 'hts',
    description: 'Show status of main account, all hosted tokens, and alt token health',
    aliases: ['hostedstatus', 'hostingstatus'],
    usage: '',
    category: 'hosting',
    type: 'both',
    ownerOnly: true,
    cooldown: 5,

    execute: async (client, message, args) => {
        const ansi = (t) => `\`\`\`ansi\n${t}\n\`\`\``;
        const gray  = (t) => `\u001b[30m${t}\u001b[0m`;
        const blue  = (t) => `\u001b[0;34m${t}\u001b[0m`;
        const green = (t) => `\u001b[0;32m${t}\u001b[0m`;
        const red   = (t) => `\u001b[0;31m${t}\u001b[0m`;
        const yellow = (t) => `\u001b[0;33m${t}\u001b[0m`;
        const bold  = (t) => `\u001b[1m\u001b[4m${t}\u001b[0m`;
        const pad   = (s, l) => s + ' '.repeat(Math.max(0, l - s.length));

        const statusColor = (status) => {
            if (status === 'safe') return green('safe');
            if (status === 'limited') return yellow('limited');
            if (status === 'dead') return red('dead');
            return gray('unknown');
        };

        const loadingMsg = await message.channel.send('` checking token health... `');

        const mainOwnerId = client.user.id;
        const mainStartedAt = client.readyAt ? client.readyAt.getTime() : Date.now();
        const mainStatus = await checkTokenHealth(client.token);

        const hosted = [...hostedClients.values()];

        let lines = `${bold('Main Account')}\n\n`;

        const mUptime = Math.floor((Date.now() - mainStartedAt) / 1000);
        const mHrs = Math.floor(mUptime / 3600);
        const mMins = Math.floor((mUptime % 3600) / 60);
        const mSecs = mUptime % 60;
        const mainAlts = getAltCount(mainOwnerId);
        const mainAltsLabel = mainAlts > 0 ? `${mainAlts} alts hosted` : 'no hosted alts tokens';

        lines += `${gray(pad('[main]', 8))} ${blue(pad(`@${client.user.username}`, 20))} ${gray('|')} `;
        lines += `${green(`${mHrs}h ${mMins}m ${mSecs}s`)} ${gray('|')} `;
        lines += `${statusColor(mainStatus)} ${gray('|')} `;
        lines += `${blue(mainAltsLabel)}\n`;

        const mainAltEntries = getAlts(mainOwnerId);
        for (const alt of mainAltEntries) {
            const altStatus = await checkTokenHealth(alt.token);
            lines += `${gray(pad('  └─', 8))} ${blue(pad(`@${alt.username}`, 20))} ${gray('|')} `;
            lines += `${statusColor(altStatus)}\n`;
        }

        if (hosted.length) {
            lines += `\n${bold('Hosted Tokens & Alts')}\n\n`;
            for (let i = 0; i < hosted.length; i++) {
                const h = hosted[i];
                const uptime = Math.floor((Date.now() - h.startedAt) / 1000);
                const hrs  = Math.floor(uptime / 3600);
                const mins = Math.floor((uptime % 3600) / 60);
                const secs = uptime % 60;

                const hostedTokenStatus = await checkTokenHealth(h.token);
                const altCount = getAltCount(h.id);
                const altsLabel = altCount > 0 ? `${altCount} alts hosted` : 'no hosted alts tokens';

                lines += `${gray(pad(`[${i + 1}]`, 8))} ${blue(pad(`@${h.username}`, 20))} ${gray('|')} `;
                lines += `${blue(pad(`prefix: ${h.prefix}`, 14))} ${gray('|')} `;
                lines += `${green(`${hrs}h ${mins}m ${secs}s`)} ${gray('|')} `;
                lines += `${statusColor(hostedTokenStatus)} ${gray('|')} `;
                lines += `${blue(altsLabel)}\n`;

                const hostedAltEntries = getAlts(h.id);
                for (const alt of hostedAltEntries) {
                    const altStatus = await checkTokenHealth(alt.token);
                    lines += `${gray(pad('  └─', 8))} ${blue(pad(`@${alt.username}`, 20))} ${gray('|')} `;
                    lines += `${statusColor(altStatus)}\n`;
                }
            }
        } else {
            lines += `\n${gray('No hosted tokens online')}\n`;
        }

        const header = ansi(`${gray('Token Status')} ${gray('|')} ${blue(`${1 + hosted.length} account(s)`)}`);

        await loadingMsg.delete().catch(() => {});
        return message.channel.send(header + ansi(lines.trim()));
    }
};
