import { DTREntry } from "@/lib/db";
import { formatDate, getDayOfWeek, isWeekend } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DayRow from "./DayRow";
import { TABLE_HEADERS, CARD_STYLES, ANIMATION_CONFIG } from "./constants";

interface MonthViewProps {
  year: number;
  month: number;
  daysInMonth: number;
  entries: Record<string, DTREntry>;
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
  onViewDay: () => void;
}

export default function MonthView({
  year,
  month,
  daysInMonth,
  entries,
  onInputChange,
  onClearField,
  onClearDay,
  onEditDay,
  onViewDay,
}: MonthViewProps) {
  return (
    <motion.div
      className={CARD_STYLES.base}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.smooth}
    >
      {/* View Mode Header */}
      <motion.div
        className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-900/60 dark:to-neutral-800/60 px-4 py-3 border-b border-gray-200 dark:border-neutral-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.smooth, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <motion.h3
            className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            All Days -{" "}
            {new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDay}
              className="text-xs transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:border-blue-800 dark:hover:text-blue-400"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Day View
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Desktop table view */}
      <motion.div
        className="hidden md:block overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.smooth, delay: 0.2 }}
      >
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
          <motion.thead
            className="bg-gray-50 dark:bg-neutral-900/60"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <tr>
              {TABLE_HEADERS.map((header, index) => (
                <motion.th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  {header}
                </motion.th>
              ))}
            </tr>
          </motion.thead>
          <motion.tbody
            className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800"
            variants={ANIMATION_CONFIG.stagger}
            initial="initial"
            animate="animate"
          >
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = formatDate(year, month, day);
              const entry = entries[date];

              return (
                <motion.div
                  key={date}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                  }}
                >
                  <DayRow
                    day={day}
                    year={year}
                    month={month}
                    entry={entry}
                    onInputChange={onInputChange}
                    onClearField={onClearField}
                    onClearDay={onClearDay}
                    onEditDay={onEditDay}
                    isMobile={false}
                  />
                </motion.div>
              );
            })}
          </motion.tbody>
        </table>
      </motion.div>

      {/* Mobile card view */}
      <motion.div
        className="md:hidden p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...ANIMATION_CONFIG.smooth, delay: 0.2 }}
      >
        <motion.div
          variants={ANIMATION_CONFIG.stagger}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = formatDate(year, month, day);
            const entry = entries[date];

            return (
              <motion.div
                key={date}
                variants={{
                  initial: { opacity: 0, y: 20, scale: 0.95 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  ...ANIMATION_CONFIG.smooth,
                  delay: i * 0.05, // stagger each card
                }}
              >
                <DayRow
                  day={day}
                  year={year}
                  month={month}
                  entry={entry}
                  onInputChange={onInputChange}
                  onClearField={onClearField}
                  onClearDay={onClearDay}
                  onEditDay={onEditDay}
                  isMobile={true}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
