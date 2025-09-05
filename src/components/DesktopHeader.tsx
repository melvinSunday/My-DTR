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
import { Download, Trash2, Calendar } from "lucide-react";

interface DesktopHeaderProps {
  year: number;
  month: number;
  onDateChange: (year: number, month: number) => void;
  onDataCleared: () => void;
}

export default function DesktopHeader({
  year,
  month,
  onDateChange,
  onDataCleared,
}: DesktopHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportCSV = async () => {
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
    onDateChange(newYear, month);
  };

  const handleMonthChange = (newMonth: number) => {
    onDateChange(year, newMonth);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [] as number[];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: getMonthName(i + 1),
    }));
  };

  return (
    <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 p-4 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
        {/* App Title and Current Period */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              My DTR
            </h1>
            <p className="text-sm text-muted-foreground">
              Daily Time Record Management
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Year:
            </label>
            <Select
              value={year.toString()}
              onValueChange={(value) => handleYearChange(parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateYearOptions().map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption.toString()}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Month:
            </label>
            <Select
              value={month.toString()}
              onValueChange={(value) => handleMonthChange(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((monthOption) => (
                  <SelectItem
                    key={monthOption.value}
                    value={monthOption.value.toString()}
                  >
                    {monthOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleExportCSV}
            disabled={isExporting}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Export CSV"}
            </span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                disabled={isClearing}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isClearing ? "Clearing..." : "Clear Data"}
                </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your DTR entries. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
