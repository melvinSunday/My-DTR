"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a delay if not installed
      if (!isInstalled) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log("[PWA] App was installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
      } else {
        console.log("[PWA] User dismissed the install prompt");
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error("[PWA] Install prompt failed:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem("dtr-install-dismissed", "true");
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  // Check if dismissed this session
  if (
    typeof window !== "undefined" &&
    sessionStorage.getItem("dtr-install-dismissed")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#8C1007] rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Install DTR App
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Install this app on your device for quick access and offline use.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 bg-[#8C1007] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#7c0f06] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>

              <button
                onClick={handleDismiss}
                className="text-gray-500 dark:text-gray-400 px-2 py-1.5 rounded-md text-xs hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
