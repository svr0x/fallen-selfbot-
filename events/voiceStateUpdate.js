
import { log } from "../utils/functions.js";
import StalkManager from "../utils/StalkManager.js";

export default {
  name: "voiceStateUpdate",
  once: false,

    execute: async (client, oldState, newState) => {
    if (StalkManager.isStalking(oldState.id)) {
      const userId = oldState.id;
      const guildName = oldState.guild?.name || newState.guild?.name;

      if (!oldState.channelId && newState.channelId) {
        StalkManager.logVoiceEvent(userId, "VOICE_JOIN", {
          guildName: guildName,
          channelName: newState.channel.name,
        });
      }
      else if (oldState.channelId && !newState.channelId) {
        StalkManager.logVoiceEvent(userId, "VOICE_LEAVE", {
          guildName: guildName,
          channelName: oldState.channel.name,
        });
      }
      else if (
        oldState.channelId &&
        newState.channelId &&
        oldState.channelId !== newState.channelId
      ) {
        StalkManager.logVoiceEvent(userId, "VOICE_MOVE", {
          guildName: guildName,
          oldChannelName: oldState.channel.name,
          newChannelName: newState.channel.name,
        });
      }
    }

    // Handle selfbot auto-reconnect functionality
    if (oldState.id !== client.user.id) return;

    const vcConfig = client.config.vc_command;
    if (!vcConfig || !vcConfig.auto_reconnect) return;

    if (oldState.channelId && !newState.channelId) {
      log(
        `Selfbot disconnected from voice channel: ${
          oldState.channel?.name || oldState.channelId
        }`,
        "debug"
      );

      const lastChannel = client.lastJoinedVoiceChannel;
      if (!lastChannel) {
        log(
          "No last joined voice channel recorded, cannot auto-reconnect.",
          "debug"
        );
        return;
      }

      if (lastChannel.attempts >= vcConfig.max_attempts) {
        log(
          `Max auto-reconnect attempts (${vcConfig.max_attempts}) reached for ${lastChannel.channelId}. Giving up.`,
          "error"
        );
        client.lastJoinedVoiceChannel = null;
        return;
      }

      lastChannel.attempts++;
      log(
        `Attempting to auto-reconnect to ${lastChannel.channelId} (Attempt ${lastChannel.attempts}/${vcConfig.max_attempts})...`,
        "debug"
      );

      setTimeout(async () => {
        try {
          const guild = client.guilds.cache.get(lastChannel.guildId);
          if (!guild) {
            log(
              `Guild ${lastChannel.guildId} not found for auto-reconnect.`,
              "error"
            );
            return;
          }

          const channel = await guild.channels.fetch(lastChannel.channelId);
          if (
            !channel ||
            (channel.type !== "GUILD_VOICE" &&
              channel.type !== "GUILD_STAGE_VOICE")
          ) {
            log(
              `Last joined channel ${lastChannel.channelId} is no longer a valid voice channel for auto-reconnect.`,
              "error"
            );
            return;
          }

          if (client.ws.shards.first()) {
            client.ws.shards.first().send({
              op: 4,
              d: {
                guild_id: lastChannel.guildId,
                channel_id: lastChannel.channelId,
                self_mute: lastChannel.mute,
                self_deaf: lastChannel.deafen,
              },
            });
            log(
              `Successfully re-attempted to join voice channel: ${channel.name} (${channel.id})`,
              "success"
            );
          } else {
            log(
              "Could not access WebSocket shard for auto-reconnect.",
              "error"
            );
          }
        } catch (error) {
          log(`Error during auto-reconnect attempt: ${error.message}`, "error");
        }
      }, vcConfig.reconnect_delay * 1000);
    }
  },
};
