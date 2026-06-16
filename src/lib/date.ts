/**
 * Utility to get the current time adjusted to Asia/Kolkata (IST, UTC+5:30).
 * Since Prisma/MySQL store and read Date objects in UTC, we adjust the time
 * offset so that the stored values reflect IST time directly.
 */
export function getISTDate(): Date {
  const utcDate = new Date();
  // IST is UTC + 5.5 hours (5.5 * 60 * 60 * 1000 ms)
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(utcDate.getTime() + istOffset);
}
