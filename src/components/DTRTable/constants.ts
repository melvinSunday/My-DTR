// modern input styles centralized (extra right padding for clear button)
export const INPUT_STYLES = {
  base: "w-full pr-10 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-xs",
  disabled:
    "w-full pr-10 bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-neutral-800 shadow-none",
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
