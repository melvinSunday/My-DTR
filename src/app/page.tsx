"use client";

import { useState, useEffect, useCallback } from "react";
import DTRHeader from "@/components/DTRHeader";
import { DTRTable } from "@/components/DTRTable";
import EarningsCard from "@/components/EarningsCard";
import { getCurrentMonth } from "@/lib/utils";
import { initDB } from "@/lib/db";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(() => getCurrentMonth());
  const [isInitialized, setIsInitialized] = useState(false);
  const [earningsRefreshTrigger, setEarningsRefreshTrigger] = useState(0);

  useEffect(() => {
    // initialize indexeddb when the app loads
    const initialize = async () => {
      try {
        await initDB();
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };

    initialize();
  }, []);

  const handleDateChange = useCallback((year: number, month: number) => {
    // update selected month/year
    setCurrentDate({ year, month });
  }, []);

  const handleDataCleared = useCallback(() => {
    // trigger refresh without changing keys to prevent scroll jump
    setEarningsRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleEntryChange = useCallback(() => {
    // trigger earnings refresh when time entries change
    setEarningsRefreshTrigger((prev) => prev + 1);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground">
            initializing application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <DTRHeader
          year={currentDate.year}
          month={currentDate.month}
          onDateChange={handleDateChange}
          onDataCleared={handleDataCleared}
        />

        <EarningsCard
          year={currentDate.year}
          month={currentDate.month}
          refreshTrigger={earningsRefreshTrigger}
        />

        <DTRTable
          year={currentDate.year}
          month={currentDate.month}
          onEntryChange={handleEntryChange}
        />
      </div>
    </div>
  );
}
