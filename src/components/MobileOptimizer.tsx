"use client";

import { useEffect } from "react";
import {
  initializeMobileOptimizations,
  requestPersistentStorage,
  checkStorageQuota,
  handleOrientationChange,
} from "@/lib/mobile-utils";
import {
  initMobileOptimizations,
  MOBILE_INTERACTIONS,
} from "@/lib/mobile-interactions";

export default function MobileOptimizer() {
  useEffect(() => {
    // Initialize existing mobile optimizations
    initializeMobileOptimizations();

    // Initialize new enhanced mobile optimizations
    const deviceInfo = initMobileOptimizations();

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
        initMobileOptimizations();
      }, 200);
    });

    // Add touch feedback to interactive elements
    const addTouchFeedback = () => {
      const interactiveElements = document.querySelectorAll(
        'button, input, select, textarea, [role="button"], .interactive'
      );

      interactiveElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          MOBILE_INTERACTIONS.touch.addTouchFeedback(element);
        }
      });
    };

    // Add touch feedback after DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addTouchFeedback);
    } else {
      addTouchFeedback();
    }

    // Periodic storage check (every 5 minutes)
    const storageInterval = setInterval(checkStorage, 5 * 60 * 1000);

    // Add haptic feedback to buttons (if supported)
    const addHapticFeedback = () => {
      const buttons = document.querySelectorAll("button");
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          MOBILE_INTERACTIONS.haptic.light();
        });
      });
    };

    // Add haptic feedback after a short delay to ensure DOM is ready
    const hapticTimeout = setTimeout(addHapticFeedback, 1000);

    return () => {
      cleanup();
      clearInterval(storageInterval);
      clearTimeout(hapticTimeout);
    };
  }, []);

  return null;
}
