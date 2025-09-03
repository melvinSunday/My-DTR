"use client";

import { useEffect } from "react";
import {
  initializeMobileOptimizations,
  requestPersistentStorage,
  checkStorageQuota,
  handleOrientationChange,
} from "@/lib/mobile-utils";

export default function MobileOptimizer() {
  useEffect(() => {
    // Initialize mobile optimizations
    initializeMobileOptimizations();

    // Request persistent storage for better offline experience
    requestPersistentStorage();

    // Check storage quota and warn if running low
    const checkStorage = async () => {
      const { percentage } = await checkStorageQuota();
      if (percentage > 80) {
        console.warn(
          "[Mobile] Storage usage is high:",
          percentage.toFixed(1) + "%"
        );
      }
    };

    checkStorage();

    // Handle orientation changes
    const cleanup = handleOrientationChange(() => {
      // Re-apply optimizations after orientation change
      setTimeout(() => {
        initializeMobileOptimizations();
      }, 200);
    });

    // Periodic storage check (every 5 minutes)
    const storageInterval = setInterval(checkStorage, 5 * 60 * 1000);

    return () => {
      cleanup();
      clearInterval(storageInterval);
    };
  }, []);

  return null;
}
