"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  Database,
  Smartphone,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { isPWA, isMobileDevice, checkStorageQuota } from "@/lib/mobile-utils";

interface CapabilityStatus {
  serviceWorker: boolean;
  indexedDB: boolean;
  cacheAPI: boolean;
  persistentStorage: boolean;
  isPWAInstalled: boolean;
  isMobile: boolean;
  storageQuota: {
    quota: number;
    usage: number;
    percentage: number;
  };
}

export default function OfflineCapabilities() {
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [status, setStatus] = useState<CapabilityStatus>({
    serviceWorker: false,
    indexedDB: false,
    cacheAPI: false,
    persistentStorage: false,
    isPWAInstalled: false,
    isMobile: false,
    storageQuota: { quota: 0, usage: 0, percentage: 0 },
  });

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    const newStatus: CapabilityStatus = {
      serviceWorker: "serviceWorker" in navigator,
      indexedDB: "indexedDB" in window,
      cacheAPI: "caches" in window,
      persistentStorage:
        "storage" in navigator && "persist" in navigator.storage,
      isPWAInstalled: isPWA(),
      isMobile: isMobileDevice(),
      storageQuota: await checkStorageQuota(),
    };

    setStatus(newStatus);
  };

  const capabilities = [
    {
      name: "Service Worker",
      description: "Enables offline functionality and background sync",
      status: status.serviceWorker,
      icon: Shield,
      critical: true,
    },
    {
      name: "IndexedDB",
      description: "Local database for storing your DTR data",
      status: status.indexedDB,
      icon: Database,
      critical: true,
    },
    {
      name: "Cache API",
      description: "Caches app resources for offline use",
      status: status.cacheAPI,
      icon: Zap,
      critical: true,
    },
    {
      name: "Persistent Storage",
      description: "Prevents data from being cleared automatically",
      status: status.persistentStorage,
      icon: Shield,
      critical: false,
    },
    {
      name: "PWA Installed",
      description: "App is installed as a native-like application",
      status: status.isPWAInstalled,
      icon: Smartphone,
      critical: false,
    },
    {
      name: "Mobile Device",
      description: "Optimized mobile experience is active",
      status: status.isMobile,
      icon: Smartphone,
      critical: false,
    },
  ];

  const criticalIssues = capabilities.filter(
    (cap) => cap.critical && !cap.status
  );
  const allCriticalWorking = criticalIssues.length === 0;

  if (!showCapabilities) {
    return (
      <button
        onClick={() => setShowCapabilities(true)}
        className="fixed bottom-4 left-4 p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg shadow-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors z-40"
        title="Check offline capabilities"
      >
        <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Offline Capabilities
            </h2>
            <button
              onClick={() => setShowCapabilities(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Overall Status */}
          <div
            className={`p-3 rounded-lg mb-4 ${
              allCriticalWorking
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {allCriticalWorking ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
              <span
                className={`font-medium ${
                  allCriticalWorking
                    ? "text-green-800 dark:text-green-200"
                    : "text-amber-800 dark:text-amber-200"
                }`}
              >
                {allCriticalWorking
                  ? "Fully Offline Ready"
                  : "Limited Offline Support"}
              </span>
            </div>
            <p
              className={`text-sm mt-1 ${
                allCriticalWorking
                  ? "text-green-700 dark:text-green-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {allCriticalWorking
                ? "Your DTR data will be saved and synced automatically, even when offline."
                : "Some offline features may not work properly in this browser."}
            </p>
          </div>

          {/* Storage Info */}
          {status.storageQuota.quota > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Storage Usage
                </span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {(status.storageQuota.usage / 1024 / 1024).toFixed(1)} MB used
                of {(status.storageQuota.quota / 1024 / 1024).toFixed(1)} MB
                available
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(status.storageQuota.percentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Capabilities List */}
          <div className="space-y-3">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.name} className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      capability.status
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-gray-100 dark:bg-neutral-800"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        capability.status
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {capability.name}
                      </h3>
                      {capability.status ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            capability.critical
                              ? "border-red-300 dark:border-red-700"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {capability.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Critical Issues Warning */}
          {criticalIssues.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-800 dark:text-red-200">
                  Issues Detected
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                Some critical features are not available. Try using a modern
                browser like Chrome, Firefox, or Safari for the best offline
                experience.
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={checkCapabilities}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Status
            </button>
            <button
              onClick={() => setShowCapabilities(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
