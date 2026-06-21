
import chalk from "chalk";
import gradient from "gradient-string";
import { log } from "../utils/functions.js";
import { RpcManager } from "../utils/RpcManager.js";
import { RichPresence } from "discord.js-selfbot-v13";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  name: "ready",
  once: true,

    execute: async (client) => {
    const sepGradient = gradient(["#FF0000", "#CC0000", "#1a1a1a", "#FFFFFF"]);
    console.log(sepGradient("─".repeat(50)));

    // Display essential bot information
    log(`Logged in as ${chalk.blue(client.user.tag)}`, "success");
    log(`User ID: ${chalk.white(client.user.id)}`, "info");
    log(`Prefix: ${chalk.white(client.prefix)}`, "info");
    log(`Status: ${chalk.white(client.config.selfbot.status)}`, "info");

    // Display helpful usage information
    console.log("");
    log(`Use ${chalk.white(client.prefix + "help")} to get info about available commands`, "info");

    // Display system environment information
    console.log("");
    log("System Information:", "info");
    console.log(`  ${chalk.yellow("•")} ${chalk.white("Node.js")}: ${chalk.white(process.version)}`);
    console.log(`  ${chalk.yellow("•")} ${chalk.white("Platform")}: ${chalk.white(process.platform)}`);

    // Display closing separator
    console.log(sepGradient("─".repeat(50)));

    client.user.setStatus(client.config.selfbot.status);
    
    // Initialize Rich Presence system
    log("Initializing Rich Presence system...", "info");

    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const isMain = !client.ownerId; // hosted clients have ownerId set by HostManager
      client.rpcManager = new RpcManager(isMain ? 'main' : client.user.id);

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
