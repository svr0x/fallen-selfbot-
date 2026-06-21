
import { log } from "./functions.js";

export default class RateLimitManager {
    constructor(initialConcurrency = 10) {
    // Concurrency control settings
    this.maxConcurrency = initialConcurrency; // Current maximum concurrent operations
    this.activeOperations = 0; // Number of currently running operations
    this.minConcurrency = 1; // Minimum allowed concurrency (safety limit)
    this.maxAllowedConcurrency = 50; // Maximum allowed concurrency (safety limit)

    // Task queue management
    this.queue = []; // Queue of pending tasks waiting to execute

    // Statistics tracking for optimization
    this.successfulOperations = 0; // Count of successful operations (no rate limits)
    this.rateLimitHits = 0; // Count of rate limit encounters

    log(
      `Rate Limit Manager initialized with concurrency: ${initialConcurrency}`,
      "debug"
    );
  }

    async execute(task, signal = null) {
    return new Promise((resolve, reject) => {
      // Pre-execution cancellation check
      if (signal?.aborted) {
        reject(new Error("Operation was cancelled"));
        return;
      }

            const wrappedTask = async () => {
        // Check for cancellation before starting execution
        if (signal?.aborted) {
          reject(new Error("Operation was cancelled"));
          return;
        }

        // Increment active operations counter
        this.activeOperations++;

        try {
          // Execute the actual task
          const result = await task();

          // Track successful operation for concurrency adjustment
          this.successfulOperations++;

          // Final cancellation check before resolving
          if (signal?.aborted) {
            reject(new Error("Operation was cancelled"));
          } else {
            resolve(result);
          }
        } catch (err) {
          // Handle cancellation during execution
          if (signal?.aborted) {
            reject(new Error("Operation was cancelled"));
            return;
          }

          if (this.isRateLimitError(err)) {
            this.rateLimitHits++;
            const retryAfter = this.extractRetryAfter(err);

            log(
              `Rate limit hit (${
                this.rateLimitHits
              }), reducing concurrency from ${
                this.maxConcurrency
              } to ${Math.max(
                this.minConcurrency,
                Math.floor(this.maxConcurrency / 2)
              )}, retrying after ${retryAfter}ms`,
              "warn"
            );

            // Reduce concurrency more aggressively for webhooks
            this.maxConcurrency = Math.max(
              this.minConcurrency,
              Math.floor(this.maxConcurrency / 2)
            );

            const retryTimeout = setTimeout(() => {
              // Check cancellation before retry
              if (signal?.aborted) {
                reject(new Error("Operation was cancelled"));
                return;
              }
              this.execute(task, signal).then(resolve).catch(reject);
            }, retryAfter);

            // Cancel retry if signal is aborted
            if (signal) {
              signal.addEventListener("abort", () => {
                clearTimeout(retryTimeout);
                reject(new Error("Operation was cancelled"));
              });
            }
          } else {
            reject(err); // Re-throw non-rate-limit errors
          }
        } finally {
          this.activeOperations--;
          this.adjustConcurrency(); // Adjust concurrency based on success rate
          this.processQueue();
        }
      };

      // Add cancellation listener
      if (signal) {
        signal.addEventListener("abort", () => {
          reject(new Error("Operation was cancelled"));
        });
      }

      if (this.activeOperations < this.maxConcurrency) {
        wrappedTask(); // Execute immediately if under concurrency limit
      } else {
        // Store task with cancellation support
        const queuedTask = {
          execute: wrappedTask,
          signal: signal,
          cancelled: false,
        };

        this.queue.push(queuedTask);

        // Remove from queue if cancelled
        if (signal) {
          signal.addEventListener("abort", () => {
            queuedTask.cancelled = true;
            const index = this.queue.indexOf(queuedTask);
            if (index > -1) {
              this.queue.splice(index, 1);
            }
          });
        }
      }
    });
  }

    isRateLimitError(error) {
    // Check for HTTP 429 status
    if (error.status === 429 || error.response?.status === 429) {
      return true;
    }

    if (error.message && error.message.toLowerCase().includes("rate limit")) {
      return true;
    }

    if (error.response?.data?.retry_after) {
      return true;
    }

    return false;
  }

    extractRetryAfter(error) {
    let retryAfter = 1000; // Default 1 second

    // From error object directly
    if (error.retry_after) {
      retryAfter = error.retry_after * 1000; // Convert to milliseconds
    }
    // From response data
    else if (error.response?.data?.retry_after) {
      retryAfter = error.response.data.retry_after * 1000;
    }
    // From error message (webhook specific)
    else if (error.message && error.message.includes("Retry after")) {
      const match = error.message.match(/Retry after ([\d.]+)s/);
      if (match) {
        retryAfter = parseFloat(match[1]) * 1000;
      }
    }
    // From response headers
    else if (error.response?.headers?.["retry-after"]) {
      retryAfter = parseFloat(error.response.headers["retry-after"]) * 1000;
    }

    retryAfter = Math.max(retryAfter, 500); // Minimum 500ms
    retryAfter += Math.random() * 200; // Add 0-200ms jitter

    return Math.ceil(retryAfter);
  }

    adjustConcurrency() {
    if (this.successfulOperations > 0 && this.rateLimitHits === 0) {
      this.maxConcurrency = Math.min(
        this.maxAllowedConcurrency,
        this.maxConcurrency + 1
      );
      log(
        `No rate limit hits, increasing concurrency to ${this.maxConcurrency}`,
        "debug"
      );
    }
  }

    processQueue() {
    while (
      this.queue.length > 0 &&
      this.activeOperations < this.maxConcurrency
    ) {
      const queuedTask = this.queue.shift();

      // Skip cancelled tasks
      if (queuedTask.cancelled || queuedTask.signal?.aborted) {
        continue;
      }

      // Execute the task
      if (typeof queuedTask === "function") {
        // Legacy support for old queue format
        queuedTask();
      } else {
        // New queue format with cancellation support
        queuedTask.execute();
      }
      break;
    }
  }
}
