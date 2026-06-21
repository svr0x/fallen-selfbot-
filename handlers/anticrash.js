
import chalk from "chalk";
import { log, logError } from "../utils/functions.js";

export function setupAntiCrash(client) {
    process.on("uncaughtException", (error) => {
    logError(error, "Uncaught Exception");

    log("Uncaught exception occurred and has been logged to file", "warn");

    if (client.isReady() && client.user) {
      log("Client is still connected, continuing despite error...", "warn");

      // if (client.channels.cache.has(logChannelId)) {
      //     client.channels.cache.get(logChannelId).send(`Error: ${error.message}`);
      // }
    }
  });

    process.on("unhandledRejection", (reason, promise) => {
    // Log the rejection details to file
    logError(reason, "Unhandled Promise Rejection");

    // Notify console about the rejection
    log(
      "Unhandled promise rejection occurred and has been logged to file",
      "warn"
    );

    // Verify client is still operational
    if (client.isReady() && client.user) {
      log("Client is still connected, continuing despite rejection...", "warn");
    }
  });

    process.on("warning", (warning) => {
    if (
      warning.name !== "ExperimentalWarning" &&
      warning.name !== "DeprecationWarning"
    ) {
      log(`Warning: ${warning.name} - ${warning.message}`, "warn");
    }

    logError(warning, "Warning");
  });

  log("Anti-crash system initialized", "success");
}
