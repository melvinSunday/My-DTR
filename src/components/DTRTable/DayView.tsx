import { DTREntry } from "@/lib/db";
import { formatDate, getDayOfWeek, isWeekend } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Calendar, ChevronLeft, ChevronRight, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TimeInput from "./TimeInput";
import {
  SESSION_LABELS,
  FIELD_LABELS,
  CARD_STYLES,
  ANIMATION_CONFIG,
} from "./constants";

interface DayViewProps {
  year: number;
  month: number;
  selectedDay: number;
  daysInMonth: number;
  isCurrentMonth: boolean;
  entry?: DTREntry;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onSelectDay: (day: number) => void;
  onViewAllDays: () => void;
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
}

export default function DayView({
  year,
  month,
  selectedDay,
  daysInMonth,
  isCurrentMonth,
  entry,
  onPreviousDay,
  onNextDay,
  onToday,
  onSelectDay,
  onViewAllDays,
  onInputChange,
  onClearField,
  onClearDay,
}: DayViewProps) {
  const date = formatDate(year, month, selectedDay);
  const dayOfWeek = getDayOfWeek(year, month, selectedDay);
  const dateObj = new Date(year, month - 1, selectedDay);
  const isWeekendDay = isWeekend(dateObj);

  // check if today using memoized value
  const today = new Date();
  const isToday = isCurrentMonth && selectedDay === today.getDate();

  return (
    <motion.div
      className={CARD_STYLES.base}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.smooth}
    >
      {/* Day Navigation Header */}
      <motion.div
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-900/60 dark:to-neutral-800/60 px-4 py-3 border-b border-gray-200 dark:border-neutral-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.smooth, delay: 0.1 }}
      >
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between min-w-max gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPreviousDay}
                    disabled={selectedDay <= 1}
                    className="h-8 w-8 p-0 flex-shrink-0 transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNextDay}
                    disabled={selectedDay >= daysInMonth}
                    className="h-8 w-8 p-0 flex-shrink-0 transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  Day {selectedDay}
                </span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {dayOfWeek}
                </span>
                <AnimatePresence>
                  {isToday && (
                    <motion.span
                      className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full whitespace-nowrap"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={ANIMATION_CONFIG.quick}
                    >
                      Today
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Day Selector Dropdown */}
              <select
                value={selectedDay}
                onChange={(e) => onSelectDay(parseInt(e.target.value))}
                className="text-xs border border-gray-300 dark:border-neutral-700 rounded-md px-2 py-1 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
              >
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dayDate = new Date(year, month - 1, day);
                  const dayName = getDayOfWeek(year, month, day);
                  const isWeekendOption = isWeekend(dayDate);

                  return (
                    <option key={day} value={day} disabled={isWeekendOption}>
                      {day} - {dayName} {isWeekendOption ? "(Weekend)" : ""}
                    </option>
                  );
                })}
              </select>

              <AnimatePresence>
                {isCurrentMonth && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToday}
                      className="text-xs whitespace-nowrap transition-all duration-200"
                    >
                      Go to Today
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewAllDays}
                  className="text-xs whitespace-nowrap transition-all duration-200"
                >
                  <List className="h-3 w-3 mr-1" />
                  View All Days
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Single Day Content */}
      <motion.div
        className="p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.smooth, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {isWeekendDay ? (
            <motion.div
              key="weekend"
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={ANIMATION_CONFIG.smooth}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...ANIMATION_CONFIG.spring, delay: 0.3 }}
              >
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Weekend Day
              </h3>
              <p className="text-sm text-muted-foreground">
                No time entries needed for {dayOfWeek}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="workday"
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={ANIMATION_CONFIG.smooth}
            >
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={ANIMATION_CONFIG.stagger}
                initial="initial"
                animate="animate"
              >
                {/* Morning Session */}
                <motion.div
                  className="space-y-4"
                  variants={{
                    initial: { opacity: 0, x: -20 },
                    animate: { opacity: 1, x: 0 },
                  }}
                >
                  <motion.h3
                    className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {SESSION_LABELS.morning}
                  </motion.h3>

                  <TimeInput
                    value={entry?.amArrival || ""}
                    onChange={(value) =>
                      onInputChange(date, "amArrival", value)
                    }
                    onClear={() => onClearField(date, "amArrival")}
                    label={FIELD_LABELS.amArrival}
                    type="time"
                    step="60"
                    showSuccessFeedback={true}
                  />

                  <TimeInput
                    value={entry?.amDeparture || ""}
                    onChange={(value) =>
                      onInputChange(date, "amDeparture", value)
                    }
                    onClear={() => onClearField(date, "amDeparture")}
                    label={FIELD_LABELS.amDeparture}
                    type="time"
                    step="60"
                    showSuccessFeedback={true}
                  />
                </motion.div>

                {/* Afternoon Session */}
                <motion.div
                  className="space-y-4"
                  variants={{
                    initial: { opacity: 0, x: 20 },
                    animate: { opacity: 1, x: 0 },
                  }}
                >
                  <motion.h3
                    className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {SESSION_LABELS.afternoon}
                  </motion.h3>

                  <TimeInput
                    value={entry?.pmArrival || ""}
                    onChange={(value) =>
                      onInputChange(date, "pmArrival", value)
                    }
                    onClear={() => onClearField(date, "pmArrival")}
                    label={FIELD_LABELS.pmArrival}
                    type="time"
                    step="60"
                    showSuccessFeedback={true}
                  />

                  <TimeInput
                    value={entry?.pmDeparture || ""}
                    onChange={(value) =>
                      onInputChange(date, "pmDeparture", value)
                    }
                    onClear={() => onClearField(date, "pmDeparture")}
                    label={FIELD_LABELS.pmDeparture}
                    type="time"
                    step="60"
                    showSuccessFeedback={true}
                  />
                </motion.div>
              </motion.div>

              {/* Overtime Section */}
              <motion.div
                className="border-t border-gray-200 dark:border-neutral-800 pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.h3
                  className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {SESSION_LABELS.overtime}
                </motion.h3>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={ANIMATION_CONFIG.stagger}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div
                    variants={{
                      initial: { opacity: 0, x: -20 },
                      animate: { opacity: 1, x: 0 },
                    }}
                  >
                    <TimeInput
                      value={entry?.overtimeHours?.toString() || ""}
                      onChange={(value) =>
                        onInputChange(
                          date,
                          "overtimeHours",
                          parseInt(value) || 0
                        )
                      }
                      onClear={() => onClearField(date, "overtimeHours")}
                      label={FIELD_LABELS.overtimeHours}
                      type="number"
                      min={0}
                      max={23}
                      placeholder="0"
                      showSuccessFeedback={true}
                    />
                  </motion.div>

                  <motion.div
                    variants={{
                      initial: { opacity: 0, x: 20 },
                      animate: { opacity: 1, x: 0 },
                    }}
                  >
                    <TimeInput
                      value={entry?.overtimeMinutes?.toString() || ""}
                      onChange={(value) =>
                        onInputChange(
                          date,
                          "overtimeMinutes",
                          parseInt(value) || 0
                        )
                      }
                      onClear={() => onClearField(date, "overtimeMinutes")}
                      label={FIELD_LABELS.overtimeMinutes}
                      type="number"
                      min={0}
                      max={59}
                      placeholder="0"
                      showSuccessFeedback={true}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Clear Day Button */}
              <motion.div
                className="border-t border-gray-200 dark:border-neutral-800 pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => onClearDay(date)}
                    className="w-full md:w-auto transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:border-red-800 dark:hover:text-red-400"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Entries for This Day
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
