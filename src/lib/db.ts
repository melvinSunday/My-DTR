import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface DTREntry {
  id?: number;
  date: string; // YYYY-MM-DD format
  amArrival: string;
  amDeparture: string;
  pmArrival: string;
  pmDeparture: string;
  overtimeHours: number;
  overtimeMinutes: number;
  isWeekend: boolean;
}

export interface RateSettings {
  id?: number;
  dailyRate: number; // Rate per day in pesos
  updatedAt: string; // ISO date string
}

interface DTRDatabase extends DBSchema {
  dtrEntries: {
    key: number;
    value: DTREntry;
    indexes: { "by-date": string };
  };
  rateSettings: {
    key: number;
    value: RateSettings;
  };
}

let dbInstance: IDBPDatabase<DTRDatabase> | null = null;

export async function initDB(): Promise<IDBPDatabase<DTRDatabase>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<DTRDatabase>("DTRDatabase", 2, {
    upgrade(db, oldVersion) {
      // Create dtrEntries store if it doesn't exist
      if (!db.objectStoreNames.contains("dtrEntries")) {
        const store = db.createObjectStore("dtrEntries", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("by-date", "date", { unique: true });
      }

      // Create rateSettings store if it doesn't exist
      if (!db.objectStoreNames.contains("rateSettings")) {
        db.createObjectStore("rateSettings", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });

  return dbInstance;
}

export async function saveDTREntry(entry: Omit<DTREntry, "id">): Promise<void> {
  const db = await initDB();
  const tx = db.transaction("dtrEntries", "readwrite");

  // Check if entry already exists for this date
  const existingEntry = await tx.store.index("by-date").get(entry.date);

  if (existingEntry) {
    // Update existing entry
    await tx.store.put({ ...entry, id: existingEntry.id });
  } else {
    // Add new entry
    await tx.store.add(entry);
  }

  await tx.done;
}

export async function getDTREntry(date: string): Promise<DTREntry | undefined> {
  const db = await initDB();
  return await db.getFromIndex("dtrEntries", "by-date", date);
}

export async function getDTREntriesForMonth(
  year: number,
  month: number
): Promise<DTREntry[]> {
  const db = await initDB();
  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
  const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

  const allEntries = await db.getAll("dtrEntries");
  return allEntries.filter(
    (entry) => entry.date >= startDate && entry.date <= endDate
  );
}

export async function clearAllDTREntries(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction("dtrEntries", "readwrite");
  await tx.store.clear();
  await tx.done;
}

export async function saveRateSettings(rate: number): Promise<void> {
  const db = await initDB();
  const tx = db.transaction("rateSettings", "readwrite");

  // Clear existing rate settings and save new one
  await tx.store.clear();
  await tx.store.add({
    dailyRate: rate,
    updatedAt: new Date().toISOString(),
  });

  await tx.done;
}

export async function getRateSettings(): Promise<RateSettings | undefined> {
  const db = await initDB();
  const allRates = await db.getAll("rateSettings");
  return allRates[0]; // Get the latest rate setting
}

export function calculateWorkingHours(entry: DTREntry): number {
  // Convert time strings to minutes
  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Standard work schedule (can be adjusted)
  const standardAmStart = timeToMinutes("08:00"); // 8:00 AM
  const standardAmEnd = timeToMinutes("12:00"); // 12:00 PM
  const standardPmStart = timeToMinutes("13:00"); // 1:00 PM
  const standardPmEnd = timeToMinutes("17:00"); // 5:00 PM

  let totalMinutes = 0;

  // Calculate morning session if both times are present
  if (entry.amArrival && entry.amDeparture) {
    const amArrival = timeToMinutes(entry.amArrival);
    const amDeparture = timeToMinutes(entry.amDeparture);

    // Clamp arrival and departure to standard work hours
    // Early arrival (before 8:00 AM) doesn't increase earnings
    // Late arrival (after 8:00 AM) reduces working hours and earnings
    const effectiveArrival = Math.max(amArrival, standardAmStart);
    const effectiveDeparture = Math.min(amDeparture, standardAmEnd);

    const morningMinutes = effectiveDeparture - effectiveArrival;
    if (morningMinutes > 0) {
      totalMinutes += morningMinutes;
    }
  }

  // Calculate afternoon session if both times are present
  if (entry.pmArrival && entry.pmDeparture) {
    const pmArrival = timeToMinutes(entry.pmArrival);
    const pmDeparture = timeToMinutes(entry.pmDeparture);

    // Clamp arrival and departure to standard work hours
    // Late arrival (after 1:00 PM) reduces working hours and earnings
    // Early departure (before 5:00 PM) also reduces working hours and earnings
    const effectiveArrival = Math.max(pmArrival, standardPmStart);
    const effectiveDeparture = Math.min(pmDeparture, standardPmEnd);

    const afternoonMinutes = effectiveDeparture - effectiveArrival;
    if (afternoonMinutes > 0) {
      totalMinutes += afternoonMinutes;
    }
  }

  // Convert to hours
  return Math.max(0, totalMinutes / 60);
}

export function hasWorkingTime(entry: DTREntry): boolean {
  // Check if there's any meaningful time entry (even partial entries count as working days)
  return !!(
    entry.amArrival ||
    entry.amDeparture ||
    entry.pmArrival ||
    entry.pmDeparture
  );
}

export function isCompleteWorkDay(entry: DTREntry): boolean {
  // A complete work day has both AM and PM sessions
  return !!(
    entry.amArrival &&
    entry.amDeparture &&
    entry.pmArrival &&
    entry.pmDeparture
  );
}

export async function calculateMonthlyEarnings(
  year: number,
  month: number
): Promise<{
  totalEarnings: number;
  workingDays: number;
  completeDays: number;
  partialDays: number;
  totalHours: number;
  dailyRate: number;
}> {
  const entries = await getDTREntriesForMonth(year, month);
  const rateSettings = await getRateSettings();
  const dailyRate = rateSettings?.dailyRate || 0;

  let totalHours = 0;
  let workingDays = 0;
  let completeDays = 0;
  let partialDays = 0;
  let totalEarnings = 0;

  // Standard work day is 8 hours (8AM-12PM, 1PM-5PM)
  const standardWorkHours = 8;
  const hourlyRate = dailyRate / standardWorkHours;

  entries.forEach((entry) => {
    if (!entry.isWeekend && hasWorkingTime(entry)) {
      const hoursWorked = calculateWorkingHours(entry);
      totalHours += hoursWorked;
      workingDays++;

      // Always calculate earnings based on actual hours worked
      totalEarnings += hoursWorked * hourlyRate;

      if (isCompleteWorkDay(entry)) {
        completeDays++;
      } else {
        partialDays++;
      }
    }
  });

  return {
    totalEarnings,
    workingDays,
    completeDays,
    partialDays,
    totalHours,
    dailyRate,
  };
}

export async function exportDTRToCSV(
  year: number,
  month: number
): Promise<string> {
  const entries = await getDTREntriesForMonth(year, month);

  const headers = [
    "Date",
    "Day",
    "A.M. Arrival",
    "A.M. Departure",
    "P.M. Arrival",
    "P.M. Departure",
    "Overtime Hours",
    "Overtime Minutes",
  ];

  const csvRows = [headers.join(",")];

  // Generate all days for the month
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    const dayOfWeek = new Date(year, month - 1, day).toLocaleDateString(
      "en-US",
      { weekday: "long" }
    );

    const entry = entries.find((e) => e.date === date);

    const row = [
      date,
      dayOfWeek,
      entry?.amArrival || "",
      entry?.amDeparture || "",
      entry?.pmArrival || "",
      entry?.pmDeparture || "",
      entry?.overtimeHours?.toString() || "",
      entry?.overtimeMinutes?.toString() || "",
    ];

    csvRows.push(row.join(","));
  }

  return csvRows.join("\n");
}
