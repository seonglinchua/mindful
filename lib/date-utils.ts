export const todayKey = () => new Date().toISOString().slice(0, 10);

export const formatDisplayDate = (isoDate: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
};
