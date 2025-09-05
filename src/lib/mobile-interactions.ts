// mobile interaction utilities for iOS and Android optimization
export const MOBILE_INTERACTIONS = {
  // haptic feedback for supported devices
  haptic: {
    light: () => {
      if ("vibrate" in navigator) {
        navigator.vibrate(10);
      }
    },
    medium: () => {
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    },
    heavy: () => {
      if ("vibrate" in navigator) {
        navigator.vibrate(100);
      }
    },
  },

  // touch optimization for better mobile performance
  touch: {
    // prevent zoom on double tap for input fields
    preventZoom: (element: HTMLElement) => {
      let lastTouchEnd = 0;
      element.addEventListener(
        "touchend",
        (event) => {
          const now = new Date().getTime();
          if (now - lastTouchEnd <= 300) {
            event.preventDefault();
          }
          lastTouchEnd = now;
        },
        false
      );
    },

    // add touch feedback class
    addTouchFeedback: (element: HTMLElement) => {
      element.addEventListener("touchstart", () => {
        element.classList.add("touch-active");
      });

      element.addEventListener("touchend", () => {
        setTimeout(() => {
          element.classList.remove("touch-active");
        }, 150);
      });
    },
  },

  // iOS specific optimizations
  ios: {
    // prevent bounce scrolling on iOS
    preventBounce: () => {
      document.body.style.overscrollBehavior = "none";
      document.body.style.webkitOverflowScrolling = "touch";
    },

    // fix iOS viewport height issues
    fixViewportHeight: () => {
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      };

      setVH();
      window.addEventListener("resize", setVH);
      window.addEventListener("orientationchange", setVH);
    },

    // optimize for iOS Safari
    optimizeSafari: () => {
      // prevent text selection on buttons
      const style = document.createElement("style");
      style.textContent = `
        .no-select {
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
      `;
      document.head.appendChild(style);
    },
  },

  // Android specific optimizations
  android: {
    // optimize for Chrome on Android
    optimizeChrome: () => {
      // add meta tag for better viewport handling
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        );
      }
    },

    // handle Android keyboard
    handleKeyboard: () => {
      const originalHeight = window.innerHeight;

      window.addEventListener("resize", () => {
        const currentHeight = window.innerHeight;
        const heightDiff = originalHeight - currentHeight;

        // if height decreased significantly, keyboard is likely open
        if (heightDiff > 150) {
          document.body.classList.add("keyboard-open");
        } else {
          document.body.classList.remove("keyboard-open");
        }
      });
    },
  },

  // performance optimizations
  performance: {
    // debounce function for better performance
    debounce: <T extends (...args: any[]) => any>(
      func: T,
      wait: number
    ): ((...args: Parameters<T>) => void) => {
      let timeout: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    },

    // throttle function for scroll events
    throttle: <T extends (...args: any[]) => any>(
      func: T,
      limit: number
    ): ((...args: Parameters<T>) => void) => {
      let inThrottle: boolean;
      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    // lazy load images
    lazyLoad: (selector: string) => {
      const images = document.querySelectorAll(selector);
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || "";
            img.classList.remove("lazy");
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    },
  },

  // accessibility improvements for mobile
  accessibility: {
    // increase touch targets for better accessibility
    increaseTouchTargets: () => {
      const style = document.createElement("style");
      style.textContent = `
        .touch-target {
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          button, input, select, textarea {
            min-height: 44px;
          }
        }
      `;
      document.head.appendChild(style);
    },

    // add focus indicators for keyboard navigation
    addFocusIndicators: () => {
      const style = document.createElement("style");
      style.textContent = `
        .focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        @media (max-width: 768px) {
          .focus-visible {
            outline-width: 3px;
          }
        }
      `;
      document.head.appendChild(style);
    },
  },
};

// initialize mobile optimizations
export const initMobileOptimizations = () => {
  // detect device type
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  if (isMobile) {
    // apply general mobile optimizations
    MOBILE_INTERACTIONS.accessibility.increaseTouchTargets();
    MOBILE_INTERACTIONS.accessibility.addFocusIndicators();

    if (isIOS) {
      MOBILE_INTERACTIONS.ios.preventBounce();
      MOBILE_INTERACTIONS.ios.fixViewportHeight();
      MOBILE_INTERACTIONS.ios.optimizeSafari();
    }

    if (isAndroid) {
      MOBILE_INTERACTIONS.android.optimizeChrome();
      MOBILE_INTERACTIONS.android.handleKeyboard();
    }
  }

  return { isIOS, isAndroid, isMobile };
};

// export device detection
export const getDeviceInfo = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(navigator.userAgent);

  return {
    isIOS,
    isAndroid,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
  };
};
