import os from 'os';
import { formatTime } from '../../utils/functions.js';

export default {
    name: 'selfinfo',
    description: 'Display selfbot information',
    aliases: ['botinfo', 'info', 'stats'],
    usage: '',
    category: 'settings',
    type: 'both',
    cooldown: 10,

    execute: async (client, message, args) => {
        const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const uptime = formatTime(client.uptime);
        const ping = Math.round(client.ws.ping);
        const cmds = client.commands?.size || 0;
        const guilds = client.guilds?.cache?.size || 0;
        const friends = client.relationships?.cache?.filter(r => r.type === 'FRIEND')?.size || 0;
        const platform = `${os.platform()} ${os.arch()}`;

        return message.channel.send(
            `> fallen** · svrOx.\n` +
            `> \n` +
            `> user** — ${client.user.tag}\n` +
            `> id** — ${client.user.id}\n` +
            `> \n` +
            `> ping** — ${ping}ms\n` +
            `> uptime** — ${uptime}\n` +
            `> memory** — ${mem}MB\n` +
            `> platform** — ${platform}\n` +
            `> node** — ${process.version}\n` +
            `> \n` +
            `> commands** — ${cmds}\n` +
            `> servers** — ${guilds}\n` +
            `> friends** — ${friends}`
        );
    }
};
