"use client";

import { useState } from "react";
import { exportDTRToCSV, clearAllDTREntries } from "@/lib/db";
import { downloadCSV, getMonthName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DTRHeaderProps {
  year: number;
  month: number;
  onDateChange: (year: number, month: number) => void;
  onDataCleared: () => void;
}

export default function DTRHeader({
  year,
  month,
  onDateChange,
  onDataCleared,
}: DTRHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportCSV = async () => {
    // exporting current month to csv
    setIsExporting(true);
    try {
      const csvContent = await exportDTRToCSV(year, month);
      const filename = `DTR_${getMonthName(month)}_${year}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error exporting CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    // clearing all dtr data in indexeddb
    setIsClearing(true);
    try {
      await clearAllDTREntries();
      onDataCleared();
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Error clearing data. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleYearChange = (newYear: number) => {
    // updating selected year
    onDateChange(newYear, month);
  };

  const handleMonthChange = (newMonth: number) => {
    // updating selected month
    onDateChange(year, newMonth);
  };

  const generateYearOptions = () => {
    // generating year list around current year
    const currentYear = new Date().getFullYear();
    const years = [] as number[];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const generateMonthOptions = () => {
    // generating 12 months
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: getMonthName(i + 1),
    }));
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* title and date selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Daily Time Record
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              track your time entries per day, offline-first
            </p>
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            {/* month selector */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month
              </span>
              <Select
                value={String(month)}
                onValueChange={(val) => handleMonthChange(parseInt(val))}
              >
                <SelectTrigger className="min-w-[8rem]" size="sm">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* year selector */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </span>
              <Select
                value={String(year)}
                onValueChange={(val) => handleYearChange(parseInt(val))}
              >
                <SelectTrigger className="min-w-[6.5rem]" size="sm">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* export csv */}
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="w-full sm:w-auto bg-[#8FA31E] text-white"
          >
            {isExporting ? (
              <>
                {/* small spinner icon */}
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                {/* download icon */}
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </>
            )}
          </Button>

          {/* clear data with confirm */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-[#D76C82] text-white sm:w-auto"
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Clearing...
                  </>
                ) : (
                  <>
                    {/* trash icon */}
                    <svg
                      className="-ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Clear Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>clear all data</AlertDialogTitle>
                <AlertDialogDescription>
                  are you sure you want to clear all dtr data? this action
                  cannot be undone and will remove all entries from all months.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  disabled={isClearing}
                >
                  {isClearing ? "clearing..." : "clear all data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* current month display */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Viewing:{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {getMonthName(month)} {year}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          weekend days (saturday & sunday) are automatically disabled and
          highlighted.
        </p>
      </div>
    </div>
  );
}
