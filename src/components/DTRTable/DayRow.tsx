import { DTREntry } from "@/lib/db";
import { getDayOfWeek, formatDate, isWeekend } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { INPUT_STYLES, FIELD_LABELS } from "./constants";

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

  const inputClass = isWeekendDay ? INPUT_STYLES.disabled : INPUT_STYLES.base;

  if (isMobile) {
    return (
      <div
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
              onClick={() => onEditDay(day)}
              className="text-xs"
            >
              Edit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* A.M. Arrival */}
          <div className="relative min-w-0">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              {FIELD_LABELS.amArrival}
            </label>
            <Input
              type="time"
              step="60"
              value={entry?.amArrival || ""}
              onChange={(e) => onInputChange(date, "amArrival", e.target.value)}
              disabled={isWeekendDay}
              className={inputClass}
              style={{ colorScheme: "dark light" }}
            />
            {!isWeekendDay && entry?.amArrival && (
              <button
                type="button"
                onClick={() => onClearField(date, "amArrival")}
                className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md"
                aria-label="Clear A.M. Arrival"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* A.M. Departure */}
          <div className="relative min-w-0">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              {FIELD_LABELS.amDeparture}
            </label>
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
            {!isWeekendDay && entry?.amDeparture && (
              <button
                type="button"
                onClick={() => onClearField(date, "amDeparture")}
                className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md"
                aria-label="Clear A.M. Departure"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* P.M. Arrival */}
          <div className="relative min-w-0">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              {FIELD_LABELS.pmArrival}
            </label>
            <Input
              type="time"
              step="60"
              value={entry?.pmArrival || ""}
              onChange={(e) => onInputChange(date, "pmArrival", e.target.value)}
              disabled={isWeekendDay}
              className={inputClass}
              style={{ colorScheme: "dark light" }}
            />
            {!isWeekendDay && entry?.pmArrival && (
              <button
                type="button"
                onClick={() => onClearField(date, "pmArrival")}
                className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md"
                aria-label="Clear P.M. Arrival"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* P.M. Departure */}
          <div className="relative min-w-0">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
              {FIELD_LABELS.pmDeparture}
            </label>
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
            {!isWeekendDay && entry?.pmDeparture && (
              <button
                type="button"
                onClick={() => onClearField(date, "pmDeparture")}
                className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md"
                aria-label="Clear P.M. Departure"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Overtime Hours */}
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
            {!isWeekendDay && (entry?.overtimeHours ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => onClearField(date, "overtimeHours")}
                className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md"
                aria-label="Clear OT Hours"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Overtime Minutes */}
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
            {!isWeekendDay && (entry?.overtimeMinutes ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => onClearField(date, "overtimeMinutes")}
                className="absolute inset-y-0 right-2 mt-5 inline-flex h-6 w-6 items-center justify-center rounded-md"
                aria-label="Clear OT Minutes"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop table row
  return (
    <tr
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditDay(day)}
            className="h-8 px-2 text-xs"
          >
            Edit
          </Button>
          {!isWeekendDay && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClearDay(date)}
              className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Clear
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
