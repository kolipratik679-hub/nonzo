/**
 * Standardized timezone utilities for NONZO.
 * Stores UTC internally, and converts to Asia/Kolkata for display/relativity.
 */

// Return standard UTC date internally for database operations.
export function getISTDate(): Date {
  return new Date();
}

export interface ISTParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Gets date parts formatted to Asia/Kolkata (IST) timezone.
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
    hour: parseInt(partValues.hour),
    minute: parseInt(partValues.minute),
    second: parseInt(partValues.second),
  };
}

/**
 * Formats standard UTC date to Asia/Kolkata (IST) string.
 */
export function formatToIST(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
}

