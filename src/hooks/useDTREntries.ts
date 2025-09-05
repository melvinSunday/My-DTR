import { useState, useEffect, useCallback } from "react";
import { DTREntry, saveDTREntry, getDTREntriesForMonth } from "@/lib/db";
import { queueOfflineAction } from "@/lib/offline-sync";
import { isWeekend } from "@/lib/utils";

interface UseDTREntriesProps {
  year: number;
  month: number;
  onEntryChange?: () => void;
}

export function useDTREntries({
  year,
  month,
  onEntryChange,
}: UseDTREntriesProps) {
  const [entries, setEntries] = useState<Record<string, DTREntry>>({});
  const [loading, setLoading] = useState(true);

  // memoize the load function to prevent unnecessary re-creations
  const loadEntries = useCallback(async () => {
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
  }, [year, month]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // shared function to update entry and save to database
  const updateEntry = useCallback(
    (date: string, field: keyof DTREntry, value: string | number) => {
      const dateObj = new Date(date);
      const isWeekendDay = isWeekend(dateObj);

      if (isWeekendDay) return; // prevent editing on weekends

      setEntries((prev) => {
        const currentEntry = prev[date] || {
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

        // save to indexeddb asynchronously
        saveDTREntry(updatedEntry)
          .then(() => {
            // Queue for offline sync if needed
            if (!navigator.onLine) {
              queueOfflineAction("save", updatedEntry);
            }
            // Notify parent component about the change
            onEntryChange?.();
          })
          .catch((error) => {
            console.error("Error saving entry:", error);
            // Always queue if save fails (could be offline)
            queueOfflineAction("save", updatedEntry);
          });

        return {
          ...prev,
          [date]: updatedEntry,
        };
      });
    },
    [onEntryChange]
  );

  const handleInputChange = useCallback(
    (date: string, field: keyof DTREntry, value: string | number) => {
      updateEntry(date, field, value);
    },
    [updateEntry]
  );

  const clearField = useCallback(
    (
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
      updateEntry(date, field as keyof DTREntry, newValue as any);
    },
    [updateEntry]
  );

  const clearDay = useCallback(
    (date: string) => {
      // reset all fields for a date
      const dateObj = new Date(date);
      if (isWeekend(dateObj)) return;

      // clear all fields one by one using the shared updateEntry function
      updateEntry(date, "amArrival", "");
      updateEntry(date, "amDeparture", "");
      updateEntry(date, "pmArrival", "");
      updateEntry(date, "pmDeparture", "");
      updateEntry(date, "overtimeHours", 0);
      updateEntry(date, "overtimeMinutes", 0);
    },
    [updateEntry]
  );

  return {
    entries,
    loading,
    loadEntries,
    handleInputChange,
    clearField,
    clearDay,
  };
}
