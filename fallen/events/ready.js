/**
 * READY EVENT HANDLER
 *
 * This event handler is triggered when the Discord client is fully initialized
 * and ready to start operating. It handles:
 * - Displaying startup information and system details
 * - Setting the user's Discord status
 * - Configuring Rich Presence (custom activity status)
 * - Initializing relationship tracking and debugging features
 * - Final startup confirmation and ready state logging
 *
 * This is a one-time event that fires only once per bot session when the
 * connection to Discord is established and all initial data is loaded.
 *
 * @module events/ready
 * @author svrOx.
 */

import chalk from "chalk";
import { log } from "../utils/functions.js";
import { RpcManager } from "../utils/RpcManager.js";
import { RichPresence } from "discord.js-selfbot-v13";
import { fileURLToPath } from "url";
import path from "path";

// Get current directory path for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  name: "ready",
  once: true,

  /**
   * Handle the ready event when the Discord client is fully initialized
   *
   * @async
   * @function execute
   * @param {Client} client - Discord.js client instance
   * @description Executes when the bot successfully connects to Discord and is
   *              ready to start processing events and commands. Sets up the
   *              final configuration, displays startup information, and
   *              initializes Rich Presence features.
   */
  execute: async (client) => {
    // Display visual separator for clean startup output
    console.log(chalk.cyan("─".repeat(50)));

    // Display essential bot information
    log(`Logged in as ${chalk.cyan(client.user.tag)}`, "success");
    log(`User ID: ${chalk.cyan(client.user.id)}`, "info");
    log(`Prefix: ${chalk.cyan(client.prefix)}`, "info");
    log(`Status: ${chalk.cyan(client.config.selfbot.status)}`, "info");

    // Display helpful usage information
    console.log("");
    log(
      `Use ${chalk.cyan(
        `${client.prefix}help`
      )} to get info about available commands`,
      "info"
    );

    // Display system environment information
    console.log("");
    log("System Information:", "info");
    console.log(
      `  ${chalk.yellow("•")} ${chalk.yellow("Node.js")}: ${chalk.green(
        process.version
      )}`
    );
    console.log(
      `  ${chalk.yellow("•")} ${chalk.yellow("Platform")}: ${chalk.green(
        process.platform
      )}`
    );

    // Display closing separator
    console.log(chalk.cyan("─".repeat(50)));

    // Set the user's Discord status as configured
    client.user.setStatus(client.config.selfbot.status);
    
    // Initialize Rich Presence system
    log("Initializing Rich Presence system...", "info");

    // Wait 3s for Discord to fully ready before setting RPC
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      // Each client (main or hosted) gets its own isolated RpcManager
      // keyed by their user id, so RPC settings never leak between accounts
      const isMain = !client.ownerId; // hosted clients have ownerId set by HostManager
      client.rpcManager = new RpcManager(isMain ? 'main' : client.user.id);

      // Always fresh reload from this client's own rpc-*.yml
      const rpcConfig = await client.rpcManager.initialize();

      if (rpcConfig && rpcConfig.rpc && rpcConfig.rpc.enabled) {
        const success = await client.rpcManager.updatePresence(client);
        if (success) {
          log("Rich Presence initialized successfully", "success");
        } else {
          log("Failed to initialize Rich Presence - retrying in 5s...", "warn");
          // Retry once after 5 seconds
          setTimeout(async () => {
            await client.rpcManager.updatePresence(client);
          }, 5000);
        }
      } else {
        log("Rich Presence is disabled in configuration", "info");
        client.user.setActivity(null);
      }

      // Log asset information if debug mode is enabled
      if (client.config.debug_mode && client.config.debug_mode.enabled) {
        const currentConfig = client.rpcManager.getCurrentConfig();
        if (currentConfig && currentConfig.rpc && currentConfig.rpc.default && currentConfig.rpc.default.assets) {
          const assets = currentConfig.rpc.default.assets;
          log(`RPC Assets configured - Large: ${assets.large_image || 'none'}, Small: ${assets.small_image || 'none'}`, 'debug');
        }
      }
      
    } catch (error) {
      log(`Error during RPC initialization: ${error.message}`, "error");
      // Fallback to clearing activity
      client.user.setActivity(null);
    }
    
    log("Bot status set and RPC system ready.", "info");

    // Debug relationship information if debug mode is enabled
    if (client.config.debug_mode && client.config.debug_mode.enabled) {
      // Log relationship manager info
      log("Relationship Manager Information:", "debug");

      // Check if relationships are available
      if (client.relationships) {
        const friends = client.relationships.cache.filter(
          (r) => r.type === "FRIEND"
        ).size;
        const blocked = client.relationships.cache.filter(
          (r) => r.type === "BLOCKED"
        ).size;
        const incoming = client.relationships.cache.filter(
          (r) => r.type === "INCOMING_REQUEST"
        ).size;
        const outgoing = client.relationships.cache.filter(
          (r) => r.type === "OUTGOING_REQUEST"
        ).size;

        log(`Friends: ${chalk.green(friends)}`, "debug");
        log(`Blocked: ${chalk.red(blocked)}`, "debug");
        log(`Incoming Requests: ${chalk.yellow(incoming)}`, "debug");
        log(`Outgoing Requests: ${chalk.yellow(outgoing)}`, "debug");

        // Register additional event listeners for debugging
        client.on("relationshipAdd", (relationship) => {
          if (client.config.debug_mode.enabled) {
            const relationshipType =
              typeof relationship === "string" ? "unknown" : relationship.type;
            const userId =
              typeof relationship === "string" ? relationship : relationship.id;
            log(
              `[DEBUG] relationshipAdd event fired: ${relationshipType} - ${userId}`,
              "debug"
            );
          }
        });

        client.on("relationshipRemove", (relationship) => {
          if (client.config.debug_mode.enabled) {
            const relationshipType =
              typeof relationship === "string" ? "unknown" : relationship.type;
            const userId =
              typeof relationship === "string" ? relationship : relationship.id;
            log(
              `[DEBUG] relationshipRemove event fired: ${relationshipType} - ${userId}`,
              "debug"
            );
          }
        });

        client.on("presenceUpdate", (oldPresence, newPresence) => {
          if (client.config.debug_mode.enabled && newPresence.user) {
            const isFriend =
              client.relationships.cache.has(newPresence.user.id) &&
              client.relationships.cache.get(newPresence.user.id).type ===
                "FRIEND";

            if (isFriend) {
              log(
                `[DEBUG] presenceUpdate event fired for friend: ${newPresence.user.tag}`,
                "debug"
              );
            }
          }
        });

        client.on("userUpdate", (oldUser, newUser) => {
          if (client.config.debug_mode.enabled) {
            const isFriend =
              client.relationships.cache.has(newUser.id) &&
              client.relationships.cache.get(newUser.id).type === "FRIEND";

            if (isFriend) {
              log(
                `[DEBUG] userUpdate event fired for friend: ${newUser.tag}`,
                "debug"
              );
            }
          }
        });
      } else {
        log("Relationship manager is not available!", "warn");
      }
    }

    log(`fallen is ready with ${client.commands.size} commands`, "success");
  },
};
