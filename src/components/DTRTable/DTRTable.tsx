"use client";

import { useEffect } from "react";
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

  // loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // render single day view by default
  if (viewMode === "day") {
    return (
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
    );
  }

  // render month view (table/card view)
  return (
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
  );
}
