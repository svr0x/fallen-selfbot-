import { log } from "../../utils/functions.js";
import TaskManager from "../../utils/TaskManager.js";
import RateLimitManager from "../../utils/RateLimitManager.js";
import { getAltClients, ownerIdFor } from "../../utils/AltsManager.js";

export default {
  name: "spam",
  description: "Spam a message in the current channel",
  aliases: ["spammer", "flood"],
  usage: "<count> <message> | <amount> <count> <message> -alts",
  category: "troll",
  type: "both",
  permissions: ["SendMessages"],
  cooldown: 5,

  async execute(client, message, args) {
    if (args.length < 2) return;

    const isAlts = args.includes('-alts');
    const cleanArgs = args.filter(a => a !== '-alts');

    if (isAlts) {
      if (cleanArgs.length < 3) {
        return message.channel.send('` usage: +spam <amount> <count> <message> -alts `');
      }
      const amount = parseInt(cleanArgs[0]);
      const count = parseInt(cleanArgs[1]);
      const spamMessage = cleanArgs.slice(2).join(' ');
      if (!amount || amount < 1 || !count || count <= 0 || !spamMessage.trim()) {
        return message.channel.send('` usage: +spam <amount> <count> <message> -alts `');
      }

      const ownerId = ownerIdFor(client);
      const altClients = getAltClients(ownerId, amount);
      if (!altClients.length) {
        return message.channel.send('` no alts hosted, use +alts <token> first `');
      }

      const channelId = message.channel.id;
      const guildId = message.guild?.id || "dm";
      const taskName = `spamalts_${channelId}`;
      if (TaskManager.hasTask(taskName, guildId)) return;
      const task = TaskManager.createTask(taskName, guildId);
      if (!task) return;

      try {
        for (let i = 0; i < count && !task.signal.aborted; i++) {
          for (const altClient of altClients) {
            if (task.signal.aborted) break;
            try {
              const ch = altClient.channels.cache.get(channelId);
              if (ch) await ch.send(spamMessage);
            } catch {}
          }
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, 50);
            task.signal.addEventListener("abort", () => { clearTimeout(timeout); resolve(); });
          });
        }
      } catch (error) {
        log(`Error in spam -alts command: ${error.message}`, "error");
      } finally {
        task.stop();
      }
      return;
    }

    const count = parseInt(args[0]);
    if (!count || count <= 0) return;

    const spamMessage = args.slice(1).join(" ");
    if (!spamMessage.trim()) return;

    const channelId = message.channel.id;
    const guildId = message.guild?.id || "dm";
    const taskName = `spam_${channelId}`;

    if (TaskManager.hasTask(taskName, guildId)) return;

    const task = TaskManager.createTask(taskName, guildId);
    if (!task) return;

    try {
      const rateLimiter = new RateLimitManager(3);
      let sentCount = 0;
      let isCancelled = false;

      let checkInterval;
      const checkCancellation = () => {
        if (task.signal.aborted || isCancelled) {
          isCancelled = true;
          if (checkInterval) { clearInterval(checkInterval); checkInterval = null; }
        }
      };

      try {
        checkInterval = TaskManager.createInterval(task.id, checkCancellation, 500);
      } catch { isCancelled = true; return; }

      for (let i = 0; i < count && !isCancelled; i++) {
        try {
          if (task.signal.aborted || isCancelled) break;
          await rateLimiter.execute(async () => {
            if (task.signal.aborted || isCancelled) return;
            await message.channel.send(spamMessage);
            sentCount++;
          }, task.signal);
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, 50);
            if (task.signal) task.signal.addEventListener("abort", () => { clearTimeout(timeout); resolve(); });
          });
        } catch (error) {
          if (task.signal.aborted || isCancelled || error.message.includes("cancelled")) break;
        }
      }
    } catch (error) {
      log(`Error in spam command: ${error.message}`, "error");
    } finally {
      task.stop();
    }
  },
};
