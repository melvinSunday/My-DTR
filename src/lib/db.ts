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

interface DTRDatabase extends DBSchema {
  dtrEntries: {
    key: number;
    value: DTREntry;
    indexes: { "by-date": string };
  };
}

let dbInstance: IDBPDatabase<DTRDatabase> | null = null;

export async function initDB(): Promise<IDBPDatabase<DTRDatabase>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<DTRDatabase>("DTRDatabase", 1, {
    upgrade(db) {
      const store = db.createObjectStore("dtrEntries", {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("by-date", "date", { unique: true });
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
