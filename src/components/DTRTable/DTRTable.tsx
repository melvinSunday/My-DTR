"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDTREntries } from "@/hooks/useDTREntries";
import { useDTRNavigation } from "@/hooks/useDTRNavigation";
import DayView from "./DayView";
import MonthView from "./MonthView";

interface DTRTableProps {
  year: number;
  month: number;
  onEntryChange?: () => void;
}

export default function DTRTable({
  year,
  month,
  onEntryChange,
}: DTRTableProps) {
  // custom hooks for data management and navigation
  const { entries, loading, handleInputChange, clearField, clearDay } =
    useDTREntries({ year, month, onEntryChange });

  const {
    selectedDay,
    setSelectedDay,
    viewMode,
    setViewMode,
    daysInMonth,
    isCurrentMonth,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    updateSelectedDayForNewMonth,
  } = useDTRNavigation({ year, month });

  // update selected day when month/year changes
  useEffect(() => {
    updateSelectedDayForNewMonth();
  }, [updateSelectedDayForNewMonth]);

  // loading state with smooth animation
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center py-12"
      >
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-2 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full"></div>
          </motion.div>
          <motion.span
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Loading your DTR data...
          </motion.span>
        </div>
      </motion.div>
    );
  }

  // animation variants for smooth view transitions
  const viewVariants = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 },
  };

  // render single day view by default
  if (viewMode === "day") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="day-view"
          variants={viewVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1], // custom cubic-bezier for smooth feel
          }}
        >
          <DayView
            year={year}
            month={month}
            selectedDay={selectedDay}
            daysInMonth={daysInMonth}
            isCurrentMonth={isCurrentMonth}
            entry={
              entries[
                `${year}-${month.toString().padStart(2, "0")}-${selectedDay
                  .toString()
                  .padStart(2, "0")}`
              ]
            }
            onPreviousDay={goToPreviousDay}
            onNextDay={goToNextDay}
            onToday={goToToday}
            onSelectDay={setSelectedDay}
            onViewAllDays={() => setViewMode("month")}
            onInputChange={handleInputChange}
            onClearField={clearField}
            onClearDay={clearDay}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // render month view (table/card view)
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="month-view"
        variants={viewVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1], // custom cubic-bezier for smooth feel
        }}
      >
        <MonthView
          year={year}
          month={month}
          daysInMonth={daysInMonth}
          entries={entries}
          onInputChange={handleInputChange}
          onClearField={clearField}
          onClearDay={clearDay}
          onEditDay={(day) => {
            setSelectedDay(day);
            setViewMode("day");
          }}
          onViewDay={() => setViewMode("day")}
        />
      </motion.div>
    </AnimatePresence>
  );
}
