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

interface DTRTableProps {
  year: number;
  month: number;
}

export default function DTRTable({ year, month }: DTRTableProps) {
  const [entries, setEntries] = useState<Record<string, DTREntry>>({});
  const [loading, setLoading] = useState(true);

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

        {/* a.m. arrival */}
        <td className="px-4 py-3">
          <Input
            type="time"
            value={entry?.amArrival || ""}
            onChange={(e) =>
              handleInputChange(date, "amArrival", e.target.value)
            }
            disabled={isWeekendDay}
            className={
              isWeekendDay ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }
          />
        </td>

        {/* a.m. departure */}
        <td className="px-4 py-3">
          <Input
            type="time"
            value={entry?.amDeparture || ""}
            onChange={(e) =>
              handleInputChange(date, "amDeparture", e.target.value)
            }
            disabled={isWeekendDay}
            className={
              isWeekendDay ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }
          />
        </td>

        {/* p.m. arrival */}
        <td className="px-4 py-3">
          <Input
            type="time"
            value={entry?.pmArrival || ""}
            onChange={(e) =>
              handleInputChange(date, "pmArrival", e.target.value)
            }
            disabled={isWeekendDay}
            className={
              isWeekendDay ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }
          />
        </td>

        {/* p.m. departure */}
        <td className="px-4 py-3">
          <Input
            type="time"
            value={entry?.pmDeparture || ""}
            onChange={(e) =>
              handleInputChange(date, "pmDeparture", e.target.value)
            }
            disabled={isWeekendDay}
            className={
              isWeekendDay ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }
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
            className={
              isWeekendDay ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }
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
            className={
              isWeekendDay ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
            }
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

      {/* mobile card view */}
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
                {isWeekendDay && (
                  <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-full">
                    Weekend
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
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
                      isWeekendDay
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  />
                </div>

                <div>
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
                      isWeekendDay
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  />
                </div>

                <div>
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
                      isWeekendDay
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  />
                </div>

                <div>
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
                      isWeekendDay
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  />
                </div>

                <div>
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
                      isWeekendDay
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  />
                </div>

                <div>
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
                      isWeekendDay
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
