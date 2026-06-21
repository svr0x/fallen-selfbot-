import { log } from '../../utils/functions.js';
import TaskManager from '../../utils/TaskManager.js';
import { getAltClients, ownerIdFor } from '../../utils/AltsManager.js';
import RateLimitManager from '../../utils/RateLimitManager.js';

export const badReplySessions = new Map();

// each entry = one full block, sent as ONE message via .send()
const CHATPACK = [
`faggot ass nigga pussy ass nigga ur a fucking retard
you got cucked by maxine dont cope retarded ass nigga your slow nigga ur slow as fuck nigga
i wont leave chat u can though ur ugly nigga ur my fucking son
lmfao corny ass retard your fat as fuck nigga
youre slow as fuck stop fucking hiding geek youre fucking shit nigga your fucking trash youre weird as fuck why am i fast as fuck your a fucking bitch little fucking nerd your a fucking nerd your retarded as fuck your a fucking loser niggas a fucking faggot ur a fucking dork horrible ass loser
shitty ass nigga ur soft as fuck lmfao ur my son frail ass bitch trash ass nigga
ur my bitch ur a little bitch ur shitty as fuck to me
ur fat cringe ass retard pedophile ass dork`,

`ur my junior ur a fucking retard nigga your disgusting
hustling through the night yea lonely ass nigga trash ass bitch
i wont stop shitty ass little retard jr ass nigga sassy ass bitch
lmao retard ass nigga your so fucking slow
your lame as fuck ur a fucking dork shut the fuck up dork
thot ass nigga your my bitch nigga lmfao ur my fucking son
ur shitty horrible ass nigga nasty ass nigga`,

`soft ass nigga who the fuck are ur slutty as fuck your a moron
ur my fucking son your sassy as fuck ur slow as fuck
ur weak as fuck ur shitty as fuck nerd ass bitch
ur my bitch horrible ass dork ur fat as fuck retard
u cannot fuck with me and thats on god pussy ass nigga corny ass nigga disgusting ass bitch
fat ass fuckign cuck idk u sassy ass nigga corny ass dork
nigga tried to run and he fucking tripped so now im ripping his limbs open dumbass fuck nigga frail ass nigga your so fucking slow
ur gay as fuck trash ass bitch your corny as fuck
nigga ur a bitch retard your ugly as fuck nigga ur my fucking son
ur my son lmfao ur ugly as fuck your sassy as fuck your boring as fuck
ur my fucking bitch lame ass bitch your horrible as fuck
ugly bitch ass nigga ur my son nigga ur slow as fuck sassy ass cuck`,

`loser ass nigga your ass
ur a little loser bitch ass nigga ur slutty as fuck
sorry ass nigga your boring as fuck disgusting ass nigga
shitty ass nigga ur my jr bitch ass nigga
apparently u tried to hop out on so many high tiers and u failed too slow ass fucking nerd
corny ass dork`,

`ur broke and ur my bitch nigga ur weak your frail as fuck
nigga is ugly as fuck and your slow nigga little fucking loser ass nigga cringe ass bitch
ur so dogshit pedophile ass dork your ass
ur my bitch ur a fucking retard lonely ass bitch
lmfao horrible ass retard boring ass nigga`,

`ur weak and u deepthroat feces nerdy ass bitch ur slutty
ugly ass nigga ur shitty transgender ass nigga
stupid ass nigga ur my son nigga boring ass nigga your so fucking ugly nigga
thot ass nigga sassy ass nigga frail ass bitch
u cant spell either retarded fucking clown nigga ur ugly lonely ass nigga
ur a fucking retard ur a dork ur a fucking dork
pussy ass nigga your my son ur my son`,

`slow ass little fucking loser who the fuck are u retarded ass bitch ass nigga
ur a bitch lonely ass nigga gay ass little bitch
dog shit ass nigga retard ass nigga cringe ass bitch
ur a fucking slut your so fucking slow cuck ass bitch
ur so ass your my jr nigga your boring as fuck
ur my son faggot ass nigga nasty ass nigga
short ass pussy ur my fucking son lmfao dork ass nigga
hoe ass nigga your a fucking dork nigga nerd ass bitch
im built for this buff shit u not tho ur ugly as fuck and your my bitch ur a fucking retard ur my fucking son
dork ass nigga ur slutty as fuck moron ass nigga
ur my junior shut the fuck up cuck nerdy ass bitch`,

`frail ass nigga ur slow as fuck nigga
ur a fucking thot and i dont fw u nigga i hope u can acknoledge this lmfaooo your ugly as fuck nigga pussy ass nigga
lame ass nigga your lonely frail ass dork
ur shitty horrible ass nigga your cringe as fuck
ima spin and beat ur fucking head off retaded fucking thot ass nigga your horrible as fuck boring ass nigga
ur a fucking thot and i dont want u to see the light of day every agian your a fucking bitch lonely ass bitch`,

`u thought u solved a riddle retarded fuck shut the fuck up u arent a dedective ur shitty as fuck to me sassy ass nigga
ur my bitch ur my fucking bitch nigga your fat as fuck nigga
ugly cuck your a fucking dork nigga pedophile ass dork
short ass pussy your slow nigga faggot ass nigga`,

`nigga your my bitch and your aberration is gonna affect you retarded fucking dork you arent doing damage your a fucking cuck nerd ass bitch
retard ass nigga frail ass dork ur shitty as fuck to me
ur weak retarded ass bitch transgender ass nigga
ur my fucking bitch fat ass fucking bitch ass nigga shitty ass fuck lmfao
ur my bitch fat nigga ur a fucking loser who the fuck is u talking to fat fucking whore your fat as fuck nigga
ur a fucking pedophile ur weak ur my fucking bitch nigga
your trash as fuck your cringe as fuck loner ass bitch
ur my little fucking son gay ass retarded fucking queer your a fucking dork nigga your a moron
nigga ill rip your bloody tongue out and make you limp while reaching out for help hoe ass nigga ur a little bitch
your fucking ass shut the fuck up cuck your slow as shit nigga
ur so ass your fat as fuck nigga your so fucking ugly`,

`i killed ur friends in coldblood where did they go lmfao lame ass bitch ur shitty as fuck retard
ur my bitch dumb sassy ass nigga now shut the fuck up your a fucking loner gay ass little bitch
this bta is cash money ur shit as fuck ur slow loner ass nigga
retarded ass queer ass nigga slow fucking loser your ugly as fuck nigga
ur a retarded fucking moron and u got hoed lmfao trash ass pussy ur a little bitch
ur angry your a fucking cuck your lonely
stupid ass nigga ur my son nigga boring ass nigga your a fucking bitch
femboy ass nigga your a pussy sassy ass nigga
ugly retarded ass nigga your my son your a fucking pussy nigga
thot ass nigga your my jr nigga nerdy ass bitch
ur so ass ur ass as fuck died`,

`ur a fucking tranny ur weak cringe ass bitch
ur a fucking loser ur slutty as fuck lonely ass nigga
ur a cuck ur shitty as fuck your a fucking pedophile
gay ass cuck nigga your scary as fuck lmao your a fucking pedophile
dumb ass bitch retard ass bitch slow fucking loser
ur ass ur slow as fuck your nasty
trash ass nigga horrible ass dork slutty ass nigga
why wouldnt u expect me to move faster than u nigga ur slow as fuck ur not a fast typist
shut the fuck up bitch ur fat as fuck retard
ur mad and im above u in every case retarded fuck your ugly as fuck ugly cuck nasty ass nigga ur slow as fuck nigga
lmao ur a dork ur weak`,

`u do everything i tell u to do and when i eseak to you start panicking ur my jr horrible ass retard
dork ass nigga teally ass little bitch ur slow
u got hoed terribly ur a fucking retard nigga ur shitty
you wish you had skills like me but your to emotional retarded fucking dork you arent messing with anyone and your my little bitch retarded fuck ur slow as fuck retard ass nigga
ur my fucking bitch trash ass pussy ur slutty as fuck`,

`trash ass nigga your a moron shitty fuck
u cant beef ur slutty as fuck nigga your so fucking retarded your a fucking cuck
ur shitty as fuck and i dont like u gay ass little bitch pedophile ass dork
dork ass nigga died ur shitty as fuck
here lmfao lame ass nigga your nasty
ur slow as fuck your cringe as fuck ur fat as shit
ur a ugly faggot overweight your a fucking loner transgender ass bitch`,

`shut the fuck up horrible ass nigga your a fucking loner
ur ugly as fuck cringe ass bitch slow ass fucking nerd
ur retarded as fuck ur my fucking son ur a dork
ur my son nigga ur my bitch ur not fast transgender ass nigga ur a dork
ur slow retarded little bitch shut the fuck up
retard ass nigga ur slutty as fuck ur fat as shit
slow ass nigga ur shitty as fuck retard ur my fucking son
ur a pedophile lame queer nigga ur my bitch and ur ugly loner ass nigga boring ass nigga
fat ass fucking loser ur not good and now ur beefing for hours too dumb ass fucking loser ur slow ur slutty as fuck
ur just an outcast ur slow as fuck sassy ass retard`,

`ur a cuck pussy ass bitch fat little fucking nerd ass bitch
retarded ass fucking cuck ur a nobody ur retarded corny ass retard
ur a pedophile nigga ur ugly as fuck and a faggot your slow as fuck nigga ur shitty as fuck
ur my fucking jr and your retarded your fucking retarded nerd sassy ass cuck
nigga ill kill you and do it again til the ends of earth break bitchass pussy your my son ur weak
broke ass little fucking slut horrible ass bitch femboy ass nigga
ur weak as fuck gay ass nigga retarded ass bitch corny ass retard
ur my fucking bitch ur shitty as fuck to me scary ass nigga
ur a cuck ur slutty pussy ass nigga
who is this mere mortal your my son your slow as fuck nigga
ur a dork ur slutty as fuck jr ass nigga
sorry ass nigga your so fucking ass ur slutty as fuck`,

`ur my son and ur ugly as fuck cuck ass bitch your slow as shit nigga
lmfao ur my jr thot ass nigga
ur shitty as fuck shut the fuck up ur a fucking dork cringe ass retard
ur embarrassing ur fucking son lmfao scary ass nigga
shut the fuck up your my jr nigga retarded little bitch
retarded ass queer ass nigga your a fucking moron retarded ass bitch
ur a fucking dork and u died to me weak fuck whore ur a retard nigga ur my fucking son lmfao frail ass bitch
dork ass nigga your fat as fuck nigga
lame ass nigga ur shitty as fuck your horrible
ur my bitch lmfao ur ansty as fuck too ur my fucking son ur weak
ur ugly as fuck your ugly as fuck nigga nerdy ass bitch
slow ass nigga cringe ass moron horrible ass cuck`,

`dumb ass little thot cringe ass bitch ur ass as fuck retard
ur a nobody your slow nigga corny ass retard
shitty ass nigga u got abducted your ass ur fat
ur a fucking loser and ur a troop and ur my bitch your lonely ur ass as fuck retard`,

`nigga so come do smth about it press the issue go on oh ai then ur my fucking son lmao your trash as fuck ur slow as fuck nigga
ur my son and ur a geek your a fucking bitch ass nigga
nigga i dont fw ur wl change it its boring me your slow as shit nigga retarded little bitch
shitty ass nigga your a moron cuck ass nigga
faggot ass nigga your a fucking pussy nigga your cringe as fuck
ur so fucking ass moron ass bitch retard ass nigga
ur lame horrible ass dork your boring as fuck
ur shitty gay ass little bitch corny ass dork
on god i wanna beef u everyday nigga worse then my fucking bitch hoe ass nigga your cringe as fuck
ur my fucking jr loner ass bitch ur shitty as fuck retard
ur my fucking son ur slow as fuck your my son`,

`soft ass bitch nerd ass bitch your so fucking slow
ur so ass fat ass little bitch your a fucking moron
garbage little bitch ur slow as fuck corny ass nigga
your slow as fuck transgender ass bitch pussy ass nigga
niggas see me in this bitch and shit nigga ur a bitch retard your slow as shit nigga moron ass bitch`,

`lmfao horrible ass retard fat little fucking nerd ass bitch
ur my jr nerd ass bitch cuck ass bitch
ur ass as fuck pedophile ass dork shitty ass nigga lmfao
clown nose ass nigga trash ass pussy sassy ass retard
and ur shitty as fuck moron ass nigga horrible ass dork
ur slow and ur my son pussy ass little slutty faggot transgender ass nigga thot ass nigga
dirty ass nigga your fat as fuck nigga sassy ass nigga
nigga tried to run and he fucking tripped so now im ripping his limbs open dumbass fuck`,
];

function getBadReplies() {
    return CHATPACK;
}

// adds # / ## / ### prefix to a block sometimes, plain text most of the time
function formatBlock(block) {
    const roll = Math.random();
    if (roll < 0.12) return `# ${block}`;
    if (roll < 0.20) return `## ${block}`;
    if (roll < 0.26) return `### ${block}`;
    return block;
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
            const rateLimiter = new RateLimitManager(5);

            const runAltsLoop = async () => {
                while (!task.signal.aborted) {
                    try {
                        for (const altClient of altClients) {
                            if (task.signal.aborted) break;
                            let block = formatBlock(phrases[Math.floor(Math.random() * phrases.length)]);
                            block += `\n<@${target.id}>`;
                            try {
                                const ch = altClient.channels.cache.get(channelId);
                                if (ch) {
                                    await rateLimiter.execute(async () => {
                                        await ch.send(block);
                                    }, task.signal);
                                }
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
        const rateLimiter = new RateLimitManager(5);

        const runLoop = async () => {
            while (!task.signal.aborted) {
                try {
                    let block = formatBlock(phrases[Math.floor(Math.random() * phrases.length)]);
                    block += `\n<@${target.id}>`;

                    await rateLimiter.execute(async () => {
                        await message.channel.send(block);
                    }, task.signal);

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
