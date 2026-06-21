
import { log } from "../utils/functions.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const debugDir = path.join(__dirname, "..", "data", "debug");
if (!fs.existsSync(debugDir)) {
  fs.mkdirSync(debugDir, { recursive: true });
}

export default {
  name: "raw",
  once: false,

    execute: async (client, packet) => {
    if (packet.t === 'READY') {
        try {
            const d = packet.d;
            const balance =
                d?.user_settings?.orb_balance ??
                d?.orb_balance ??
                d?.quests?.orb_balance ??
                d?.gem_balance ??
                null;
            if (balance !== null) client._orbBalance = balance;
            if (d?.quests) client._questsRaw = d.quests;
        } catch {}
    }

    if (client.config.debug_mode && client.config.debug_mode.enabled) {
      const relationshipEvents = [
        "RELATIONSHIP_ADD", // Friend request sent/received
        "RELATIONSHIP_REMOVE", // Friend removed or request declined
        "RELATIONSHIP_UPDATE", // Relationship status changed
        "PRESENCE_UPDATE", // User status/activity changed
        "USER_UPDATE", // User profile updated
        "GUILD_CREATE", // Joined a server
        "GUILD_DELETE", // Left a server or server deleted
      ];

      if (relationshipEvents.includes(packet.t)) {
        log(`[RAW EVENT] ${packet.t}`, "debug");

        try {
          const logFile = path.join(debugDir, "raw_events.log");
          const timestamp = new Date().toISOString();
          const logEntry = `[${timestamp}] ${packet.t}: ${JSON.stringify(
            packet.d,
            null,
            2
          )}\n`;
          fs.appendFileSync(logFile, logEntry);
        } catch (error) {
          console.error("Failed to write raw event to log file:", error);
        }
      }
    }
  },
};
