import { useState, useCallback, useMemo } from "react";
import { getDaysInMonth } from "@/lib/utils";

interface UseDTRNavigationProps {
  year: number;
  month: number;
}

export function useDTRNavigation({ year, month }: UseDTRNavigationProps) {
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    // Initialize with current day if it's in the selected month/year
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // If viewing current month/year, start with today, otherwise start with day 1
    if (year === currentYear && month === currentMonth) {
      return currentDay;
    }
    return 1;
  });

  const [viewMode, setViewMode] = useState<"day" | "month">("day");

  // memoize frequently calculated values to prevent unnecessary re-calculations
  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const isCurrentMonth = useMemo(() => {
    const today = new Date();
    return year === today.getFullYear() && month === today.getMonth() + 1;
  }, [year, month]);

  // Helper functions for day navigation - memoized to prevent unnecessary re-renders
  const goToPreviousDay = useCallback(() => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    }
  }, [selectedDay]);

  const goToNextDay = useCallback(() => {
    if (selectedDay < daysInMonth) {
      setSelectedDay(selectedDay + 1);
    }
  }, [selectedDay, daysInMonth]);

  const goToToday = useCallback(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    if (year === currentYear && month === currentMonth) {
      setSelectedDay(currentDay);
    }
  }, [year, month]);

  // Update selected day when month/year changes
  const updateSelectedDayForNewMonth = useCallback(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    if (year === currentYear && month === currentMonth) {
      setSelectedDay(currentDay);
    } else {
      setSelectedDay(1);
    }
  }, [year, month]);

  return {
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
  };
}
