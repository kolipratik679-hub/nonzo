/**
 * Standardized timezone utilities for NONZO.
 *
 * Strategy:
 *  - MySQL/MariaDB stores datetime values exactly as the JS Date UTC fields.
 *  - To store Asia/Kolkata (IST) wall-clock time in the database, getISTDate()
 *    returns a Date whose UTC fields equal the current IST digits.
 *  - Display formatters receive these IST-digits-as-UTC dates and format
 *    with timeZone UTC to show the correct IST wall-clock value without
 *    a double-offset shift.
 *  - No hardcoded offsets (+5:30). IST parts are always derived via
 *    Intl.DateTimeFormat with timeZone "Asia/Kolkata".
 */

export interface ISTParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Gets date parts for the current moment in Asia/Kolkata (IST) timezone.
 */
export function getISTParts(date: Date = new Date()): ISTParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const partValues: Record<string, string> = {};
  parts.forEach((p) => {
    partValues[p.type] = p.value;
  });
  return {
    year: parseInt(partValues.year),
    month: parseInt(partValues.month),
    day: parseInt(partValues.day),
    hour: parseInt(partValues.hour) % 24,
    minute: parseInt(partValues.minute),
    second: parseInt(partValues.second),
  };
}

/**
 * Returns a Date object whose UTC fields represent the current
 * Asia/Kolkata (IST) wall-clock time.
 *
 * This is the correct value to pass to Prisma for datetime fields because
 * MariaDB/MySQL stores datetime values as-is (no timezone conversion).
 * Storing IST-as-UTC ensures the database contains the local Indian time.
 */
export function getISTDate(): Date {
  const p = getISTParts(new Date());
  return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second));
}

/**
 * Formats a IST-digits-stored-as-UTC date to a readable IST string.
 * Uses timeZone UTC intentionally to avoid double-shifting.
 */
export function formatToIST(date: Date | string | number | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/**
 * Formats a IST-digits-stored-as-UTC date to a date-only IST string.
 * Uses timeZone UTC intentionally to avoid double-shifting.
 */
export function formatToISTDate(date: Date | string | number | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
