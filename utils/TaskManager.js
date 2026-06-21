
import { log } from "./functions.js";

class TaskManager {
    constructor() {
    this.tasks = new Map();

    this.intervals = new Map();

    this.timeouts = new Map();

    this.abortControllers = new Map();

    log("Task Manager initialized.", "info");
  }

    createTask(name, guildId) {
    const taskId = `${name}:${guildId}`;

    if (this.tasks.has(taskId)) {
      log(`Task ${taskId} already exists.`, "warn");
      return null;
    }

    const abortController = new AbortController();
    this.abortControllers.set(taskId, abortController);

    // Create task object with management methods
    const task = {
      // Basic task information
      id: taskId,
      name,
      guildId,
      startTime: Date.now(),
      status: "running",
      signal: abortController.signal, // For fetch operations and other cancellable operations

            registerInterval: (intervalId) => {
        if (!this.intervals.has(taskId)) {
          this.intervals.set(taskId, new Set());
        }
        this.intervals.get(taskId).add(intervalId);
        return intervalId;
      },

            registerTimeout: (timeoutId) => {
        if (!this.timeouts.has(taskId)) {
          this.timeouts.set(taskId, new Set());
        }
        this.timeouts.get(taskId).add(timeoutId);
        return timeoutId;
      },

            stop: () => {
        return this.destroyTask(taskId, "completed");
      },

            abort: () => {
        abortController.abort();
      },
    };

    this.tasks.set(taskId, task);
    log(`Task ${taskId} created.`, "debug");
    return task;
  }

  getTask(name, guildId) {
    const taskId = `${name}:${guildId}`;
    return this.tasks.get(taskId);
  }

  hasTask(name, guildId) {
    const taskId = `${name}:${guildId}`;
    return this.tasks.has(taskId);
  }

  destroyTask(taskId, reason = "cancelled") {
    if (!this.tasks.has(taskId)) {
      log(
        `Task ${taskId} not found for destruction (already cleaned up).`,
        "debug"
      );
      return false;
    }

    const task = this.tasks.get(taskId);
    log(`Destroying task ${taskId} (${task.name})...`, "debug");

    let intervalsCleared = 0;
    let timeoutsCleared = 0;

    if (this.intervals.has(taskId)) {
      const intervalSet = this.intervals.get(taskId);
      for (const intervalId of intervalSet) {
        try {
          clearInterval(intervalId);
          intervalsCleared++;
        } catch (error) {
          log(
            `Error clearing interval ${intervalId} for task ${taskId}: ${error.message}`,
            "warn"
          );
        }
      }
      this.intervals.delete(taskId);
    }

    if (this.timeouts.has(taskId)) {
      const timeoutSet = this.timeouts.get(taskId);
      for (const timeoutId of timeoutSet) {
        try {
          clearTimeout(timeoutId);
          timeoutsCleared++;
        } catch (error) {
          log(
            `Error clearing timeout ${timeoutId} for task ${taskId}: ${error.message}`,
            "warn"
          );
        }
      }
      this.timeouts.delete(taskId);
    }

    // Abort any fetch operations
    if (this.abortControllers.has(taskId)) {
      try {
        const controller = this.abortControllers.get(taskId);
        if (!controller.signal.aborted) {
          controller.abort(reason);
        }
      } catch (error) {
        log(
          `Error aborting operations for task ${taskId}: ${error.message}`,
          "warn"
        );
      }
      this.abortControllers.delete(taskId);
    }

    this.tasks.delete(taskId);
    log(
      `Task ${taskId} destroyed successfully. Cleared ${intervalsCleared} intervals, ${timeoutsCleared} timeouts.`,
      "debug"
    );
    return true;
  }

  async cleanup() {
    log("Cleaning up all tasks...", "info");
    if (this.tasks.size === 0) {
      log("No active tasks to clean up.", "info");
      return;
    }

    const taskIds = Array.from(this.tasks.keys());
    let successCount = 0;
    let failCount = 0;

    for (const taskId of taskIds) {
      try {
        const result = this.destroyTask(taskId);
        if (result) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
        log(`Error cleaning up task ${taskId}: ${error.message}`, "error");
      }
    }

    log(
      `Task cleanup completed. Success: ${successCount}, Failed: ${failCount}`,
      "success"
    );
  }

  createInterval(taskId, callback, delay) {
    if (!this.tasks.has(taskId)) {
      log(
        `Task ${taskId} not found for interval creation - task may have been destroyed`,
        "warn"
      );
      throw new Error(`Task ${taskId} not found`);
    }

    const intervalId = setInterval(callback, delay);

    if (!this.intervals.has(taskId)) {
      this.intervals.set(taskId, new Set());
    }
    this.intervals.get(taskId).add(intervalId);

    return intervalId;
  }

  createTimeout(taskId, callback, delay) {
    if (!this.tasks.has(taskId)) {
      return null;
    }

    const timeoutId = setTimeout(callback, delay);

    if (!this.timeouts.has(taskId)) {
      this.timeouts.set(taskId, new Set());
    }
    this.timeouts.get(taskId).add(timeoutId);

    return timeoutId;
  }
}

export default new TaskManager();
