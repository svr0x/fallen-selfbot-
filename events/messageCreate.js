
import chalk from "chalk";
import { readAfkData, writeAfkData } from "../utils/afkHandler.js";
import { formatTime, log, loadConfig } from "../utils/functions.js";
import { clownifySessions } from "../commands/fun/clownify.js";
import { badReplySessions, getBadReplies } from "../commands/troll/badreply.js";
import StalkManager from "../utils/StalkManager.js";
import { autoReactHandler } from "../commands/general/autoreact.js";

export default {
  name: "messageCreate",
  once: false,

    execute: async (client, message) => {
    if (message.author.bot) return;

    // Auto-react handler
    await autoReactHandler(client, message).catch(() => {});

    // Load current AFK data from storage
    const afkData = readAfkData();

    const afkIgnorePrefixes = [
      "> 👋 Welcome back!",
      "> ✅ You are now AFK.",
      "> ❌ **Error:**",
      "> 😴",
    ];

    if (
      afkIgnorePrefixes.some((prefix) => message.content.startsWith(prefix))
    ) {
      return;
    }

    if (
      afkData[message.author.id] &&
      !afkIgnorePrefixes.some((prefix) => message.content.startsWith(prefix))
    ) {
      const afkInfo = afkData[message.author.id];
      delete afkData[message.author.id];
      writeAfkData(afkData);

      const timeAfk = formatTime(Date.now() - afkInfo.timestamp);
      await message.channel.send(
        `> 👋 Welcome back! You were AFK for ${timeAfk}.`
      );
      return;
    }

    const mentionedUsers = new Set();

    // Add mentioned users
    if (message.mentions.users.size > 0) {
      message.mentions.users.forEach((user) => mentionedUsers.add(user));
    }

    // Add replied-to user
    if (message.reference && message.reference.messageId) {
      try {
        const repliedToMessage = await message.channel.messages.fetch(
          message.reference.messageId
        );
        if (repliedToMessage && repliedToMessage.author) {
          mentionedUsers.add(repliedToMessage.author);
        }
      } catch (error) {
        // Could not fetch replied to message
      }
    }

    for (const user of mentionedUsers) {
      if (afkData[user.id]) {
        const afkInfo = afkData[user.id];
        const timeAfk = formatTime(Date.now() - afkInfo.timestamp);
        await message.channel.send(
          `> 😴 **${user.username}** is currently AFK: ${afkInfo.reason} (${timeAfk} ago).`
        );
      }
    }

    // Handle clownify reactions
    const guildId = message.guild?.id || "dm";
    const sessionKey = `${message.author.id}:${guildId}`;

    if (clownifySessions.has(sessionKey)) {
      const sessionData = clownifySessions.get(sessionKey);
      try {
        await message.react("🤡");
        sessionData.messageCount++;
        log(
          `Clownified message from ${message.author.username} (${sessionData.messageCount} total)`,
          "debug"
        );
      } catch (error) {
        log(
          `Failed to clownify message from ${message.author.username}: ${error.message}`,
          "warn"
        );

        if (error.status === 403) {
          if (sessionData.task) {
            sessionData.task.stop();
          }
          clownifySessions.delete(sessionKey);
          log(
            `Stopped clownify session for ${message.author.username} due to missing permissions`,
            "debug"
          );
        }
      }
    }

    // Handle bad reply sessions
    if (badReplySessions.has(sessionKey)) {
      const sessionData = badReplySessions.get(sessionKey);
      try {
        const badReplies = getBadReplies();

        // Get a random bad reply
        const randomReply =
          badReplies[Math.floor(Math.random() * badReplies.length)];

        // Reply to the message
        await message.reply(randomReply);
        sessionData.replyCount++;

        log(
          `Bad replied to ${message.author.username} (${sessionData.replyCount} total)`,
          "debug"
        );
      } catch (error) {
        log(
          `Failed to bad reply to ${message.author.username}: ${error.message}`,
          "warn"
        );

        if (error.status === 403) {
          if (sessionData.task) {
            sessionData.task.stop();
          }
          badReplySessions.delete(sessionKey);
          log(
            `Stopped bad reply session for ${message.author.username} due to missing permissions`,
            "debug"
          );
        }
      }
    }

    // Handle stalk logging for message sent
    if (StalkManager.isStalking(message.author.id)) {
      const attachments =
        message.attachments.size > 0
          ? Array.from(message.attachments.values()).map((att) => att.name)
          : [];

      StalkManager.logMessageEvent(message.author.id, "MESSAGE_SENT", {
        guildName: message.guild?.name,
        channelName: message.channel.name,
        content: message.content,
        attachments: attachments,
      });
    }

    if (message.channel.type === "DM") {
      const config = loadConfig();
      if (config.selfbot.dm_logs) {
        console.log(
          chalk.blue(`[DM] ${message.author.tag}: ${message.content}`)
        );
      }
    }
  },
};
