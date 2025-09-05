import { DTREntry } from "@/lib/db";
import { getDayOfWeek, formatDate, isWeekend } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Edit3, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  INPUT_STYLES,
  MOBILE_INPUT_STYLES,
  FIELD_LABELS,
  ANIMATION_CONFIG,
  CARD_STYLES,
} from "./constants";

interface DayRowProps {
  day: number;
  year: number;
  month: number;
  entry?: DTREntry;
  onInputChange: (
    date: string,
    field: keyof DTREntry,
    value: string | number
  ) => void;
  onClearField: (
    date: string,
    field: keyof Pick<
      DTREntry,
      | "amArrival"
      | "amDeparture"
      | "pmArrival"
      | "pmDeparture"
      | "overtimeHours"
      | "overtimeMinutes"
    >
  ) => void;
  onClearDay: (date: string) => void;
  onEditDay: (day: number) => void;
  isMobile?: boolean;
}

export default function DayRow({
  day,
  year,
  month,
  entry,
  onInputChange,
  onClearField,
  onClearDay,
  onEditDay,
  isMobile = false,
}: DayRowProps) {
  const date = formatDate(year, month, day);
  const dayOfWeek = getDayOfWeek(year, month, day);
  const dateObj = new Date(year, month - 1, day);
  const isWeekendDay = isWeekend(dateObj);

  // choose appropriate input styles based on device
  const inputStyles = isMobile ? MOBILE_INPUT_STYLES : INPUT_STYLES;
  const inputClass = isWeekendDay ? inputStyles.disabled : inputStyles.base;

  if (isMobile) {
    return (
      <motion.div
        className={`${CARD_STYLES.interactive} m-2 ${
          isWeekendDay
            ? "bg-gray-50 dark:bg-neutral-900/50"
            : "bg-white dark:bg-neutral-900"
        }`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={ANIMATION_CONFIG.smooth}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="flex items-center justify-between mb-3 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <motion.span
              className="text-lg font-semibold text-gray-900 dark:text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...ANIMATION_CONFIG.spring, delay: 0.2 }}
            >
              {day}
            </motion.span>
            <span className="text-sm text-muted-foreground truncate">
              {dayOfWeek}
            </span>
          </div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditDay(day)}
                className="text-xs transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 dark:hover:text-blue-400"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 pt-0"
          variants={ANIMATION_CONFIG.stagger}
          initial="initial"
          animate="animate"
        >
          {/* A.M. Arrival */}
          <motion.div
            className="relative min-w-0"
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              {FIELD_LABELS.amArrival}
            </label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={ANIMATION_CONFIG.quick}
            >
              <Input
                type="time"
                step="60"
                value={entry?.amArrival || ""}
                onChange={(e) =>
                  onInputChange(date, "amArrival", e.target.value)
                }
                disabled={isWeekendDay}
                className={inputClass}
                style={{ colorScheme: "dark light" }}
              />
            </motion.div>
            <AnimatePresence>
              {!isWeekendDay && entry?.amArrival && (
                <motion.button
                  type="button"
                  onClick={() => onClearField(date, "amArrival")}
                  className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                  aria-label="Clear A.M. Arrival"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={ANIMATION_CONFIG.quick}
                >
                  <X className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* A.M. Departure */}
          <motion.div
            className="relative min-w-0"
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              {FIELD_LABELS.amDeparture}
            </label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={ANIMATION_CONFIG.quick}
            >
              <Input
                type="time"
                step="60"
                value={entry?.amDeparture || ""}
                onChange={(e) =>
                  onInputChange(date, "amDeparture", e.target.value)
                }
                disabled={isWeekendDay}
                className={inputClass}
                style={{ colorScheme: "dark light" }}
              />
            </motion.div>
            <AnimatePresence>
              {!isWeekendDay && entry?.amDeparture && (
                <motion.button
                  type="button"
                  onClick={() => onClearField(date, "amDeparture")}
                  className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                  aria-label="Clear A.M. Departure"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={ANIMATION_CONFIG.quick}
                >
                  <X className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* P.M. Arrival */}
          <motion.div
            className="relative min-w-0"
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              {FIELD_LABELS.pmArrival}
            </label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={ANIMATION_CONFIG.quick}
            >
              <Input
                type="time"
                step="60"
                value={entry?.pmArrival || ""}
                onChange={(e) =>
                  onInputChange(date, "pmArrival", e.target.value)
                }
                disabled={isWeekendDay}
                className={inputClass}
                style={{ colorScheme: "dark light" }}
              />
            </motion.div>
            <AnimatePresence>
              {!isWeekendDay && entry?.pmArrival && (
                <motion.button
                  type="button"
                  onClick={() => onClearField(date, "pmArrival")}
                  className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                  aria-label="Clear P.M. Arrival"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={ANIMATION_CONFIG.quick}
                >
                  <X className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* P.M. Departure */}
          <motion.div
            className="relative min-w-0"
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              {FIELD_LABELS.pmDeparture}
            </label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={ANIMATION_CONFIG.quick}
            >
              <Input
                type="time"
                step="60"
                value={entry?.pmDeparture || ""}
                onChange={(e) =>
                  onInputChange(date, "pmDeparture", e.target.value)
                }
                disabled={isWeekendDay}
                className={inputClass}
                style={{ colorScheme: "dark light" }}
              />
            </motion.div>
            <AnimatePresence>
              {!isWeekendDay && entry?.pmDeparture && (
                <motion.button
                  type="button"
                  onClick={() => onClearField(date, "pmDeparture")}
                  className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                  aria-label="Clear P.M. Departure"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={ANIMATION_CONFIG.quick}
                >
                  <X className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Overtime Hours */}
          <motion.div
            className="relative min-w-0"
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              Overtime Hours
            </label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={ANIMATION_CONFIG.quick}
            >
              <Input
                type="number"
                min={0}
                max={23}
                value={entry?.overtimeHours ?? ""}
                onChange={(e) =>
                  onInputChange(
                    date,
                    "overtimeHours",
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={isWeekendDay}
                placeholder="0"
                className={inputClass}
              />
            </motion.div>
            <AnimatePresence>
              {!isWeekendDay && (entry?.overtimeHours ?? 0) > 0 && (
                <motion.button
                  type="button"
                  onClick={() => onClearField(date, "overtimeHours")}
                  className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                  aria-label="Clear OT Hours"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={ANIMATION_CONFIG.quick}
                >
                  <X className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Overtime Minutes */}
          <motion.div
            className="relative min-w-0"
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              Overtime Minutes
            </label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={ANIMATION_CONFIG.quick}
            >
              <Input
                type="number"
                min={0}
                max={59}
                value={entry?.overtimeMinutes ?? ""}
                onChange={(e) =>
                  onInputChange(
                    date,
                    "overtimeMinutes",
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={isWeekendDay}
                placeholder="0"
                className={inputClass}
              />
            </motion.div>
            <AnimatePresence>
              {!isWeekendDay && (entry?.overtimeMinutes ?? 0) > 0 && (
                <motion.button
                  type="button"
                  onClick={() => onClearField(date, "overtimeMinutes")}
                  className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
                  aria-label="Clear OT Minutes"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={ANIMATION_CONFIG.quick}
                >
                  <X className="size-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Desktop table row
  return (
    <motion.tr
      className={`border-b border-gray-200 dark:border-neutral-800 ${
        isWeekendDay
          ? "bg-gray-50 dark:bg-neutral-900/50"
          : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-900/80"
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.quick}
      whileHover={{
        backgroundColor: isWeekendDay ? undefined : "rgba(249, 250, 251, 0.8)",
        scale: 1.01,
      }}
    >
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
        <div className="flex flex-col">
          <span>{day}</span>
          <span className="text-xs text-muted-foreground">{dayOfWeek}</span>
        </div>
      </td>

      {/* A.M. Arrival */}
      <td className="px-4 py-3 min-w-0">
        <Input
          type="time"
          step="60"
          value={entry?.amArrival || ""}
          onChange={(e) => onInputChange(date, "amArrival", e.target.value)}
          disabled={isWeekendDay}
          className={inputClass}
          style={{ colorScheme: "dark light" }}
        />
      </td>

      {/* A.M. Departure */}
      <td className="px-4 py-3 min-w-0">
        <Input
          type="time"
          step="60"
          value={entry?.amDeparture || ""}
          onChange={(e) => onInputChange(date, "amDeparture", e.target.value)}
          disabled={isWeekendDay}
          className={inputClass}
          style={{ colorScheme: "dark light" }}
        />
      </td>

      {/* P.M. Arrival */}
      <td className="px-4 py-3 min-w-0">
        <Input
          type="time"
          step="60"
          value={entry?.pmArrival || ""}
          onChange={(e) => onInputChange(date, "pmArrival", e.target.value)}
          disabled={isWeekendDay}
          className={inputClass}
          style={{ colorScheme: "dark light" }}
        />
      </td>

      {/* P.M. Departure */}
      <td className="px-4 py-3 min-w-0">
        <Input
          type="time"
          step="60"
          value={entry?.pmDeparture || ""}
          onChange={(e) => onInputChange(date, "pmDeparture", e.target.value)}
          disabled={isWeekendDay}
          className={inputClass}
          style={{ colorScheme: "dark light" }}
        />
      </td>

      {/* Overtime Hours */}
      <td className="px-4 py-3 min-w-0">
        <Input
          type="number"
          min={0}
          max={23}
          value={entry?.overtimeHours ?? ""}
          onChange={(e) =>
            onInputChange(date, "overtimeHours", parseInt(e.target.value) || 0)
          }
          disabled={isWeekendDay}
          placeholder="0"
          className={inputClass}
        />
      </td>

      {/* Overtime Minutes */}
      <td className="px-4 py-3 min-w-0">
        <Input
          type="number"
          min={0}
          max={59}
          value={entry?.overtimeMinutes ?? ""}
          onChange={(e) =>
            onInputChange(
              date,
              "overtimeMinutes",
              parseInt(e.target.value) || 0
            )
          }
          disabled={isWeekendDay}
          placeholder="0"
          className={inputClass}
        />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditDay(day)}
              className="h-8 px-2 text-xs transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:text-blue-400"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </motion.div>
          <AnimatePresence>
            {!isWeekendDay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClearDay(date)}
                  className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </motion.tr>
  );
}
