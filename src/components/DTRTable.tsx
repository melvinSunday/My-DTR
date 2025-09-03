"use client";

import { useState, useEffect } from "react";
import { DTREntry, saveDTREntry, getDTREntriesForMonth } from "@/lib/db";
import {
  isWeekend,
  formatDate,
  getDaysInMonth,
  getDayOfWeek,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DTRTableProps {
  year: number;
  month: number;
}

export default function DTRTable({ year, month }: DTRTableProps) {
  const [entries, setEntries] = useState<Record<string, DTREntry>>({});
  const [loading, setLoading] = useState(true);

  // modern input styles centralized
  const baseInputClass =
    "bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-xs";
  const disabledInputClass =
    "bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-neutral-800 shadow-none";

  useEffect(() => {
    loadEntries();
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
    } catch (error) {
      console.error("Error saving entry:", error);
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
    } catch (error) {
      console.error("Error clearing day:", error);
    }
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
        <td className="px-4 py-3">
          <Input
            type="time"
            value={entry?.amArrival || ""}
            onChange={(e) =>
              handleInputChange(date, "amArrival", e.target.value)
            }
            disabled={isWeekendDay}
            className={isWeekendDay ? disabledInputClass : baseInputClass}
          />
        </td>

        {/* departure 1 */}
        <td className="px-4 py-3">
          <Input
            type="time"
            value={entry?.amDeparture || ""}
            onChange={(e) =>
              handleInputChange(date, "amDeparture", e.target.value)
            }
            disabled={isWeekendDay}
            className={isWeekendDay ? disabledInputClass : baseInputClass}
          />
        </td>

        {/* arrival 2 */}
        <td className="px-4 py-3">
          <Input
            type="time"
            value={entry?.pmArrival || ""}
            onChange={(e) =>
              handleInputChange(date, "pmArrival", e.target.value)
            }
            disabled={isWeekendDay}
            className={isWeekendDay ? disabledInputClass : baseInputClass}
          />
        </td>

        {/* departure 2 */}
        <td className="px-4 py-3">
          <Input
            type="time"
            value={entry?.pmDeparture || ""}
            onChange={(e) =>
              handleInputChange(date, "pmDeparture", e.target.value)
            }
            disabled={isWeekendDay}
            className={isWeekendDay ? disabledInputClass : baseInputClass}
          />
        </td>

        {/* overtime hours */}
        <td className="px-4 py-3">
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
        <td className="px-4 py-3">
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

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
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
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
            {Array.from({ length: daysInMonth }, (_, i) => renderDayRow(i + 1))}
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
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {day}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dayOfWeek}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    A.M. Arrival
                  </label>
                  <Input
                    type="time"
                    value={entry?.amArrival || ""}
                    onChange={(e) =>
                      handleInputChange(date, "amArrival", e.target.value)
                    }
                    disabled={isWeekendDay}
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                  />
                  {!isWeekendDay && entry?.amArrival && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "amArrival")}
                      className="absolute right-1.5 top-7 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300"
                      aria-label="Clear Arrival 1"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    A.M. Departure
                  </label>
                  <Input
                    type="time"
                    value={entry?.amDeparture || ""}
                    onChange={(e) =>
                      handleInputChange(date, "amDeparture", e.target.value)
                    }
                    disabled={isWeekendDay}
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                  />
                  {!isWeekendDay && entry?.amDeparture && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "amDeparture")}
                      className="absolute right-1.5 top-[1.6rem] inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300"
                      aria-label="Clear Departure 1"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    P.M. Arrival
                  </label>
                  <Input
                    type="time"
                    value={entry?.pmArrival || ""}
                    onChange={(e) =>
                      handleInputChange(date, "pmArrival", e.target.value)
                    }
                    disabled={isWeekendDay}
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                  />
                  {!isWeekendDay && entry?.pmArrival && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "pmArrival")}
                      className="absolute right-1.5 top-7 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300"
                      aria-label="Clear Arrival 2"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    P.M. Departure
                  </label>
                  <Input
                    type="time"
                    value={entry?.pmDeparture || ""}
                    onChange={(e) =>
                      handleInputChange(date, "pmDeparture", e.target.value)
                    }
                    disabled={isWeekendDay}
                    className={
                      isWeekendDay ? disabledInputClass : baseInputClass
                    }
                  />
                  {!isWeekendDay && entry?.pmDeparture && (
                    <button
                      type="button"
                      onClick={() => clearField(date, "pmDeparture")}
                      className="absolute right-1.5 top-7 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300"
                      aria-label="Clear Departure 2"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="absolute right-1.5 top-7 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300"
                      aria-label="Clear OT Hours"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="absolute right-1.5 top-7 inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300"
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
