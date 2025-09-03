import { DTREntry } from "./db";

// Queue for offline actions
interface OfflineAction {
  id: string;
  type: "save" | "delete" | "update";
  data: DTREntry;
  timestamp: number;
  retryCount: number;
}

const OFFLINE_QUEUE_KEY = "dtr-offline-queue";
const MAX_RETRY_COUNT = 3;

// Get offline queue from localStorage
function getOfflineQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];

  try {
    const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error("Failed to parse offline queue:", error);
    return [];
  }
}

// Save offline queue to localStorage
function saveOfflineQueue(queue: OfflineAction[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save offline queue:", error);
  }
}

// Add action to offline queue
export function queueOfflineAction(
  type: OfflineAction["type"],
  data: DTREntry
): void {
  const action: OfflineAction = {
    id: `${type}-${data.date}-${Date.now()}`,
    type,
    data,
    timestamp: Date.now(),
    retryCount: 0,
  };

  const queue = getOfflineQueue();

  // Remove any existing actions for the same date and type
  const filteredQueue = queue.filter(
    (item) => !(item.data.date === data.date && item.type === type)
  );

  filteredQueue.push(action);
  saveOfflineQueue(filteredQueue);

  console.log(`[Offline] Queued ${type} action for ${data.date}`);
}

// Process offline queue when back online
export async function processOfflineQueue(): Promise<void> {
  if (!navigator.onLine) {
    console.log("[Offline] Still offline, skipping queue processing");
    return;
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    console.log("[Offline] No actions in queue");
    return;
  }

  console.log(`[Offline] Processing ${queue.length} queued actions`);

  const processedActions: string[] = [];
  const failedActions: OfflineAction[] = [];

  for (const action of queue) {
    try {
      await processAction(action);
      processedActions.push(action.id);
      console.log(`[Offline] Successfully processed action: ${action.id}`);
    } catch (error) {
      console.error(`[Offline] Failed to process action ${action.id}:`, error);

      // Retry logic
      if (action.retryCount < MAX_RETRY_COUNT) {
        failedActions.push({
          ...action,
          retryCount: action.retryCount + 1,
        });
      } else {
        console.error(`[Offline] Max retries reached for action: ${action.id}`);
      }
    }
  }

  // Update queue with only failed actions that haven't exceeded retry limit
  saveOfflineQueue(failedActions);

  if (processedActions.length > 0) {
    console.log(
      `[Offline] Successfully processed ${processedActions.length} actions`
    );
  }

  if (failedActions.length > 0) {
    console.log(
      `[Offline] ${failedActions.length} actions remain in queue for retry`
    );
  }
}

// Process individual action (this would typically sync with your backend)
async function processAction(action: OfflineAction): Promise<void> {
  // For now, we'll just simulate processing since there's no backend
  // In a real app, you would send the data to your server here

  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate occasional failures for testing
      if (Math.random() > 0.9) {
        reject(new Error("Simulated network error"));
      } else {
        resolve();
      }
    }, 100);
  });
}

// Clear offline queue (useful for testing or manual cleanup)
export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
  console.log("[Offline] Queue cleared");
}

// Get queue status for UI display
export function getOfflineQueueStatus(): {
  count: number;
  oldestTimestamp: number | null;
} {
  const queue = getOfflineQueue();

  return {
    count: queue.length,
    oldestTimestamp:
      queue.length > 0
        ? Math.min(...queue.map((action) => action.timestamp))
        : null,
  };
}

// Register background sync (if supported)
export function registerBackgroundSync(): void {
  if (typeof window === "undefined") return;

  if (
    "serviceWorker" in navigator &&
    "sync" in window.ServiceWorkerRegistration.prototype
  ) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.sync.register("dtr-sync");
      })
      .catch((error) => {
        console.error("[Offline] Background sync registration failed:", error);
      });
  }
}

// Auto-process queue when coming back online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[Offline] Back online, processing queue");
    processOfflineQueue();
  });

  // Also try to process queue on page load if online
  if (document.readyState === "complete") {
    if (navigator.onLine) {
      processOfflineQueue();
    }
  } else {
    window.addEventListener("load", () => {
      if (navigator.onLine) {
        processOfflineQueue();
      }
    });
  }
}
