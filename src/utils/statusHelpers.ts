/**
 * Centralized Booking Status Management
 * 
 * This utility provides consistent status handling across the entire application.
 * All status-related logic should use these constants and helpers.
 */

export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled'
} as const;

export type BookingStatus = typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES];

/**
 * Portuguese labels for each status
 */
export const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  no_show: 'Falta',
  rescheduled: 'Reagendada'
};

/**
 * Tailwind CSS classes for status badges
 * Using semantic tokens from the design system
 */
export const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  confirmed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  completed: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800',
  cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  no_show: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  rescheduled: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
};

/**
 * Get the Portuguese label for a booking status
 */
export const getStatusLabel = (status: string): string => {
  return statusLabels[status as BookingStatus] || status;
};

/**
 * Get Tailwind CSS classes for a status badge
 */
export const getStatusColor = (status: string): string => {
  return statusColors[status as BookingStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Check if a booking can be cancelled
 */
export const canCancelBooking = (status: BookingStatus): boolean => {
  return status === BOOKING_STATUSES.PENDING || status === BOOKING_STATUSES.CONFIRMED;
};

/**
 * Check if a booking can be rescheduled
 */
export const canRescheduleBooking = (status: BookingStatus): boolean => {
  return status === BOOKING_STATUSES.PENDING || status === BOOKING_STATUSES.CONFIRMED;
};

/**
 * Check if a booking can be rated
 */
export const canRateBooking = (status: BookingStatus): boolean => {
  return status === BOOKING_STATUSES.COMPLETED;
};

/**
 * Get all active statuses (not cancelled or no-show)
 */
export const getActiveStatuses = (): BookingStatus[] => {
  return [
    BOOKING_STATUSES.PENDING,
    BOOKING_STATUSES.CONFIRMED,
    BOOKING_STATUSES.IN_PROGRESS
  ];
};

/**
 * Get all completed statuses
 */
export const getCompletedStatuses = (): BookingStatus[] => {
  return [
    BOOKING_STATUSES.COMPLETED,
    BOOKING_STATUSES.CANCELLED,
    BOOKING_STATUSES.NO_SHOW
  ];
};
