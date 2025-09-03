"use client";

import { useState, useEffect } from "react";
import { getOfflineQueueStatus, processOfflineQueue } from "@/lib/offline-sync";
import { Wifi, WifiOff, Clock, CheckCircle } from "lucide-react";

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueStatus, setQueueStatus] = useState<{
    count: number;
    oldestTimestamp: number | null;
  }>({
    count: 0,
    oldestTimestamp: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Update queue status
    const updateQueueStatus = () => {
      setQueueStatus(getOfflineQueueStatus());
    };

    // Event handlers
    const handleOnline = async () => {
      setIsOnline(true);
      setIsProcessing(true);

      try {
        await processOfflineQueue();
      } catch (error) {
        console.error("Failed to process offline queue:", error);
      } finally {
        setIsProcessing(false);
        updateQueueStatus();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateQueueStatus();
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Update queue status periodically
    updateQueueStatus();
    const interval = setInterval(updateQueueStatus, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if online and no pending actions
  if (isOnline && queueStatus.count === 0 && !isProcessing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
        flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-sm font-medium
        ${
          !isOnline
            ? "bg-amber-500 text-white"
            : queueStatus.count > 0
            ? "bg-blue-500 text-white"
            : "bg-green-500 text-white"
        }
      `}
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline</span>
            {queueStatus.count > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                {queueStatus.count} pending
              </span>
            )}
          </>
        ) : isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Syncing...</span>
          </>
        ) : queueStatus.count > 0 ? (
          <>
            <Clock className="w-4 h-4" />
            <span>{queueStatus.count} pending sync</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Synced</span>
          </>
        )}
      </div>
    </div>
  );
}
