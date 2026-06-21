import { logRelationship, logError } from "../../utils/relationshipLogger.js";
import { log } from "../../utils/functions.js";
import StalkManager from "../../utils/StalkManager.js";

export default {
  name: "presenceUpdate",
  once: false,

    execute: async (client, oldPresence, newPresence) => {
    try {
      if (client.config.debug_mode && client.config.debug_mode.enabled) {
        log(`[DEBUG] presenceUpdate event received`, "debug");

        if (newPresence && newPresence.user) {
          log(
            `[DEBUG] User: ${newPresence.user.tag} (${newPresence.user.id})`,
            "debug"
          );
          log(`[DEBUG] Status: ${newPresence.status}`, "debug");
          log(
            `[DEBUG] Activities: ${
              newPresence.activities.length > 0
                ? newPresence.activities.map((a) => a.name).join(", ")
                : "None"
            }`,
            "debug"
          );
        }
      }

      // Skip if newPresence is invalid
      if (!newPresence) {
        log(`[DEBUG] Skipping presenceUpdate: newPresence is null`, "debug");
        return;
      }

      // Skip if user is invalid
      const user = newPresence.user;
      if (!user) {
        log(`[DEBUG] Skipping presenceUpdate: user is null`, "debug");
        return;
      }

      // Handle stalk logging for presence updates
      if (StalkManager.isStalking(user.id)) {
        const activities = newPresence.activities.map((activity) => ({
          type: this.getActivityTypeName(activity.type),
          name: activity.name,
          details: activity.details,
          state: activity.state,
        }));

        StalkManager.logPresenceEvent(user.id, "PRESENCE_UPDATE", {
          oldStatus: oldPresence?.status,
          newStatus: newPresence.status,
          activities: activities,
        });
      }

      if (!client.relationships) {
        log(
          `[DEBUG] Skipping presenceUpdate: relationships manager not available`,
          "debug"
        );
        return;
      }

      let isFriend = false;

      // Method 1: Check relationships cache
      if (client.relationships && client.relationships.cache.has(user.id)) {
        const relationshipType = client.relationships.cache.get(user.id).type;
        isFriend = relationshipType === "FRIEND";

        if (client.config.debug_mode && client.config.debug_mode.enabled) {
          log(
            `[DEBUG] Relationship type from cache: ${relationshipType}`,
            "debug"
          );
        }
      }

      if (!isFriend && user.dmChannel) {
        isFriend = true;
        if (client.config.debug_mode && client.config.debug_mode.enabled) {
          log(`[DEBUG] User has DM channel, assuming friend`, "debug");
        }
      }

      if (!isFriend && user.mutualGuilds && user.mutualGuilds.size > 0) {
        if (
          client.config.relationship_logs &&
          client.config.relationship_logs.track_all_users
        ) {
          isFriend = true;
          if (client.config.debug_mode && client.config.debug_mode.enabled) {
            log(
              `[DEBUG] User has mutual guilds, tracking due to track_all_users setting`,
              "debug"
            );
          }
        }
      }

      if (!isFriend) {
        if (client.config.debug_mode && client.config.debug_mode.enabled) {
          log(`[DEBUG] Skipping presenceUpdate: user is not a friend`, "debug");
        }
        return;
      }

      // Check for status change
      if (!oldPresence || oldPresence.status !== newPresence.status) {
        if (client.config.debug_mode && client.config.debug_mode.enabled) {
          log(
            `[DEBUG] Status change detected: ${
              oldPresence?.status || "unknown"
            } -> ${newPresence.status}`,
            "debug"
          );
        }

        // Get human-readable status names
        const getStatusName = (status) => {
          switch (status) {
            case "online":
              return "Online";
            case "idle":
              return "Idle";
            case "dnd":
              return "Do Not Disturb";
            case "invisible":
            case "offline":
              return "Offline";
            default:
              return status || "Unknown";
          }
        };

        await logRelationship({
          event: "statusChange",
          data: {
            user: user,
            status: newPresence.status,
            statusName: getStatusName(newPresence.status),
            oldStatus: oldPresence ? oldPresence.status : null,
            oldStatusName: oldPresence
              ? getStatusName(oldPresence.status)
              : "Unknown",
          },
          client,
        });
      }

      const oldActivities = oldPresence?.activities || [];
      const newActivities = newPresence.activities || [];

      const oldActivity = oldActivities.length > 0 ? oldActivities[0] : null;
      const newActivity = newActivities.length > 0 ? newActivities[0] : null;

      // Check if activity changed
      const activityChanged =
        // Activity appeared or disappeared
        (!oldActivity && newActivity) ||
        (oldActivity && !newActivity) ||
        // Name changed
        (oldActivity && newActivity && oldActivity.name !== newActivity.name) ||
        // Type changed
        (oldActivity && newActivity && oldActivity.type !== newActivity.type) ||
        // Details changed
        (oldActivity &&
          newActivity &&
          oldActivity.details !== newActivity.details);

      if (activityChanged) {
        if (client.config.debug_mode && client.config.debug_mode.enabled) {
          const oldActivityName = oldActivity ? oldActivity.name : "none";
          const newActivityName = newActivity ? newActivity.name : "none";
          log(
            `[DEBUG] Activity change detected: ${oldActivityName} -> ${newActivityName}`,
            "debug"
          );

          if (oldActivity && oldActivity.details) {
            log(
              `[DEBUG] Old activity details: ${oldActivity.details}`,
              "debug"
            );
          }

          if (newActivity && newActivity.details) {
            log(
              `[DEBUG] New activity details: ${newActivity.details}`,
              "debug"
            );
          }
        }

        // Format activity for logging
        const formatActivity = (activity) => {
          if (!activity) return null;

          // Get activity type as string
          const getActivityType = (type) => {
            switch (type) {
              case 0:
                return "Playing";
              case 1:
                return "Streaming";
              case 2:
                return "Listening to";
              case 3:
                return "Watching";
              case 4:
                return "Custom Status:";
              case 5:
                return "Competing in";
              default:
                return "";
            }
          };

          // Format based on type
          if (activity.type === 4) {
            // Custom Status
            return activity.state || activity.name;
          } else {
            let result = `${getActivityType(activity.type)} ${activity.name}`;
            if (activity.details) {
              result += ` (${activity.details})`;
            }
            return result;
          }
        };

        await logRelationship({
          event: "activityChange",
          data: {
            user: user,
            activity: newActivity ? formatActivity(newActivity) : null,
            activityRaw: newActivity,
            oldActivity: oldActivity ? formatActivity(oldActivity) : null,
            oldActivityRaw: oldActivity,
          },
          client,
        });
      }
    } catch (error) {
      logError(error, "Presence Update Handler Error");

      // Additional debug logging for errors
      if (client.config.debug_mode && client.config.debug_mode.enabled) {
        log(
          `[DEBUG] Error in presenceUpdate handler: ${error.message}`,
          "debug"
        );
        console.error(error);
      }
    }
  },

    getActivityTypeName(type) {
    switch (type) {
      case 0:
        return "Playing";
      case 1:
        return "Streaming";
      case 2:
        return "Listening to";
      case 3:
        return "Watching";
      case 4:
        return "Custom Status";
      case 5:
        return "Competing in";
      default:
        return "Unknown";
    }
  },
};
