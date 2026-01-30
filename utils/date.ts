/**
 * Formats a date string to a localized Polish format.
 * @param dateString ISO date string or Date object
 * @returns formatted date (e.g., "30 stycznia 2026")
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'Brak daty';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Brak daty';

  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
