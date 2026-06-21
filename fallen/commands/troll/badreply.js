import { log } from '../../utils/functions.js';
import TaskManager from '../../utils/TaskManager.js';
import { getAltClients, ownerIdFor } from '../../utils/AltsManager.js';

export const badReplySessions = new Map();

// Chatpack messages from screenshots - randomized with # formatting
const CHATPACK = [
    // Heavy insults
    "# ur my bitch", "# WEAK", "# ASS", "# FUCK", "# TOY", "# LOLOL",
    "# UR FUCKING SLOW RETARD", "# U SUCK NIGGA", "# GO FASTER BITCH",
    "# SLOW ASS NIGGA", "# UR A FUCKING LOSER", "# IS IT A PLANE",
    "# ITS JUST THIS WEAK ASS NIGGA", "# ur so fucking weak lmao",
    "# GET GOOD", "# LOSER", "# UR ACTUALLY COOKED",
    "# nigga ur a fucking dog little ugly trash ass bitch loner ass bitch",
    "# ur my son and u died shut the fuck up ur boring as fuck ur my jr",
    "# ur shitty as fuck shut the fuck up ur slow as fuck nigga ur scary as fuck lmao",
    // Medium insults
    "## girly ass little fucking loser ur a fucking loner ur weak",
    "## ur slutty as fuck ur slow as shit nigga ur horrible",
    "## shut the fuck up loner ass dork ur my son",
    "## ur so shitty shut the fuck up ur cringe as fuck nigga ur ugly",
    "## ur fat as fuck horrible ass cuck frail ass nigga",
    "## ur a cuck ur slutty corny ass retard",
    "## ur slutty as fuck frail ass nigga ur slutty",
    "## ur shitty nerd ass bitch ur so fucking slow",
    "## gay ass nigga ur sassy as fuck lonely ass nigga",
    "## ugly ass fucking loser frail ass dork faggot ass nigga",
    "## slow ass fucking dork sassy ass dork pussy ass nigga",
    "## ur so fucking ass ur shitty as fuck ur ass as fuck retard",
    "## ur a fucking loser and ur not legit and ur my son",
    "## retarded little bitch ur frail as fuck nerdy ass bitch",
    "## ur my bitch dumb ass fucking cuck nigga shut the fuck up",
    // Normal text
    "ratio", "L + ur bad", "no one asked", "trash", "embarrassing",
    "stay mad", "cope", "ur actually cooked", "talk to me when ur good",
    "ur so ass ur a fucking retard nigga ur ass",
    "ur my bitch ur a little bitch ur my fucking son lmao",
    "tranny ass nigga cuck ass bitch ur fat as fuck nigga",
    "ur a fucking loser and i see through ugly bitch ur a fucking cuck ur shitty",
    "ur a boring ass fucking loser lmao ur ugly as fuck nigga ur a moron",
    "nigga didnt u get hoed by rookie lmfaooo disgusting ass nigga shut the fuck up dork",
    "boring ass fucking retard ur not even fun to bully ur a fucking cuck ur so fucking ugly",
    "pedo ass nigga ur nasty ur ass",
    "ur boring as fuck retarded ass bitch ur frail as fuck",
    "shitty ass little retard disgusting ass nigga ur slutty",
    "girly ass fucking loser lmao ur disgusting bitch made ass nigga ur a fucking cuck ur a pussy",
    "sit the fuck down when i speak nigga u aint doing any damage to me lmfamfao ur just a outcast disgusting ass bitch corny ass nigga",
    "ur weak as fuck sassy ass nigga pedophile ass dork",
    "ugly fucking thot ur disgusting ur so fucking ass",
    "ur mad lonely ass nigga ur a fucking transgender",
    "ur a retarded fucking loser and u got hoed nigga ill beat u the fuck down anyday",
    "ur a cornball holy fuck slow ass retarded bitch ass nigga ur cringe as fuck retarded ass bitch",
    "ur a fucking slut ur my fucking son ur my jr",
    "ur slow as fuck ur a fucking retard nigga disgusting ass nigga",
    "shitty ass little bitch ur weak shut the fuck up dork",
    "ur a fucking pussy nigga frail ass dork ur shitty",
    "sor jr ass nigga lmao ur my fucking son shut the fuck up dork",
    "nigga ur a fucking slut and ur fat as fuck ur my bitch shut the fuck up nigga ur slutty",
    "ur a fucking retard ur a fucking pussy nigga jr ass nigga",
    "nigga ran jr ass nigga cringe ass cuck",
    "pussy ass nigga ur ugly as fuck retard ur my jr nigga",
    "yes nigga we are beefing until my fingers tap the fuck out lmao ur my little fucking bitch",
    "weak ass whore nigga died frail ass nigga",
    "faggot ass nigga bitch ass nigga died",
    "ur my junior ur disgusting loner ass dork",
    "ur trash as fuck gay ass little bitch pedophile ass bitch",
    "ur my fucking bitch shitty fuck jr ass nigga",
    "you hate ur whole life and you cant impress me ur a sassy ass dork cringe ass bitch",
    "lame ass nigga ur sassy as fuck sassy ass bitch",
    "ur gay cringe ass cuck ur shitty as fuck to me",
    "dumb ass nigga ur my fucking jr trash ass pussy",
    "ur so fucking ass shut the fuck up faggot ur frail as fuck ur slutty as fuck",
    "you corny faggot ass nigga boring ass nigga",
    "count down starts from now stop being my little bitch or ur executed retard moron ass nigga ur a fucking pedophile",
    "pedophile ass little bitch retard ass bitch shut the fuck up",
    "ur lame as fuck ur trash as fuck ur retarded",
    "pick up ur chest shut the fuck up ur horrible as fuck slutty ass nigga",
    "dogshit ass nigga hoe ass nigga died",
    "nigga fucking died wow ur my bitc horrible ass cuck nasty ass nigga",
    "thot ass nigga shitty fucking bitch ur a fucking bitch",
    "ur my son lmao ur ugly as fuck shut the fuck up pedophile ass bitch",
    "### ur my son ur slow as fuck nigga ur ugly",
    "### ur a dork moron ass bitch ur fat",
    "### ur my fucking jr corny ass retard sassy ass retard",
    "### if u ever checked ur iq then ud scientifically be proven to be the biggest fucking lethargic shit skinned faggot",
    "### loner ass nigga fat ass little bitch fat little fucking nerd ass bitch",
    "### thot ass nigga corny ass nigga ur nasty",
    "### thot ass dork ur weak ur my bitch nigga lmao",
    "### thot ass dork moron ass bitch ur weak",
    "### lmfao ur a fucking moron corny ass retard",
    "### ur slutty as fuck slow fucking loser pedophile ass nigga",
    "### pussy ass bitch nigga died ur fucking retarded nerd",
    "### ugly retarded ass nigga ur my son lame ass bitch",
    "### slutty ass nigga ur slow as fuck cringe ass moron",
];

function getBadReplies() {
    return CHATPACK;
}

export { getBadReplies };

export default {
    name: 'badreply',
    description: 'Auto chatpack a specific user',
    aliases: ['br', 'toxicreply', 'cpack', 'chatpack'],
    usage: '<@user/user_id> | <amount> <@user/user_id> -alts | stop <@user/user_id>',
    category: 'troll',
    type: 'both',
    cooldown: 5,

    async execute(client, message, args) {
        if (!args.length) return;

        const sub = args[0].toLowerCase();

        // stop
        if (sub === 'stop' || sub === 'spack') {
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
            for (const [key, session] of badReplySessions) {
                if (session.task) session.task.stop();
            }
            badReplySessions.clear();
            return message.channel.send('> stopped all cpack sessions');
        }

        // list
        if (sub === 'list') {
            if (!badReplySessions.size) return message.channel.send('> no active sessions');
            const list = [...badReplySessions.values()].map(s => `> • **${s.username}**`).join('\n');
            return message.channel.send(`> active cpack:**\n${list}`);
        }

        const isAlts = args.includes('-alts');
        const cleanArgs = args.filter(a => a !== '-alts');

        if (isAlts) {
            if (cleanArgs.length < 2) {
                return message.channel.send('` usage: +cpack <amount> @user -alts `');
            }
            const amount = parseInt(cleanArgs[0]);
            if (!amount || amount < 1) {
                return message.channel.send('` usage: +cpack <amount> @user -alts `');
            }
            const target = message.mentions.users.first()
                || await client.users.fetch(cleanArgs[1].replace(/[<@!>]/g, '')).catch(() => null);
            if (!target) return message.channel.send('> user not found');

            const ownerId = ownerIdFor(client);
            const altClients = getAltClients(ownerId, amount);
            if (!altClients.length) {
                return message.channel.send('` no alts hosted, use +alts <token> first `');
            }

            const sessionKey = `${message.guild?.id || 'dm'}_${target.id}_alts`;
            if (badReplySessions.has(sessionKey)) {
                return message.channel.send(`> already cpackin **${target.username}** with alts`);
            }

            const guildId = message.guild?.id || 'dm';
            const taskName = `badreplyalts_${sessionKey}`;
            const task = TaskManager.createTask(taskName, guildId);
            if (!task) return;

            badReplySessions.set(sessionKey, { task, username: target.username, targetId: target.id });

            const phrases = getBadReplies();
            const channelId = message.channel.id;

            const runAltsLoop = async () => {
                while (!task.signal.aborted) {
                    try {
                        for (const altClient of altClients) {
                            if (task.signal.aborted) break;
                            let phrase = phrases[Math.floor(Math.random() * phrases.length)];
                            if (Math.random() < 0.25) phrase += ` <@${target.id}>`;
                            try {
                                const ch = altClient.channels.cache.get(channelId);
                                if (ch) await ch.send(phrase);
                            } catch {}
                        }
                        const delay = Math.floor(Math.random() * 20) + 10;
                        await new Promise(r => {
                            const t = setTimeout(r, delay);
                            task.signal.addEventListener('abort', () => { clearTimeout(t); r(); });
                        });
                    } catch (e) {
                        if (task.signal.aborted) break;
                        await new Promise(r => setTimeout(r, 500));
                    }
                }
            };

            runAltsLoop().catch(() => {});
            return message.channel.send(`> cpack -alts started on **${target.username}** | ${amount} alts`);
        }

        // start - +cpack @user
        const target = message.mentions.users.first()
            || await client.users.fetch(args[0].replace(/[<@!>]/g, '')).catch(() => null);

        if (!target) return message.channel.send('> user not found');

        const sessionKey = `${message.guild?.id || 'dm'}_${target.id}`;
        if (badReplySessions.has(sessionKey)) {
            return message.channel.send(`> already cpackin **${target.username}**`);
        }

        const guildId = message.guild?.id || 'dm';
        const taskName = `badreply_${sessionKey}`;
        const task = TaskManager.createTask(taskName, guildId);
        if (!task) return;

        badReplySessions.set(sessionKey, { task, username: target.username, targetId: target.id });

        const phrases = getBadReplies();

        const runLoop = async () => {
            while (!task.signal.aborted) {
                try {
                    // Pick random phrase
                    let phrase = phrases[Math.floor(Math.random() * phrases.length)];

                    // Randomly mention the target occasionally
                    if (Math.random() < 0.25) {
                        phrase += ` <@${target.id}>`;
                    }

                    await message.channel.send(phrase);

                    // Random delay 10-30ms - super fast
                    const delay = Math.floor(Math.random() * 20) + 10;
                    await new Promise(r => {
                        const t = setTimeout(r, delay);
                        task.signal.addEventListener('abort', () => { clearTimeout(t); r(); });
                    });
                } catch (e) {
                    if (task.signal.aborted) break;
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        };

        runLoop().catch(() => {});
        return message.channel.send(`> cpack started on **${target.username}**`);
    }
};
