// Simple test utilities to verify offline functionality

import { DTREntry, saveDTREntry, getDTREntriesForMonth } from "./db";
import {
  queueOfflineAction,
  processOfflineQueue,
  getOfflineQueueStatus,
} from "./offline-sync";

// Test data
const testEntry: DTREntry = {
  date: "2024-01-15",
  amArrival: "08:00",
  amDeparture: "12:00",
  pmArrival: "13:00",
  pmDeparture: "17:00",
  overtimeHours: 2,
  overtimeMinutes: 30,
  isWeekend: false,
};

// Test offline functionality
export async function testOfflineFunctionality(): Promise<{
  success: boolean;
  results: string[];
  errors: string[];
}> {
  const results: string[] = [];
  const errors: string[] = [];
  let success = true;

  try {
    // Test 1: Save entry to IndexedDB
    results.push("Testing IndexedDB save...");
    await saveDTREntry(testEntry);
    results.push("✓ IndexedDB save successful");

    // Test 2: Retrieve entry from IndexedDB
    results.push("Testing IndexedDB retrieval...");
    const entries = await getDTREntriesForMonth(2024, 1);
    const savedEntry = entries.find((e) => e.date === testEntry.date);

    if (savedEntry) {
      results.push("✓ IndexedDB retrieval successful");
    } else {
      errors.push("✗ Failed to retrieve saved entry");
      success = false;
    }

    // Test 3: Queue offline action
    results.push("Testing offline queue...");
    queueOfflineAction("save", testEntry);

    const queueStatus = getOfflineQueueStatus();
    if (queueStatus.count > 0) {
      results.push("✓ Offline queue working");
    } else {
      errors.push("✗ Offline queue not working");
      success = false;
    }

    // Test 4: Process offline queue
    results.push("Testing queue processing...");
    await processOfflineQueue();
    results.push("✓ Queue processing completed");

    // Test 5: Service Worker registration
    results.push("Testing Service Worker...");
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        results.push("✓ Service Worker registered");
      } else {
        errors.push("✗ Service Worker not registered");
        success = false;
      }
    } else {
      errors.push("✗ Service Worker not supported");
      success = false;
    }

    // Test 6: Cache API
    results.push("Testing Cache API...");
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      if (cacheNames.length > 0) {
        results.push(`✓ Cache API working (${cacheNames.length} caches)`);
      } else {
        errors.push("✗ No caches found");
        success = false;
      }
    } else {
      errors.push("✗ Cache API not supported");
      success = false;
    }

    // Test 7: Storage persistence
    results.push("Testing storage persistence...");
    if ("storage" in navigator && "persist" in navigator.storage) {
      const persistent = await navigator.storage.persist();
      results.push(
        `✓ Storage persistence: ${persistent ? "granted" : "not granted"}`
      );
    } else {
      results.push("⚠ Storage persistence API not supported");
    }

    // Test 8: Storage quota
    results.push("Testing storage quota...");
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      const percentage = quota > 0 ? ((usage / quota) * 100).toFixed(1) : "0";
      results.push(
        `✓ Storage: ${usage} bytes used of ${quota} bytes (${percentage}%)`
      );
    } else {
      results.push("⚠ Storage estimate API not supported");
    }
  } catch (error) {
    errors.push(
      `✗ Test failed: ${error instanceof Error ? error.message : String(error)}`
    );
    success = false;
  }

  return { success, results, errors };
}

// Run offline test and log results
export async function runOfflineTest(): Promise<void> {
  console.log("[Offline Test] Starting offline functionality test...");

  const { success, results, errors } = await testOfflineFunctionality();

  console.log("[Offline Test] Results:");
  results.forEach((result) => console.log(`  ${result}`));

  if (errors.length > 0) {
    console.log("[Offline Test] Errors:");
    errors.forEach((error) => console.error(`  ${error}`));
  }

  console.log(`[Offline Test] Overall result: ${success ? "PASS" : "FAIL"}`);
}

// Auto-run test in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Run test after a delay to ensure everything is initialized
  setTimeout(() => {
    runOfflineTest();
  }, 2000);
}
