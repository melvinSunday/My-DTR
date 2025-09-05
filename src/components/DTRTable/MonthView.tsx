import { DTREntry } from "@/lib/db";
import { formatDate, getDayOfWeek, isWeekend } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, List } from "lucide-react";
import DayRow from "./DayRow";
import { TABLE_HEADERS } from "./constants";

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
            onClick={onViewDay}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Day View
          </Button>
        </div>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
          <thead className="bg-gray-50 dark:bg-neutral-900/60">
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = formatDate(year, month, day);
              const entry = entries[date];

              return (
                <DayRow
                  key={date}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = formatDate(year, month, day);
          const entry = entries[date];

          return (
            <DayRow
              key={date}
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
          );
        })}
      </div>
    </div>
  );
}
