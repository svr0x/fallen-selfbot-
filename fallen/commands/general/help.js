export default {
    name: 'help',
    description: 'Show help menu, categories, or command details',
    aliases: ['h', 'cmds', 'commands'],
    usage: '[category|command] [page]',
    category: 'general',
    type: 'both',
    permissions: ['SendMessages'],
    cooldown: 3,

    execute: async (client, message, args) => {
        const { commands } = client;
        const prefix = client.prefix;
        const VERSION = '1.0.0';

        const gray  = t => `\u001b[30m${t}\u001b[0m`;
        const blue  = t => `\u001b[0;34m${t}\u001b[0m`;
        const white = t => `\u001b[0;37m${t}\u001b[0m`;
        const bold  = t => `\u001b[1m\u001b[4m${t}\u001b[0m`;
        const ansi  = t => `\`\`\`ansi\n${t}\n\`\`\``;
        const pad   = (s, l) => s + ' '.repeat(Math.max(0, l - s.length));

        const CATEGORIES = {
            AI:         'AI & chat commands',
            fun:        'Fun & entertainment',
            general:    'General & config',
            hosting:    'Host tokens as selfbots',
            media:      'Media & image commands',
            misc:       'Nuke, webhook & misc',
            moderation: 'Moderation commands',
            nsfw:       'NSFW commands',
            server:     'Server management',
            settings:   'Settings & config',
            status:     'Status & RPC',
            troll:      'Troll & chatpack',
        };

        const ITEMS_PER_PAGE = 8;

        // ── no args: main menu ────────────────────────────────────────
        if (!args.length) {
            let out = '';
            out += ansi(`${gray('Category')}: ${blue(`${prefix}help <category> [page]`)}\n${gray('Command')} : ${blue(`${prefix}help <command>`)}`);
            out += ansi(`${bold('Categories')}\n` +
                Object.entries(CATEGORIES).map(([cat, desc]) =>
                    `${white(pad(cat, 12))}${gray('| ')}${blue(desc)}`
                ).join('\n')
            );
            out += ansi(`${gray('Ver')}: ${blue(VERSION)}`);
            return message.channel.send(out);
        }

        const firstArg = args[0].toLowerCase();
        const ITEMS_PER_PAGE_ACTUAL = ITEMS_PER_PAGE;

        // ── +help <command> ───────────────────────────────────────────
        const cmd = commands.get(firstArg) ||
            [...commands.values()].find(c => c.aliases?.map(a => a.toLowerCase()).includes(firstArg));

        if (cmd && isNaN(args[1])) {
            let out = ansi(`${gray('Command')}: ${blue(`${prefix}${cmd.name}`)}`);
            let details = `${bold('Details')}\n`;
            details += `${white(pad('Info',    7))}${gray('| ')}${blue(cmd.description || 'No description')}\n`;
            details += `${white(pad('Usage',   7))}${gray('| ')}${blue(`${prefix}${cmd.name}${cmd.usage ? ' ' + cmd.usage : ''}`)}\n`;
            if (cmd.aliases?.length) details += `${white(pad('Aliases', 7))}${gray('| ')}${blue(cmd.aliases.slice(0, 6).join(', '))}\n`;
            if (cmd.category) details += `${white(pad('Category',7))}${gray('| ')}${blue(cmd.category)}\n`;
            out += ansi(details.trim());
            out += ansi(`${gray('Ver')}: ${blue(VERSION)}`);
            return message.channel.send(out);
        }

        // ── +help <category> [page] ───────────────────────────────────
        const catCmds = [...commands.values()].filter(c =>
            (c.category || 'general').toLowerCase() === firstArg
        );

        if (!catCmds.length) {
            return message.channel.send(ansi(`${gray('Error')}: ${blue(`Category or command not found: "${args[0]}"`)}`));
        }

        catCmds.sort((a, b) => a.name.localeCompare(b.name));

        const page = Math.max(1, Math.min(parseInt(args[1]) || 1, Math.ceil(catCmds.length / ITEMS_PER_PAGE_ACTUAL)));
        const pageCmds = catCmds.slice((page - 1) * ITEMS_PER_PAGE_ACTUAL, page * ITEMS_PER_PAGE_ACTUAL);
        const totalPages = Math.ceil(catCmds.length / ITEMS_PER_PAGE_ACTUAL);
        const displayCat = firstArg.charAt(0).toUpperCase() + firstArg.slice(1);

        let out = ansi(`${gray(displayCat)}: ${blue(`Page ${page}/${totalPages}`)} ${gray('|')} ${blue(`${catCmds.length} commands`)}`);
        let block = `${bold('Commands')}\n`;
        block += pageCmds.map(c =>
            `${white(pad(c.name, 16))}${gray('| ')}${blue(c.description?.slice(0, 45) || 'No description')}`
        ).join('\n');
        out += ansi(block);
        if (totalPages > 1) out += ansi(`${gray('Navigation')}: ${blue(`${prefix}help ${firstArg} [1-${totalPages}]`)}`);

        return message.channel.send(out);
    }
};
