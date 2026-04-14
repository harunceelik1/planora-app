export const formatSprintDate = (date?: string | null) => {
  if (!date) return null;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};
