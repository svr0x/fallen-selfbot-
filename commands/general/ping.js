import { formatTime } from '../../utils/functions.js';

export default {
    name: 'ping',
    description: 'Check latency, uptime and memory usage',
    aliases: ['latency', 'pong'],
    usage: '',
    category: 'general',
    type: 'both',
    cooldown: 5,

    execute: async (client, message, args) => {
        const msg = await message.channel.send('> pinging...');
        const latency = msg.createdTimestamp - message.createdTimestamp;
        const api = Math.round(client.ws.ping);
        const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const uptime = formatTime(client.uptime);

        return msg.edit(
            `> ping** — ${latency}ms\n` +
            `> api** — ${api}ms\n` +
            `> memory** — ${mem}MB\n` +
            `> uptime** — ${uptime}`
        );
    }
};
