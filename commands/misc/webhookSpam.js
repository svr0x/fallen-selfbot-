import axios from "axios";
import { log } from "../../utils/functions.js";
import TaskManager from "../../utils/TaskManager.js";
import RateLimitManager from "../../utils/RateLimitManager.js";

export default {
  name: "webhookspam",
  description: "Spam messages through a webhook",
  aliases: ["ws", "whspam", "webhookflood"],
  usage: "<webhook_url> <count> <message>",
  category: "misc",
  type: "both",
  permissions: ["SendMessages"],
  cooldown: 10,

  async execute(client, message, args) {
    if (args.length < 3) {
      return message.channel.send(
        "> Usage:** `webhookspam <webhook_url> <count> <message>`\n" +
          "> Example:** `ws https://discord.com/api/webhooks/... 5 Hello World!`"
      );
    }

    // Extract webhook URL (first argument)
    const webhookUrl = args[0];

    // Validate webhook URL format
    if (!this.isValidWebhookUrl(webhookUrl)) {
      return message.channel.send(
        "> Invalid webhook URL!**\n" +
          "> Please provide a valid Discord webhook URL."
      );
    }

    // Extract count (second argument)
    const count = parseInt(args[1]);
    if (!count || count <= 0 || count > 30) {
      return message.channel.send(
        "> ❌ Please provide a valid number between 1 and 30."
      );
    }

    // Extract message (remaining arguments)
    const spamMessage = args.slice(2).join(" ");
    if (!spamMessage.trim()) {
      return message.channel.send("> ❌ Please provide a message to spam.");
    }

    const guildId = message.guild?.id || "dm";
    const taskName = `webhookspam_${Date.now()}`;

    if (TaskManager.hasTask("webhookspam", guildId)) {
      return message.channel.send(
        "> ⚠️ A webhook spam task is already running."
      );
    }

    // Create webhook spam task
    const task = TaskManager.createTask(taskName, guildId);
    if (!task) {
      return message.channel.send("> ❌ Failed to create webhook spam task.");
    }

    try {
      // Test webhook first
      const webhookTest = await this.testWebhook(webhookUrl);
      if (!webhookTest.valid) {
        TaskManager.destroyTask(task.id);
        return message.channel.send(
          `> Webhook Error:** ${webhookTest.error}`
        );
      }

      const rateLimiter = new RateLimitManager(2);

      // Send confirmation message
      const statusMsg = await message.channel.send(
        `> 🚀 Sta*rting webhook spam: ${count} messages...\n` +
          `> 📡 **Webhook:** ${webhookTest.name || "Unknown"}`
      );

      let sentCount = 0;
      let isCancelled = false;

      // Add cancellation listener
      if (task.signal) {
        task.signal.addEventListener("abort", () => {
          isCancelled = true;
          if (!task.signal.reason || task.signal.reason !== "completed") {
            statusMsg
              .edit(
                `> ⚠️ Webhook spam cancelled after sending ${sentCount}/${count} messages.`
              )
              .catch(() => {});
          }
        });
      }

      const promises = [];

      // Create webhook spam tasks
      for (let i = 0; i < count; i++) {
        if (task.signal.aborted) break;

        const promise = rateLimiter
          .execute(async () => {
            if (task.signal.aborted) return;
            await this.sendWebhookMessage(webhookUrl, spamMessage);
            sentCount++;
          }, task.signal)
          .catch((error) => {
            if (task.signal.aborted || error.message.includes("cancelled"))
              return;
            log(`Error sending webhook message: ${error.message}`, "warn");
          });

        promises.push(promise);
      }

      await Promise.all(promises);

      // Only update status if not cancelled
      if (!task.signal.aborted) {
        statusMsg
          .edit(
            `> ✅ Webhook spam completed! Sent ${sentCount}/${count} messages.\n` +
              `> 📡 **Webhook:** ${webhookTest.name || "Unknown"}`
          )
          .then((msg) => {
            setTimeout(() => {
              msg.delete().catch(() => {});
            }, 10000);
          })
          .catch(() => {});
      }

      log(
        `Webhook spam completed: ${sentCount}/${count} messages sent`,
        "debug"
      );
    } catch (error) {
      log(`Error in webhook spam command: ${error.message}`, "error");
      message.channel.send(
        `> ❌ An error occurred during webhook spam: ${error.message}`
      );
    } finally {
      // Clean up task
      task.stop();
    }
  },

    isValidWebhookUrl(url) {
    try {
      const urlObj = new URL(url);

      if (
        urlObj.hostname !== "discord.com" &&
        urlObj.hostname !== "discordapp.com"
      ) {
        return false;
      }

      const webhookPattern = /^\/api\/webhooks\/\d+\/[\w-]+$/;
      return webhookPattern.test(urlObj.pathname);
    } catch (error) {
      return false;
    }
  },

    async testWebhook(webhookUrl) {
    try {
      const response = await axios.get(webhookUrl);

      if (response.status === 200) {
        return {
          valid: true,
          name: response.data.name,
          channelId: response.data.channel_id,
          guildId: response.data.guild_id,
        };
      } else {
        return {
          valid: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      if (error.response) {
        // Webhook exists but returned an error
        if (error.response.status === 404) {
          return {
            valid: false,
            error: "Webhook not found or has been deleted",
          };
        } else if (error.response.status === 401) {
          return {
            valid: false,
            error: "Unauthorized access to webhook",
          };
        } else {
          return {
            valid: false,
            error: `HTTP ${error.response.status}: ${error.response.statusText}`,
          };
        }
      } else {
        return {
          valid: false,
          error: "Network error or invalid URL",
        };
      }
    }
  },

    async sendWebhookMessage(webhookUrl, content) {
    try {
      const payload = {
        content: content,
        username: "fallen Webhook Spam",
        avatar_url:
          "https://cdn.discordapp.com/attachments/1234567890/fallen-avatar.png", // Optional
      };

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 204) {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 429) {
          // Rate limited
          const retryAfter = error.response.data?.retry_after || 1;
          throw new Error(`Rate limited. Retry after ${retryAfter}s`);
        } else if (error.response.status === 404) {
          throw new Error("Webhook not found");
        } else {
          throw new Error(
            `HTTP ${error.response.status}: ${error.response.statusText}`
          );
        }
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  },
};
