
// Import required Discord.js modules
import { Client } from "discord.js-selfbot-v13";

// Import styling and display modules
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";

// Import core handlers for bot functionality
import { loadEvents } from "./handlers/EventsHandler.js";
import { loadCommands } from "./handlers/CommandHandler.js";
import { setupAntiCrash } from "./handlers/anticrash.js";
import { setupRateLimit } from "./handlers/RateLimitHandler.js";

// Import utility modules
import { loadConfig, clearConsole, log, wait } from "./utils/functions.js";
import TaskManager from "./utils/TaskManager.js";

// Import additional features
import { initNitroSniper } from "./commands/general/nitrosniper.js";
import { restoreHosted } from "./utils/HostManager.js";

// Global variables for graceful shutdown
let isShuttingDown = false;
let client = null;

function displayBanner() {
  try {
    const coolGradient = gradient(["#FF0000", "#CC0000", "#1a1a1a", "#FFFFFF"]);

    const asciiArt = figlet.textSync("fallen", {
      font: "Standard", // Use standard figlet font
      horizontalLayout: "default", // Default horizontal spacing
      verticalLayout: "default", // Default vertical spacing
      width: 80, // Maximum width of 80 characters
      whitespaceBreak: true, // Break on whitespace
    });

    // Display the styled banner
    console.log("\n");
    console.log(coolGradient(asciiArt));
    console.log("\n");
    console.log(chalk.red("> ") + chalk.gray("A powerful Discord selfbot"));
    console.log(chalk.red("> ") + chalk.gray("Support server: https://discord.gg/DWxCXT8ch5"));
    console.log(
      chalk.red("> ") +
        chalk.gray("Use at your own risk - selfbots violate Discord's ToS")
    );
    console.log(chalk.red("> ") + chalk.gray("Developed by svr0x"));
    console.log("\n");
  } catch (error) {
    console.log("\n");
    console.log(chalk.cyan("=".repeat(50)));
    console.log(chalk.cyan("                     FALLEN SELFBOT"));
    console.log(chalk.cyan("=".repeat(50)));
    console.log("\n");
  }
}

function validateToken(token) {
  // Check if token exists
  if (!token) {
    return {
      isValid: false,
      error: "No token provided in config.yaml. Please add your Discord token.",
    };
  }

  // Check if token is a string
  if (typeof token !== "string") {
    return {
      isValid: false,
      error: "Token must be a string. Check your config.yaml format.",
    };
  }

  if (!token.trim()) {
    return {
      isValid: false,
      error: "Token is empty. Please provide a valid Discord token.",
    };
  }

  if (token.length < 50) {
    return {
      isValid: false,
      error:
        "Token appears to be too short. Discord tokens are typically 59+ characters.",
    };
  }

  // Check for common placeholder values
  const placeholders = [
    "YOUR_TOKEN_HERE",
    "DISCORD_TOKEN",
    "TOKEN",
    "your_token",
    "paste_token_here",
    "YOUR_DISCORD_TOKEN",
  ];

  if (
    placeholders.some((placeholder) =>
      token.toLowerCase().includes(placeholder.toLowerCase())
    )
  ) {
    return {
      isValid: false,
      error:
        "Token appears to be a placeholder. Please replace with your actual Discord token.",
    };
  }

  if (!token.includes(".")) {
    return {
      isValid: false,
      error:
        "Token format appears invalid. Discord tokens typically contain dots (.).",
    };
  }

  // If all checks pass
  return {
    isValid: true,
    error: null,
  };
}

function setupSignalHandlers(discordClient) {
    const gracefulShutdown = async (signal, exitCode = 0) => {
    // Prevent multiple shutdown attempts
    if (isShuttingDown) {
      log("Shutdown already in progress...", "warn");
      return;
    }

    isShuttingDown = true;
    log(`\nReceived ${signal} signal, initiating graceful shutdown...`, "warn");

    try {
      // Step 1: Stop accepting new tasks
      log("Stopping new task creation...", "info");

      log("Cleaning up active tasks...", "info");
      await TaskManager.cleanup();

      // Step 3: Destroy Discord client connection
      if (discordClient && discordClient.destroy) {
        log("Closing Discord connection...", "info");
        try {
          discordClient.destroy();
        } catch (error) {
          log(`Error closing Discord connection: ${error.message}`, "warn");
        }
      }

      // Step 4: Final cleanup message
      log("Graceful shutdown completed successfully", "success");
    } catch (error) {
      log(`Error during shutdown: ${error.message}`, "error");
      exitCode = 1; // Set error exit code
    } finally {
      setTimeout(() => {
        process.exit(exitCode);
      }, 100);
    }
  };

  // SIGINT - Interrupt signal (Ctrl+C)
  process.on("SIGINT", () => gracefulShutdown("SIGINT", 0));

  // SIGTERM - Termination signal (kill command)
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM", 0));

  // SIGQUIT - Quit signal (Ctrl+\)
  process.on("SIGQUIT", () => gracefulShutdown("SIGQUIT", 0));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    log(`Uncaught Exception: ${error.message}`, "error");
    log(error.stack, "error");
    gracefulShutdown("UNCAUGHT_EXCEPTION", 1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, "error");
    gracefulShutdown("UNHANDLED_REJECTION", 1);
  });

  log("Signal handlers registered for graceful shutdown", "debug");
}

async function initializeSelfbot() {
  try {
    // Step 1: Load and validate configuration
    log("Loading configuration...", "info");
    const config = loadConfig();

    log("Validating Discord token...", "info");
    const tokenValidation = validateToken(config.selfbot?.token);

    if (!tokenValidation.isValid) {
      console.error(chalk.red("\n[TOKEN ERROR] " + tokenValidation.error));
      console.error(chalk.yellow("\nHow to fix:"));
      console.error(chalk.yellow("1. Open config.yaml"));
      console.error(
        chalk.yellow("2. Replace the token value with your Discord token")
      );
      console.error(chalk.yellow("3. Save the file and restart the bot"));
      console.error(chalk.yellow("\nTo get your Discord token:"));
      console.error(chalk.yellow("1. Open Discord in browser"));
      console.error(chalk.yellow("2. Press F12 -> Network tab"));
      console.error(
        chalk.yellow("3. Send a message and look for 'authorization' header")
      );
      console.error(
        chalk.red("\nWARNING: Never share your token with anyone!\n")
      );
      process.exit(1);
    }

    log("Initializing Discord client...", "info");
    client = new Client({
      checkUpdate: false, // Disable update checks for selfbots
      autoRedeemNitro: true, // Auto-redeem Nitro codes if found
      relationshipSweepInterval: 60, // Clean up relationships every 60 seconds
      restRequestTimeout: 60000, // 60 second timeout for REST requests
      ws: {
        properties: {
          // Spoof browser properties to avoid detection
          $browser: config.client_properties?.browser || "Discord Client",
        },
      },
    });

    client.config = config; // Attach config for global access
    client.prefix = config.selfbot.prefix; // Set command prefix
    client.noprefix = false;
    client.commands = new Map(); // Initialize command collection
    client.cooldowns = new Map(); // Initialize cooldown tracking

    log("Setting up anti-crash system...", "info");
    setupAntiCrash(client);

    log("Setting up rate limit handler...", "info");
    setupRateLimit(client);

    log("Loading commands...", "info");
    const commandCount = await loadCommands(client);
    log(`Loaded ${commandCount} commands successfully`, "success");

    log("Loading events...", "info");
    const eventCount = await loadEvents(client);
    log(`Loaded ${eventCount} events successfully`, "success");

    log("Setting up signal handlers...", "info");
    setupSignalHandlers(client);

    // Step 7: Visual preparation for login
    await wait(1000); // Brief pause for visual effect

    // Clear console for clean startup display
    try {
      clearConsole();
    } catch (error) {
      console.log("\n".repeat(10));
    }

    // Display the startup banner
    displayBanner();

    log("Connecting to Discord...", "info");

    try {
      await client.login(config.selfbot.token);
      log("Successfully connected to Discord!", "success");
    } catch (loginError) {
      if (loginError.message.includes("TOKEN_INVALID")) {
        console.error(chalk.red("\n[LOGIN ERROR] Invalid Discord token"));
        console.error(chalk.yellow("Your token may be:"));
        console.error(chalk.yellow("• Expired or revoked"));
        console.error(chalk.yellow("• Incorrectly copied"));
        console.error(chalk.yellow("• From a different account"));
        console.error(
          chalk.yellow("\nPlease get a fresh token and update config.yaml")
        );
      } else if (loginError.message.includes("RATE_LIMITED")) {
        console.error(chalk.red("\n[LOGIN ERROR] Rate limited by Discord"));
        console.error(
          chalk.yellow("Please wait a few minutes before trying again")
        );
      } else {
        console.error(
          chalk.red("\n[LOGIN ERROR] Failed to connect to Discord")
        );
        console.error(chalk.yellow("Error details: " + loginError.message));
      }

      console.error(
        chalk.red("\nBot startup failed. Please check your configuration.\n")
      );
      process.exit(1);
    }

    log("Initializing additional features...", "debug");

    try {
      // Initialize Nitro sniper if enabled
      if (config.nitro_sniper?.enabled !== false) {
        initNitroSniper(client);
        log("Nitro sniper initialized", "debug");
      }

      // Restore previously hosted tokens
      await restoreHosted(client.user.id);
      log("Hosted tokens restored", "debug");
    } catch (featureError) {
      log(
        `Warning: Failed to initialize some features: ${featureError.message}`,
        "warn"
      );
    }

    // Step 10: Startup complete
    log("Selfbot initialization completed successfully!", "debug");
    log(
      `Bot is ready and listening for commands with prefix: ${client.prefix}`,
      "debug"
    );
  } catch (error) {
    // Handle any unexpected errors during initialization
    console.error(
      chalk.red("\n[INITIALIZATION ERROR] Failed to start selfbot:")
    );
    console.error(chalk.red("Error: " + error.message));

    if (error.stack) {
      console.error(chalk.gray("\nStack trace:"));
      console.error(chalk.gray(error.stack));
    }

    console.error(chalk.yellow("\nTroubleshooting:"));
    console.error(chalk.yellow("1. Check your config.yaml file"));
    console.error(chalk.yellow("2. Ensure your Discord token is valid"));
    console.error(chalk.yellow("3. Check your internet connection"));
    console.error(chalk.yellow("4. Make sure all dependencies are installed"));

    // Cleanup and exit
    if (client) {
      try {
        client.destroy();
      } catch (destroyError) {
        // Ignore cleanup errors during startup failure
      }
    }

    process.exit(1);
  }
}

log("Starting fallen...", "info");
initializeSelfbot().catch((error) => {
  // Final catch-all error handler
  console.error(chalk.red("\n[FATAL ERROR] Selfbot failed to start:"));
  console.error(chalk.red(error.message));
  process.exit(1);
});
