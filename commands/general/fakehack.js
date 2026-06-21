import { log } from '../../utils/functions.js';

export default {
    name: 'fakehack',
    description: 'Simulate hacking someone with a fake terminal output',
    aliases: ['hack', 'fh'],
    usage: '<@user/userID>',
    category: 'general',
    cooldown: 10,

    execute: async (client, message, args) => {
        if (!args[0]) return;

        let target;
        try {
            const id = args[0].replace(/[<@!>]/g, '');
            target = await client.users.fetch(id).catch(() => null);
        } catch {}
        if (!target) return message.channel.send('> user not found');

        const ip = `${rand(10,255)}.${rand(0,255)}.${rand(0,255)}.${rand(0,255)}`;
        const mac = [...Array(6)].map(() => rand(0,255).toString(16).padStart(2,'0')).join(':');
        const port = [22, 80, 443, 3306, 8080, 25565][rand(0,5)];
        const loc = ['Philippines', 'United States', 'Japan', 'Germany', 'Singapore'][rand(0,4)];
        const isp = ['PLDT', 'Globe Telecom', 'Converge ICT', 'SKY Broadband', 'DITO'][rand(0,4)];
        const os = ['Windows 11', 'Ubuntu 22.04', 'Debian 12', 'macOS Sonoma'][rand(0,3)];
        const hash = [...Array(32)].map(() => '0123456789abcdef'[rand(0,15)]).join('');

        const frames = [
            `\`\`\`\n[*] Initializing attack module...\n[*] Target: ${target.username}\n[*] Scanning open ports...\`\`\``,
            `\`\`\`\n[*] Port scan complete\n[+] Port ${port} OPEN\n[*] Identifying OS fingerprint...\`\`\``,
            `\`\`\`\n[+] OS Detected: ${os}\n[*] Fetching IP address...\n[+] IP: ${ip}\`\`\``,
            `\`\`\`\n[+] MAC: ${mac}\n[+] Location: ${loc}\n[+] ISP: ${isp}\n[*] Bypassing firewall...\`\`\``,
            `\`\`\`\n[*] Firewall bypassed!\n[*] Injecting payload...\n[>>>>>>>>>>>>>>] 100%\`\`\``,
            `\`\`\`\n[+] Payload injected!\n[*] Extracting credentials...\n[*] Cracking password hash...\`\`\``,
            `\`\`\`\n[+] Hash: ${hash}\n[+] Password cracked!\n[*] Establishing backdoor...\`\`\``,
            `\`\`\`\n[+] Backdoor established!\n[+] Access granted to ${target.username}\n[!] HACK COMPLETE — ${ip} OWNED\`\`\``,
        ];

        const msg = await message.channel.send(frames[0]);
        for (let i = 1; i < frames.length; i++) {
            await sleep(1500);
            await msg.edit(frames[i]).catch(() => {});
        }
    }
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = ms => new Promise(r => setTimeout(r, ms));
