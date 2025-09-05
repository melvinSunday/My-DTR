// modern input styles centralized (extra right padding for clear button)
export const INPUT_STYLES = {
  base: "w-full pr-10 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-xs transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-400/20 dark:focus:border-blue-400",
  disabled:
    "w-full pr-10 bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-neutral-800 shadow-none",
} as const;

// mobile-optimized input styles for better touch interaction
export const MOBILE_INPUT_STYLES = {
  base: "w-full pr-10 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:ring-blue-400/20 dark:focus:border-blue-400 text-base min-h-[44px] touch-manipulation",
  disabled:
    "w-full pr-10 bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-neutral-800 shadow-none min-h-[44px]",
} as const;

// time field types for validation
export const TIME_FIELDS = [
  "amArrival",
  "amDeparture",
  "pmArrival",
  "pmDeparture",
] as const;

// overtime field types
export const OVERTIME_FIELDS = ["overtimeHours", "overtimeMinutes"] as const;

// all clearable fields
export const CLEARABLE_FIELDS = [...TIME_FIELDS, ...OVERTIME_FIELDS] as const;

// table column headers
export const TABLE_HEADERS = [
  "Date",
  "A.M. Arrival",
  "A.M. Departure",
  "P.M. Arrival",
  "P.M. Departure",
  "OT Hours",
  "OT Minutes",
  "Actions",
] as const;

// session labels
export const SESSION_LABELS = {
  morning: "Morning Session",
  afternoon: "Afternoon Session",
  overtime: "Overtime",
} as const;

// field labels
export const FIELD_LABELS = {
  amArrival: "A.M. Arrival",
  amDeparture: "A.M. Departure",
  pmArrival: "P.M. Arrival",
  pmDeparture: "P.M. Departure",
  overtimeHours: "Hours",
  overtimeMinutes: "Minutes",
} as const;

// animation configurations for smooth transitions
export const ANIMATION_CONFIG = {
  // spring animations for natural feel
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  // smooth transitions for view changes
  smooth: {
    duration: 0.3,
    ease: [0.4, 0.0, 0.2, 1], // custom cubic-bezier
  },
  // quick micro-interactions
  quick: {
    duration: 0.15,
    ease: [0.4, 0.0, 0.2, 1],
  },
  // staggered animations for lists
  stagger: {
    initial: {},
    animate: {
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.05,
      },
    },
  },
} as const;

// mobile breakpoints and touch optimizations
export const MOBILE_CONFIG = {
  // minimum touch target size (44px for iOS, 48dp for Android)
  minTouchTarget: "44px",
  // safe area insets for modern devices
  safeArea: {
    top: "env(safe-area-inset-top)",
    bottom: "env(safe-area-inset-bottom)",
    left: "env(safe-area-inset-left)",
    right: "env(safe-area-inset-right)",
  },
  // haptic feedback timing
  hapticDelay: 50,
} as const;

// card and container styles for modern look
export const CARD_STYLES = {
  base: "bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden",
  elevated:
    "bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800 overflow-hidden",
  interactive:
    "bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden hover:shadow-md hover:border-gray-300 dark:hover:border-neutral-700 transition-all duration-200",
} as const;
