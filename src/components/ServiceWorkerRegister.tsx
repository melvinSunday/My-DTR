"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js");
          // listen for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              // you can show a toast here to refresh
              // console.log("Service worker state:", newWorker.state);
            });
          });
        } catch (e) {
          // console.error("SW registration failed", e);
        }
      };
      // register after window load for better TTI
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
