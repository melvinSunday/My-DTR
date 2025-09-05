"use client";

import { useState, useEffect } from "react";
import { DTREntry, saveDTREntry, getDTREntriesForMonth } from "@/lib/db";
import { queueOfflineAction } from "@/lib/offline-sync";
import {
  isWeekend,
  formatDate,
  getDaysInMonth,
  getDayOfWeek,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Calendar, ChevronLeft, ChevronRight, List } from "lucide-react";

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
  const [entries, setEntries] = useState<Record<string, DTREntry>>({});
  const [loading, setLoading] = useState(true);
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

  // modern input styles centralized (extra right padding for clear button)
  const baseInputClass =
    "w-full pr-10 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-xs";
  const disabledInputClass =
    "w-full pr-10 bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-neutral-800 shadow-none";

  useEffect(() => {
    loadEntries();

    // Update selected day when month/year changes
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

  const loadEntries = async () => {
    // loading entries for selected month
    setLoading(true);
    try {
      const monthEntries = await getDTREntriesForMonth(year, month);
      const entriesMap: Record<string, DTREntry> = {};

      monthEntries.forEach((entry) => {
        entriesMap[entry.date] = entry;
      });

      setEntries(entriesMap);
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (
    date: string,
    field: keyof DTREntry,
    value: string | number
  ) => {
    // handle inline editing and persist to indexeddb
    const dateObj = new Date(date);
    const isWeekendDay = isWeekend(dateObj);

    if (isWeekendDay) return; // prevent editing on weekends

    const currentEntry = entries[date] || {
      date,
      amArrival: "",
      amDeparture: "",
      pmArrival: "",
      pmDeparture: "",
      overtimeHours: 0,
      overtimeMinutes: 0,
      isWeekend: isWeekendDay,
    };

    const updatedEntry = { ...currentEntry, [field]: value } as DTREntry;

    // update local state
    setEntries((prev) => ({
      ...prev,
      [date]: updatedEntry,
    }));

    // save to indexeddb
    try {
      await saveDTREntry(updatedEntry);

      // Queue for offline sync if needed
      if (!navigator.onLine) {
        queueOfflineAction("save", updatedEntry);
      }

      // Notify parent component about the change
      onEntryChange?.();
    } catch (error) {
      console.error("Error saving entry:", error);

      // Always queue if save fails (could be offline)
      queueOfflineAction("save", updatedEntry);
    }
  };

  const clearField = async (
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
  ) => {
    const isTimeField = [
      "amArrival",
      "amDeparture",
      "pmArrival",
      "pmDeparture",
    ].includes(field);
    const newValue = isTimeField ? "" : 0;
    await handleInputChange(date, field as keyof DTREntry, newValue as any);
  };

  const clearDay = async (date: string) => {
    // reset all fields for a date
    const dateObj = new Date(date);
    if (isWeekend(dateObj)) return;

    const resetEntry: DTREntry = {
      date,
      amArrival: "",
      amDeparture: "",
      pmArrival: "",
      pmDeparture: "",
      overtimeHours: 0,
      overtimeMinutes: 0,
      isWeekend: false,
    };

    // update local first for snappy ui
    setEntries((prev) => ({
      ...prev,
      [date]: resetEntry,
    }));

    try {
      await saveDTREntry(resetEntry);

      // Queue for offline sync if needed
      if (!navigator.onLine) {
        queueOfflineAction("save", resetEntry);
      }

      // Notify parent component about the change
      onEntryChange?.();
    } catch (error) {
      console.error("Error clearing day:", error);

      // Always queue if save fails (could be offline)
      queueOfflineAction("save", resetEntry);
    }
  };

  // Helper functions for day navigation
  const goToPreviousDay = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    }
  };

  const goToNextDay = () => {
    const daysInMonth = getDaysInMonth(year, month);
    if (selectedDay < daysInMonth) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    if (year === currentYear && month === currentMonth) {
      setSelectedDay(currentDay);
    }
  };

  const renderSingleDayView = () => {
    const date = formatDate(year, month, selectedDay);
    const dayOfWeek = getDayOfWeek(year, month, selectedDay);
    const dateObj = new Date(year, month - 1, selectedDay);
    const isWeekendDay = isWeekend(dateObj);
    const entry = entries[date];
    const daysInMonth = getDaysInMonth(year, month);

    // Check if today
    const today = new Date();
    const isToday =
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      selectedDay === today.getDate();

    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
        {/* Day Navigation Header */}
        <div className="bg-gray-50 dark:bg-neutral-900/60 px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between min-w-max gap-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousDay}
                    disabled={selectedDay <= 1}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextDay}
                    disabled={selectedDay >= daysInMonth}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    Day {selectedDay}
                  </span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {dayOfWeek}
                  </span>
                  {isToday && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full whitespace-nowrap">
                      Today
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Day Selector Dropdown */}
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
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

                {year === today.getFullYear() &&
                  month === today.getMonth() + 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="text-xs whitespace-nowrap"
                    >
                      Go to Today
                    </Button>
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="text-xs whitespace-nowrap"
                >
                  <List className="h-3 w-3 mr-1" />
                  View All Days
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Single Day Content */}
        <div className="p-6">
          {isWeekendDay ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Weekend Day
              </h3>
              <p className="text-sm text-muted-foreground">
                No time entries needed for {dayOfWeek}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Morning Session */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Morning Session
                  </h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      A.M. Arrival
                    </label>
                    <Input
                      type="time"
                      step="60"
                      value={entry?.amArrival || ""}
                      onChange={(e) =>
                        handleInputChange(date, "amArrival", e.target.value)
                      }
                      className="h-12 text-lg"
                      style={{ colorScheme: "dark light" }}
                    />
                    {entry?.amArrival && (
                      <button
                        type="button"
                        onClick={() => clearField(date, "amArrival")}
                        className="absolute top-9 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                        aria-label="Clear A.M. Arrival"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      A.M. Departure
                    </label>
                    <Input
                      type="time"
                      step="60"
                      value={entry?.amDeparture || ""}
                      onChange={(e) =>
                        handleInputChange(date, "amDeparture", e.target.value)
                      }
                      className="h-12 text-lg"
                      style={{ colorScheme: "dark light" }}
                    />
                    {entry?.amDeparture && (
                      <button
                        type="button"
                        onClick={() => clearField(date, "amDeparture")}
                        className="absolute top-9 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                        aria-label="Clear A.M. Departure"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Afternoon Session */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Afternoon Session
                  </h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      P.M. Arrival
                    </label>
                    <Input
                      type="time"
                      step="60"
                      value={entry?.pmArrival || ""}
                      onChange={(e) =>
                        handleInputChange(date, "pmArrival", e.target.value)
                      }
                      className="h-12 text-lg"
                      style={{ colorScheme: "dark light" }}
                    />
                    {entry?.pmArrival && (
                      <button
                        type="button"
                        onClick={() => clearField(date, "pmArrival")}
                        className="absolute top-9 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                        aria-label="Clear P.M. Arrival"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      P.M. Departure
                    </label>
                    <Input
                      type="time"
                      step="60"
                      value={entry?.pmDeparture || ""}
                      onChange={(e) =>
                        handleInputChange(date, "pmDeparture", e.target.value)
                      }
                      className="h-12 text-lg"
                      style={{ colorScheme: "dark light" }}
                    />
                    {entry?.pmDeparture && (
                      <button
                        type="button"
                        onClick={() => clearField(date, "pmDeparture")}
                        className="absolute top-9 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                        aria-label="Clear P.M. Departure"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Overtime Section */}
              <div className="border-t border-gray-200 dark:border-neutral-800 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                  Overtime
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hours
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={entry?.overtimeHours ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          date,
                          "overtimeHours",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="h-12 text-lg"
                    />
                    {(entry?.overtimeHours ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => clearField(date, "overtimeHours")}
                        className="absolute top-9 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                        aria-label="Clear Overtime Hours"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minutes
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={entry?.overtimeMinutes ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          date,
                          "overtimeMinutes",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="h-12 text-lg"
                    />
                    {(entry?.overtimeMinutes ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => clearField(date, "overtimeMinutes")}
                        className="absolute top-9 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
                        aria-label="Clear Overtime Minutes"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Clear Day Button */}
              <div className="border-t border-gray-200 dark:border-neutral-800 pt-6">
                <Button
                  variant="outline"
                  onClick={() => clearDay(date)}
                  className="w-full md:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Entries for This Day
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDayRow = (day: number) => {
    const date = formatDate(year, month, day);
    const dayOfWeek = getDayOfWeek(year, month, day);
    const dateObj = new Date(year, month - 1, day);
    const isWeekendDay = isWeekend(dateObj);
    const entry = entries[date];

    return (
      <tr
        key={date}
        className={`border-b border-gray-200 dark:border-neutral-800 ${
          isWeekendDay
            ? "bg-gray-50 dark:bg-neutral-900/50"
            : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-900/80"
        }`}
      >
        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
          <div className="flex flex-col">
            <span>{day}</span>
            <span className="text-xs text-muted-foreground">{dayOfWeek}</span>
          </div>
        </td>

        {/* arrival 1 */}
        <td className="px-4 py-3 min-w-0">
          <Input
            type="time"
            step="60"
            value={entry?.amArrival || ""}
            onChange={(e) =>
              handleInputChange(date, "amArrival", e.target.value)
            }
            disabled={isWeekendDay}
            className={isWeekendDay ? disabledInputClass : baseInputClass}
            style={{ colorScheme: "dark light" }}
          />
        </td>

        {/* departure 1 */}
        <td className="px-4 py-3 min-w-0">
          <Input
            type="time"
            step="60"
            value={entry?.amDeparture || ""}
            onChange={(e) =>
              handleInputChange(date, "amDeparture", e.target.value)
            }
            disabled={isWeekendDay}
            className={isWeekendDay ? disabledInputClass : baseInputClass}
            style={{ colorScheme: "dark light" }}
          />
        </td>

        {/* arrival 2 */}
        <td className="px-4 py-3 min-w-0">
          <Input
            type="time"
            step="60"
            value={entry?.pmArrival || ""}
            onChange={(e) =>
              handleInputChange(date, "pmArrival", e.target.value)
            }
            disabled={isWeekendDay}
            className={isWeekendDay ? disabledInputClass : baseInputClass}
            style={{ colorScheme: "dark light" }}
          />
        </td>

        {/* departure 2 */}
        <td className="px-4 py-3 min-w-0">
          <Input
            type="time"
            step="60"
            value={entry?.pmDeparture || ""}
            onChange={(e) =>
              handleInputChange(date, "pmDeparture", e.target.value)
            }
            disabled={isWeekendDay}
            className={isWeekendDay ? disabledInputClass : baseInputClass}
            style={{ colorScheme: "dark light" }}
          />
        </td>

        {/* overtime hours */}
        <td className="px-4 py-3 min-w-0">
          <Input
            type="number"
            min={0}
            max={23}
            value={entry?.overtimeHours ?? ""}
            onChange={(e) =>
              handleInputChange(
                date,
                "overtimeHours",
                parseInt(e.target.value) || 0
              )
            }
            disabled={isWeekendDay}
            placeholder="0"
            className={isWeekendDay ? disabledInputClass : baseInputClass}
          />
        </td>

        {/* overtime minutes */}
        <td className="px-4 py-3 min-w-0">
          <Input
            type="number"
            min={0}
            max={59}
            value={entry?.overtimeMinutes ?? ""}
            onChange={(e) =>
              handleInputChange(
                date,
                "overtimeMinutes",
                parseInt(e.target.value) || 0
              )
            }
            disabled={isWeekendDay}
            placeholder="0"
            className={isWeekendDay ? disabledInputClass : baseInputClass}
          />
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(year, month);

  // Render single day view by default
  if (viewMode === "day") {
    return renderSingleDayView();
  }

  // Render month view (original table/card view)
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
      {/* View Mode Header */}
      <div className="bg-gray-50 dark:bg-neutral-900/60 px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            All Days -{" "}
            {new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode("day")}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Day View
          </Button>
        </div>
      </div>

      {/* desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
          <thead className="bg-gray-50 dark:bg-neutral-900/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                A.M. Arrival
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                A.M. Departure
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                P.M. Arrival
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                P.M. Departure
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                OT Hours
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                OT Minutes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = formatDate(year, month, day);
              const dayOfWeek = getDayOfWeek(year, month, day);
              const dateObj = new Date(year, month - 1, day);
              const isWeekendDay = isWeekend(dateObj);
              const entry = entries[date];

              return (
                <tr
                  key={date}
                  className={`border-b border-gray-200 dark:border-neutral-800 ${
                    isWeekendDay
                      ? "bg-gray-50 dark:bg-neutral-900/50"
                      : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-900/80"
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{day}</span>
                      <span className="text-xs text-muted-foreground">
                        {dayOfWeek}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 min-w-0">
                    <Input
                      type="time"
                      step="60"
                      value={entry?.amArrival || ""}
                      onChange={(e) =>
                        handleInputChange(date, "amArrival", e.target.value)
                      }
                      disabled={isWeekendDay}
                      className={
                        isWeekendDay ? disabledInputClass : baseInputClass
                      }
                      style={{ colorScheme: "dark light" }}
                    />
                  </td>
                  <td className="px-4 py-3 min-w-0">
                    <Input
                      type="time"
                      step="60"
                      value={entry?.amDeparture || ""}
                      onChange={(e) =>
                        handleInputChange(date, "amDeparture", e.target.value)
                      }
                      disabled={isWeekendDay}
                      className={
                        isWeekendDay ? disabledInputClass : baseInputClass
                      }
                      style={{ colorScheme: "dark light" }}
                    />
                  </td>
                  <td className="px-4 py-3 min-w-0">
                    <Input
                      type="time"
                      step="60"
                      value={entry?.pmArrival || ""}
                      onChange={(e) =>
                        handleInputChange(date, "pmArrival", e.target.value)
                      }
                      disabled={isWeekendDay}
                      className={
                        isWeekendDay ? disabledInputClass : baseInputClass
                      }
                      style={{ colorScheme: "dark light" }}
                    />
                  </td>
                  <td className="px-4 py-3 min-w-0">
                    <Input
                      type="time"
                      step="60"
                      value={entry?.pmDeparture || ""}
                      onChange={(e) =>
                        handleInputChange(date, "pmDeparture", e.target.value)
                      }
                      disabled={isWeekendDay}
                      className={
                        isWeekendDay ? disabledInputClass : baseInputClass
                      }
                      style={{ colorScheme: "dark light" }}
                    />
                  </td>
                  <td className="px-4 py-3 min-w-0">
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={entry?.overtimeHours ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          date,
                          "overtimeHours",
                          parseInt(e.target.value) || 0
                        )
                      }
                      disabled={isWeekendDay}
                      placeholder="0"
                      className={
                        isWeekendDay ? disabledInputClass : baseInputClass
                      }
                    />
                  </td>
                  <td className="px-4 py-3 min-w-0">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={entry?.overtimeMinutes ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          date,
                          "overtimeMinutes",
                          parseInt(e.target.value) || 0
                        )
                      }
                      disabled={isWeekendDay}
                      placeholder="0"
                      className={
                        isWeekendDay ? disabledInputClass : baseInputClass
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDay(day);
                          setViewMode("day");
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        Edit
                      </Button>
                      {!isWeekendDay && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearDay(date)}
                          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* mobile card view with clear controls */}
      <div className="md:hidden">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = formatDate(year, month, day);
          const dayOfWeek = getDayOfWeek(year, month, day);
          const dateObj = new Date(year, month - 1, day);
          const isWeekendDay = isWeekend(dateObj);
          const entry = entries[date];

          return (
            <div
              key={date}
              className={`p-4 border-b border-gray-200 dark:border-neutral-800 ${
                isWeekendDay
                  ? "bg-gray-50 dark:bg-neutral-900/50"
                  : "bg-white dark:bg-neutral-900"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {day}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {dayOfWeek}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDay(day);
                      setViewMode("day");
                    }}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative min-w-0">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                    A.M. Arrival
                  </label>
                  <Input
                    type="time"
                    step="60"
                    value={entry?.amArrival || ""}
                    onChange={(e) =>
                      handleInputChange(date, "amArrival", e.target.value)
                    }
                    disabled={isWeekendDay}
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                    style={{ colorScheme: "dark light" }}
                  />
                  {!isWeekendDay && entry?.amArrival && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "amArrival")}
                      className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md "
                      aria-label="Clear Arrival 1"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative min-w-0">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                    A.M. Departure
                  </label>
                  <Input
                    type="time"
                    step="60"
                    value={entry?.amDeparture || ""}
                    onChange={(e) =>
                      handleInputChange(date, "amDeparture", e.target.value)
                    }
                    disabled={isWeekendDay}
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                    style={{ colorScheme: "dark light" }}
                  />
                  {!isWeekendDay && entry?.amDeparture && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "amDeparture")}
                      className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md "
                      aria-label="Clear Departure 1"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative min-w-0">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                    P.M. Arrival
                  </label>
                  <Input
                    type="time"
                    step="60"
                    value={entry?.pmArrival || ""}
                    onChange={(e) =>
                      handleInputChange(date, "pmArrival", e.target.value)
                    }
                    disabled={isWeekendDay}
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                    style={{ colorScheme: "dark light" }}
                  />
                  {!isWeekendDay && entry?.pmArrival && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "pmArrival")}
                      className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md "
                      aria-label="Clear Arrival 2"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative min-w-0">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                    P.M. Departure
                  </label>
                  <Input
                    type="time"
                    step="60"
                    value={entry?.pmDeparture || ""}
                    onChange={(e) =>
                      handleInputChange(date, "pmDeparture", e.target.value)
                    }
                    disabled={isWeekendDay}
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                    style={{ colorScheme: "dark light" }}
                  />
                  {!isWeekendDay && entry?.pmDeparture && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "pmDeparture")}
                      className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md"
                      aria-label="Clear Departure 2"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative min-w-0">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                    Overtime Hours
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={entry?.overtimeHours ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        date,
                        "overtimeHours",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={isWeekendDay}
                    placeholder="0"
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                  />
                  {!isWeekendDay && (entry?.overtimeHours ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "overtimeHours")}
                      className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md "
                      aria-label="Clear OT Hours"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative min-w-0">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                    Overtime Minutes
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={59}
                    value={entry?.overtimeMinutes ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        date,
                        "overtimeMinutes",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={isWeekendDay}
                    placeholder="0"
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                  />
                  {!isWeekendDay && (entry?.overtimeMinutes ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "overtimeMinutes")}
                      className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md "
                      aria-label="Clear OT Minutes"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
