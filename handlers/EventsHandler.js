
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { log } from "../utils/functions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadEvents(client) {
  try {
    // Get path to events directory
    const eventsDir = path.join(__dirname, "..", "events");

    // Recursively find all event files
    const eventFiles = getEventFiles(eventsDir);

    log(`Loading ${eventFiles.length} events...`, "info");

    let loadedCount = 0;
    const eventTypes = {
      once: 0, // One-time events (like 'ready')
      on: 0, // Recurring events (like 'messageCreate')
    };

    // Process each event file
    for (const filePath of eventFiles) {
      try {
        // Dynamically import the event module
        const event = await import(`file://${filePath}`);

        // Validate event structure
        if (!event.default || !event.default.name || !event.default.execute) {
          log(
            `Skipping invalid event file: ${path.basename(filePath)}`,
            "warn"
          );
          continue;
        }

        // Extract event properties
        const { name, once, execute } = event.default;

        // Register event with appropriate method
        if (once) {
          client.once(name, (...args) => execute(client, ...args));
          eventTypes.once++;
        } else {
          client.on(name, (...args) => execute(client, ...args));
          eventTypes.on++;
        }

        loadedCount++;
        log(`Loaded event: ${name} (${once ? "once" : "on"})`, "success");
      } catch (error) {
        log(
          `Error loading event file ${path.basename(filePath)}: ${
            error.message
          }`,
          "error"
        );
      }
    }

    // Log summary
    log(
      `Successfully loaded ${loadedCount} events (${eventTypes.on} on, ${eventTypes.once} once)`,
      "success"
    );

    return loadedCount;
  } catch (error) {
    log(`Error loading events: ${error.message}`, "error");
    return 0;
  }
}

function getEventFiles(directory, files = []) {
  const items = fs.readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);

    if (item.isDirectory()) {
      getEventFiles(fullPath, files);
    } else if (item.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}
