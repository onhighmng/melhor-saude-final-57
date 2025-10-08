import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock implementation for demo
export const lookupProvider = async (email: string) => {
  return null;
};

/**
 * Format time range using locale-aware formatting
 * @param start - Start time in HH:mm format
 * @param end - End time in HH:mm format
 * @returns Formatted time range based on current locale
 */
export function formatTimeRange(start: string, end: string): string {
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    // Use locale-aware time formatting
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return `${formatTime(start)} - ${formatTime(end)}`;
}