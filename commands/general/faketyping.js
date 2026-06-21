import { log } from "../../utils/functions.js";
import TaskManager from "../../utils/TaskManager.js";

// Map to store active typing sessions
const typingSessions = new Map();

export default {
  name: "faketyping",
  description: "Show typing status indefinitely in a channel",
  aliases: ["typing", "ft"],
  usage: "[stop]",
  category: "general",
  type: "both",
  permissions: ["SendMessages"],
  cooldown: 3,

  execute: async (client, message, args) => {
    try {
      if (message.author.id !== client.user.id) return;

      const channelId = message.channel.id;

      if (args[0]?.toLowerCase() === "stop") {
        if (typingSessions.has(channelId)) {
          const session = typingSessions.get(channelId);

          // Stop the task
          if (session.task) {
            session.task.stop();
          }

          // Remove from sessions map
          typingSessions.delete(channelId);

          await message.channel.send(
            "> stopped typing"
          );
          log(
            `Stopped fake typing in channel #${
              message.channel.name || channelId
            }`,
            "debug"
          );
        } else {
          await message.channel.send(
            "> no active typing session"
          );
        }
        return;
      }

      if (typingSessions.has(channelId)) {
        await message.channel.send(
          "> already typing — use faketyping stop"
        );
        return;
      }

      // Create a task for typing
      const guildId = message.guild?.id || "dm";
      const taskName = `typing_${channelId}`;
      const task = TaskManager.createTask(taskName, guildId);
      
      if (!task) {
        await message.channel.send("> ❌ Failed to create typing task.");
        return;
      }

      try {
        // Start typing immediately
        await message.channel.sendTyping();

        // Store the session
        typingSessions.set(channelId, {
          task: task,
          channelId: channelId,
          startTime: Date.now(),
          count: 0,
        });

        let isCancelled = false;

        // Add cancellation listener
        if (task.signal) {
          task.signal.addEventListener("abort", () => {
            if (!task.signal.reason || task.signal.reason !== "completed") {
              isCancelled = true;
              typingSessions.delete(channelId);
              log(
                `Fake typing cancelled in channel #${
                  message.channel.name || channelId
                }`,
                "warn"
              );
            }
          });
        }

        // Create a continuous typing loop
        const startTypingLoop = async () => {
          while (!task.signal.aborted && !isCancelled) {
            try {
              // Check for cancellation before each iteration
              if (task.signal.aborted || isCancelled) {
                break;
              }

              // Send typing indicator
              await message.channel.sendTyping();

              // Increment counter
              if (typingSessions.has(channelId)) {
                typingSessions.get(channelId).count++;

                // Log every minute to avoid spam
                if (typingSessions.get(channelId).count % 20 === 0) {
                  log(
                    `Still typing in channel #${
                      message.channel.name || channelId
                    } (${typingSessions.get(channelId).count / 20} minutes)`,
                    "debug"
                  );
                }
              }

              await new Promise((resolve) => {
                const timeout = setTimeout(resolve, 3000);
                if (task.signal) {
                  task.signal.addEventListener("abort", () => {
                    clearTimeout(timeout);
                    resolve();
                  });
                }
              });
            } catch (error) {
              // Check if cancelled during error
              if (task.signal.aborted || isCancelled) {
                break;
              }

              log(`Error in typing task: ${error.message}`, "error");

              if (error.status === 403 || error.code === 50001) {
                log(
                  `Automatically stopped fake typing in channel #${
                    message.channel.name || channelId
                  } due to permissions`,
                  "warn"
                );
                break;
              }
            }
          }
        };

        startTypingLoop().catch((error) => {
          log(`Error in typing loop: ${error.message}`, "error");
        });

        await message.channel.send(
          "> typing..."
        );
        log(
          `Started fake typing in channel #${message.channel.name || channelId}`,
          "debug"
        );
      } catch (error) {
        log(`Error starting fake typing: ${error.message}`, "error");
        await message.channel.send(`> ❌ An error occurred: ${error.message}`);
      }
    } catch (error) {
      log(`Error in faketyping command: ${error.message}`, "error");
      message.channel.send(`> ❌ An error occurred: ${error.message}`);
    }
  },
};
