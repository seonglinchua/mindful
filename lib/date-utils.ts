/**
 * Number of segments expected in an ISO date string (YYYY-MM-DD)
 */
const ISO_DATE_SEGMENTS = 3;

/**
 * Converts an ISO date string to a UTC Date object
 * @param isoDate - ISO date string in format YYYY-MM-DD
 * @returns Date object representing the date at midnight UTC
 * @internal
 */
const toUTCDate = (isoDate: string) => {
  const parts = isoDate.split("-").map((segment) => Number.parseInt(segment, 10));

  if (parts.length !== ISO_DATE_SEGMENTS || parts.some(Number.isNaN)) {
    return new Date(isoDate);
  }

  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Returns the current date as an ISO date string (YYYY-MM-DD)
 * Uses the local timezone of the user's system
 * @returns ISO date string for today's date
 * @example
 * todayKey() // "2024-01-15"
 */
export const todayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Formats an ISO date string for display in the UI
 * @param isoDate - ISO date string in format YYYY-MM-DD
 * @returns Formatted date string (e.g., "Jan 15")
 * @example
 * formatDisplayDate("2024-01-15") // "Jan 15"
 * formatDisplayDate("2024-12-25") // "Dec 25"
 */
export const formatDisplayDate = (isoDate: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(toUTCDate(isoDate));
};
