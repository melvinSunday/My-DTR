import { DTREntry } from "@/lib/db";
import { formatDate, getDayOfWeek, isWeekend } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Calendar, ChevronLeft, ChevronRight, List } from "lucide-react";
import TimeInput from "./TimeInput";
import { SESSION_LABELS, FIELD_LABELS } from "./constants";

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
                  onClick={onPreviousDay}
                  disabled={selectedDay <= 1}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNextDay}
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

              {isCurrentMonth && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToday}
                  className="text-xs whitespace-nowrap"
                >
                  Go to Today
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAllDays}
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
                  {SESSION_LABELS.morning}
                </h3>

                <TimeInput
                  value={entry?.amArrival || ""}
                  onChange={(value) => onInputChange(date, "amArrival", value)}
                  onClear={() => onClearField(date, "amArrival")}
                  label={FIELD_LABELS.amArrival}
                  type="time"
                  step="60"
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
                />
              </div>

              {/* Afternoon Session */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  {SESSION_LABELS.afternoon}
                </h3>

                <TimeInput
                  value={entry?.pmArrival || ""}
                  onChange={(value) => onInputChange(date, "pmArrival", value)}
                  onClear={() => onClearField(date, "pmArrival")}
                  label={FIELD_LABELS.pmArrival}
                  type="time"
                  step="60"
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
                />
              </div>
            </div>

            {/* Overtime Section */}
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                {SESSION_LABELS.overtime}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TimeInput
                  value={entry?.overtimeHours?.toString() || ""}
                  onChange={(value) =>
                    onInputChange(date, "overtimeHours", parseInt(value) || 0)
                  }
                  onClear={() => onClearField(date, "overtimeHours")}
                  label={FIELD_LABELS.overtimeHours}
                  type="number"
                  min={0}
                  max={23}
                  placeholder="0"
                />

                <TimeInput
                  value={entry?.overtimeMinutes?.toString() || ""}
                  onChange={(value) =>
                    onInputChange(date, "overtimeMinutes", parseInt(value) || 0)
                  }
                  onClear={() => onClearField(date, "overtimeMinutes")}
                  label={FIELD_LABELS.overtimeMinutes}
                  type="number"
                  min={0}
                  max={59}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Clear Day Button */}
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-6">
              <Button
                variant="outline"
                onClick={() => onClearDay(date)}
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
}
