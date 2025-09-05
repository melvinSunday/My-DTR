"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getMonthName } from "@/lib/utils";
import { MOBILE_INTERACTIONS } from "@/lib/mobile-interactions";

interface MobileDatePickerProps {
  year: number;
  month: number;
  onDateChange: (year: number, month: number) => void;
  onClose: () => void;
}

export default function MobileDatePicker({
  year,
  month,
  onDateChange,
  onClose,
}: MobileDatePickerProps) {
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [isChanging, setIsChanging] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);

  // prevent zoom on iOS when focusing inputs
  useEffect(() => {
    const preventZoom = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement) {
        MOBILE_INTERACTIONS.touch.preventZoom(e.target);
      }
    };

    document.addEventListener("focusin", preventZoom);
    return () => document.removeEventListener("focusin", preventZoom);
  }, []);

  // generate year options (current year ± 5 years)
  const generateYears = useCallback(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }, []);

  // generate month options
  const generateMonths = useCallback(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: getMonthName(i + 1),
    }));
  }, []);

  // handle year change with debouncing
  const handleYearChange = useCallback(
    (newYear: number) => {
      if (newYear === selectedYear) return;

      setIsChanging(true);
      setSelectedYear(newYear);

      // debounce the actual change
      setTimeout(() => {
        onDateChange(newYear, selectedMonth);
        setIsChanging(false);
      }, 100);
    },
    [selectedYear, selectedMonth, onDateChange]
  );

  // handle month change with debouncing
  const handleMonthChange = useCallback(
    (newMonth: number) => {
      if (newMonth === selectedMonth) return;

      setIsChanging(true);
      setSelectedMonth(newMonth);

      // debounce the actual change
      setTimeout(() => {
        onDateChange(selectedYear, newMonth);
        setIsChanging(false);
      }, 100);
    },
    [selectedYear, selectedMonth, onDateChange]
  );

  // handle year input change
  const handleYearInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 2000 && value <= 2100) {
        handleYearChange(value);
      }
    },
    [handleYearChange]
  );

  // handle month input change
  const handleMonthInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 1 && value <= 12) {
        handleMonthChange(value);
      }
    },
    [handleMonthChange]
  );

  // handle year navigation
  const handleYearNavigation = useCallback(
    (direction: "prev" | "next") => {
      const newYear =
        direction === "prev" ? selectedYear - 1 : selectedYear + 1;
      if (newYear >= 2000 && newYear <= 2100) {
        handleYearChange(newYear);
        MOBILE_INTERACTIONS.haptic.light();
      }
    },
    [selectedYear, handleYearChange]
  );

  // handle month navigation
  const handleMonthNavigation = useCallback(
    (direction: "prev" | "next") => {
      let newMonth =
        direction === "prev" ? selectedMonth - 1 : selectedMonth + 1;
      let newYear = selectedYear;

      if (newMonth < 1) {
        newMonth = 12;
        newYear = selectedYear - 1;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear = selectedYear + 1;
      }

      if (newYear >= 2000 && newYear <= 2100) {
        setSelectedYear(newYear);
        setSelectedMonth(newMonth);
        onDateChange(newYear, newMonth);
        MOBILE_INTERACTIONS.haptic.light();
      }
    },
    [selectedYear, selectedMonth, onDateChange]
  );

  // handle apply changes
  const handleApply = useCallback(() => {
    onDateChange(selectedYear, selectedMonth);
    onClose();
    MOBILE_INTERACTIONS.haptic.medium();
  }, [selectedYear, selectedMonth, onDateChange, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800 p-6 mx-4 max-w-sm w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Period
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          ×
        </Button>
      </div>

      {/* Year Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Year
          </label>
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearNavigation("prev")}
                disabled={selectedYear <= 2000}
                className="h-10 w-10 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="flex-1">
              <input
                ref={yearInputRef}
                type="number"
                min="2000"
                max="2100"
                value={selectedYear}
                onChange={handleYearInputChange}
                className="w-full h-10 px-3 text-center text-lg font-semibold bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
                style={{ fontSize: "16px" }} // prevent zoom on iOS
              />
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleYearNavigation("next")}
                disabled={selectedYear >= 2100}
                className="h-10 w-10 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Month Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Month
          </label>
          <div className="flex items-center space-x-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMonthNavigation("prev")}
                className="h-10 w-10 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>

            <div className="flex-1">
              <input
                ref={monthInputRef}
                type="number"
                min="1"
                max="12"
                value={selectedMonth}
                onChange={handleMonthInputChange}
                className="w-full h-10 px-3 text-center text-lg font-semibold bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
                style={{ fontSize: "16px" }} // prevent zoom on iOS
              />
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMonthNavigation("next")}
                className="h-10 w-10 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Month Name Display */}
          <div className="mt-2 text-center">
            <span className="text-sm text-muted-foreground">
              {getMonthName(selectedMonth)}
            </span>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <motion.div
        className="mt-6"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleApply}
          disabled={isChanging}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg"
        >
          {isChanging ? "Applying..." : "Apply Changes"}
        </Button>
      </motion.div>

      {/* Current Selection Display */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Selected Period</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
