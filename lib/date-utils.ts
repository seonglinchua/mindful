const ISO_DATE_SEGMENTS = 3;

const toUTCDate = (isoDate: string) => {
  const parts = isoDate.split("-").map((segment) => Number.parseInt(segment, 10));

  if (parts.length !== ISO_DATE_SEGMENTS || parts.some(Number.isNaN)) {
    return new Date(isoDate);
  }

  const [year, month, day] = parts;
  return new Date(Date.UTC(year, month - 1, day));
};

export const todayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (isoDate: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(toUTCDate(isoDate));
};
