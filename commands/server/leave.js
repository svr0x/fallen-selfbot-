import { log } from "../../utils/functions.js";

export default {
  name: "leave",
  description: "Leave the current server immediately.",
  aliases: ["exit", "leaveserver", "exitserver"],
  usage: "",
  category: "server",
  type: "server_only",
  permissions: ["SendMessages"],
  cooldown: 5,

  execute: async (client, message, args) => {
    try {
      if (!message.guild) {
        return message.channel.send(
          "> ❌ This command can only be used in servers."
        );
      }

      if (message.author.id !== client.user.id) return;

      const guildName = message.guild.name;
      const guildId = message.guild.id;

      try {
        // Send confirmation message before leaving
        await message.channel.send(`> 👋 Leaving server: **${guildName}**...`);

        await new Promise((resolve) => setTimeout(resolve, 500));

        // Leave the server
        await message.guild.leave();

        // Log the action
        log(`Successfully left guild ${guildName} (${guildId})`, "debug");

      } catch (error) {
        log(
          `Failed to leave guild ${guildName} (${guildId}): ${error.message}`,
          "error"
        );

        try {
          message.channel.send(
            "> ❌ Failed to leave the server. Check console for details."
          );
        } catch {
          log("Could not send error message to channel", "warn");
        }
      }
    } catch (error) {
      console.error(error);
      message.channel.send("> ❌ An unexpected error occurred.");
    }
  },
};
