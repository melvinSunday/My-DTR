// Mobile-specific utilities for better PWA experience

// Detect if running on mobile device
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Detect if running as PWA (installed app)
export function isPWA(): boolean {
  if (typeof window === "undefined") return false;

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isInWebAppiOS = (window.navigator as any).standalone === true;

  return isStandalone || isInWebAppiOS;
}

// Prevent zoom on input focus (mobile Safari)
export function preventZoomOnInputFocus(): void {
  if (typeof window === "undefined") return;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) return;

  const originalContent = viewport.getAttribute("content");

  const handleFocusIn = () => {
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    );
  };

  const handleFocusOut = () => {
    if (originalContent) {
      viewport.setAttribute("content", originalContent);
    }
  };

  // Add event listeners to all input elements
  document.addEventListener("focusin", (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      handleFocusIn();
    }
  });

  document.addEventListener("focusout", (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      handleFocusOut();
    }
  });
}

// Handle safe area insets for devices with notches
export function applySafeAreaInsets(): void {
  if (typeof window === "undefined") return;

  const root = document.documentElement;

  // Set CSS custom properties for safe area insets
  root.style.setProperty(
    "--safe-area-inset-top",
    "env(safe-area-inset-top, 0px)"
  );
  root.style.setProperty(
    "--safe-area-inset-right",
    "env(safe-area-inset-right, 0px)"
  );
  root.style.setProperty(
    "--safe-area-inset-bottom",
    "env(safe-area-inset-bottom, 0px)"
  );
  root.style.setProperty(
    "--safe-area-inset-left",
    "env(safe-area-inset-left, 0px)"
  );
}

// Optimize touch interactions
export function optimizeTouchInteractions(): void {
  if (typeof window === "undefined") return;

  // Add touch-action CSS for better scrolling
  const style = document.createElement("style");
  style.textContent = `
    /* Optimize touch interactions */
    * {
      -webkit-tap-highlight-color: transparent;
    }
    
    input, textarea, button, select {
      touch-action: manipulation;
    }
    
    /* Prevent pull-to-refresh on mobile */
    body {
      overscroll-behavior-y: contain;
    }
    
    /* Safe area support */
    .safe-area-top {
      padding-top: var(--safe-area-inset-top, 0px);
    }
    
    .safe-area-bottom {
      padding-bottom: var(--safe-area-inset-bottom, 0px);
    }
    
    .safe-area-left {
      padding-left: var(--safe-area-inset-left, 0px);
    }
    
    .safe-area-right {
      padding-right: var(--safe-area-inset-right, 0px);
    }
  `;

  document.head.appendChild(style);
}

// Handle orientation changes
export function handleOrientationChange(callback?: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => {
    // Small delay to ensure layout has updated
    setTimeout(() => {
      callback?.();
    }, 100);
  };

  window.addEventListener("orientationchange", handleChange);
  window.addEventListener("resize", handleChange);

  return () => {
    window.removeEventListener("orientationchange", handleChange);
    window.removeEventListener("resize", handleChange);
  };
}

// Improve input experience on mobile
export function improveInputExperience(): void {
  if (typeof window === "undefined") return;

  // Auto-capitalize first letter for text inputs
  const textInputs = document.querySelectorAll('input[type="text"]');
  textInputs.forEach((input) => {
    if (!input.hasAttribute("autocapitalize")) {
      input.setAttribute("autocapitalize", "sentences");
    }
  });

  // Improve time input experience
  const timeInputs = document.querySelectorAll('input[type="time"]');
  timeInputs.forEach((input) => {
    // Ensure 24-hour format on mobile
    input.setAttribute("step", "60");

    // Add better mobile keyboard
    if (isMobileDevice()) {
      input.setAttribute("inputmode", "numeric");
    }
  });

  // Improve number input experience
  const numberInputs = document.querySelectorAll('input[type="number"]');
  numberInputs.forEach((input) => {
    input.setAttribute("inputmode", "numeric");
  });
}

// Initialize all mobile optimizations
export function initializeMobileOptimizations(): void {
  if (typeof window === "undefined") return;

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applySafeAreaInsets();
      optimizeTouchInteractions();
      preventZoomOnInputFocus();
      improveInputExperience();
    });
  } else {
    applySafeAreaInsets();
    optimizeTouchInteractions();
    preventZoomOnInputFocus();
    improveInputExperience();
  }

  console.log("[Mobile] Mobile optimizations initialized");
}

// Storage quota management for better offline experience
export async function checkStorageQuota(): Promise<{
  quota: number;
  usage: number;
  available: number;
  percentage: number;
}> {
  if (typeof navigator === "undefined" || !("storage" in navigator)) {
    return { quota: 0, usage: 0, available: 0, percentage: 0 };
  }

  try {
    const estimate = await navigator.storage.estimate();
    const quota = estimate.quota || 0;
    const usage = estimate.usage || 0;
    const available = quota - usage;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return { quota, usage, available, percentage };
  } catch (error) {
    console.error("[Mobile] Failed to check storage quota:", error);
    return { quota: 0, usage: 0, available: 0, percentage: 0 };
  }
}

// Request persistent storage for better offline reliability
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("storage" in navigator)) {
    return false;
  }

  try {
    const persistent = await navigator.storage.persist();
    console.log(`[Mobile] Persistent storage: ${persistent}`);
    return persistent;
  } catch (error) {
    console.error("[Mobile] Failed to request persistent storage:", error);
    return false;
  }
}
