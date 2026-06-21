import { log } from "../../utils/functions.js";

export default {
  name: "vckick",
  description: "Kick a user from their current voice channel",
  aliases: ["voicekick", "vk"],
  usage: "<@user/user_id>",
  category: "moderation",
  type: "server_only",
  permissions: ["MoveMembers"], // Required permission to move/kick users from VC
  cooldown: 3,

  async execute(client, message, args) {
    if (!args.length) {
      return message.channel.send(
        "> Please specify a user to kick from voice channel!**\n" +
          `> Usage:** \`${client.prefix}vckick @user\``
      );
    }

    let targetUser = null;
    let targetMember = null;

    // Parse user from mention or ID
    if (message.mentions.users.size > 0) {
      targetUser = message.mentions.users.first();
    } else if (args[0]) {
      try {
        const userId = args[0].replace(/[<@!>]/g, "");
        if (/^\d+$/.test(userId)) {
          targetUser = await client.users.fetch(userId);
        }
      } catch (error) {
        return message.channel.send(
          "> User not found!** Please mention a valid user or provide a valid user ID."
        );
      }
    }

    if (!targetUser) {
      return message.channel.send(
        "> Please specify a user to kick from voice channel!**\n" +
          `> Usage:** \`${client.prefix}vckick @user\``
      );
    }

    try {
      targetMember = await message.guild.members.fetch(targetUser.id);
    } catch (error) {
      return message.channel.send(
        "> User is not a member of this server!**"
      );
    }

    if (!targetMember.voice.channel) {
      return message.channel.send(
        `> ${targetUser.username} is not in a voice channel!**`
      );
    }

    
    if (
      targetMember.roles.highest.position >=
        message.member.roles.highest.position &&
      message.author.id !== message.guild.ownerId
    ) {
      return message.channel.send(
        "> You cannot kick this user due to role hierarchy!**"
      );
    }

    try {
      const currentChannel = targetMember.voice.channel.name;

      await targetMember.voice.disconnect(
        "Voice kicked by " + message.author.tag
      );

      await message.channel.send(
        `> Successfully kicked ${targetUser.username} from voice channel!**\n` +
          `> 📢 **Channel:** ${currentChannel}`
      );

      log(
        `${message.author.tag} kicked ${targetUser.username} from voice channel: ${currentChannel}`,
        "debug"
      );
    } catch (error) {
      log(`Error kicking user from voice channel: ${error.message}`, "error");

      if (error.code === 50013) {
        return message.channel.send(
          "> Missing permissions to disconnect this user!**"
        );
      } else if (error.code === 10026) {
        return message.channel.send(
          "> User is no longer in a voice channel!**"
        );
      } else {
        return message.channel.send(
          `> Failed to kick user from voice channel:** ${error.message}`
        );
      }
    }
  },
};
