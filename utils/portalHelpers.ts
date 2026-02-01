/**
 * Shared helper functions for the Client Portal.
 * Standardizes status colors and labels.
 */

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'in_progress':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'review':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Zakończony';
    case 'in_progress':
      return 'W trakcie';
    case 'review':
      return 'Do akceptacji';
    default:
      return 'Oczekujący';
  }
};
