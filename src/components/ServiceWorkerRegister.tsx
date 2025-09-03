"use client";

import { useEffect, useState } from "react";

export default function ServiceWorkerRegister() {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none", // Always check for updates
          });

          setRegistration(reg);
          console.log("[SW] Service worker registered successfully");

          // Check for updates immediately
          reg.update();

          // Listen for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available
                setUpdateAvailable(true);
                console.log("[SW] New version available");
              }
            });
          });

          // Listen for controller changes (when new SW takes control)
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            console.log("[SW] Controller changed, reloading page");
            window.location.reload();
          });

          // Register for background sync (for offline actions)
          if ("sync" in window.ServiceWorkerRegistration.prototype) {
            console.log("[SW] Background sync supported");
          }

          // Request persistent storage for better offline experience
          if ("storage" in navigator && "persist" in navigator.storage) {
            const persistent = await navigator.storage.persist();
            console.log(`[SW] Persistent storage: ${persistent}`);
          }
        } catch (error) {
          console.error("[SW] Registration failed:", error);
        }
      };

      // Register after window load for better performance
      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register, { once: true });
      }
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle update installation
  const handleUpdate = async () => {
    if (!registration || !registration.waiting) return;

    // Tell the waiting service worker to skip waiting and become active
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    setUpdateAvailable(false);
  };

  // Show offline indicator
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium z-50">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          You're offline. Your data is saved locally and will sync when you're
          back online.
        </div>
      </div>
    );
  }

  // Show update available notification
  if (updateAvailable) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 px-4 text-sm font-medium z-50">
        <div className="flex items-center justify-center gap-4">
          <span>A new version is available!</span>
          <button
            onClick={handleUpdate}
            className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-semibold hover:bg-blue-50 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    );
  }

  return null;
}
