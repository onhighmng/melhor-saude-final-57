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

/**
 * Pillar utility functions - centralized pillar styling
 */
export type PillarType = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance' | string;

export const getPillarColors = (pillar: PillarType) => {
  const normalized = pillar.toLowerCase();
  
  if (normalized.includes('mental') || normalized.includes('saude_mental')) {
    return {
      bg: 'bg-pillar-mental-light',
      bgSolid: 'bg-pillar-mental',
      text: 'text-pillar-mental-dark',
      textLight: 'text-pillar-mental',
      border: 'border-pillar-mental',
      hsl: 'hsl(var(--pillar-mental))',
      hslLight: 'hsl(var(--pillar-mental-light))',
    };
  }
  
  if (normalized.includes('physical') || normalized.includes('bem_estar') || normalized.includes('fisico')) {
    return {
      bg: 'bg-pillar-physical-light',
      bgSolid: 'bg-pillar-physical',
      text: 'text-pillar-physical-dark',
      textLight: 'text-pillar-physical',
      border: 'border-pillar-physical',
      hsl: 'hsl(var(--pillar-physical))',
      hslLight: 'hsl(var(--pillar-physical-light))',
    };
  }
  
  if (normalized.includes('financial') || normalized.includes('financeira')) {
    return {
      bg: 'bg-pillar-financial-light',
      bgSolid: 'bg-pillar-financial',
      text: 'text-pillar-financial-dark',
      textLight: 'text-pillar-financial',
      border: 'border-pillar-financial',
      hsl: 'hsl(var(--pillar-financial))',
      hslLight: 'hsl(var(--pillar-financial-light))',
    };
  }
  
  if (normalized.includes('legal') || normalized.includes('juridica') || normalized.includes('judiciary')) {
    return {
      bg: 'bg-pillar-legal-light',
      bgSolid: 'bg-pillar-legal',
      text: 'text-pillar-legal-dark',
      textLight: 'text-pillar-legal',
      border: 'border-pillar-legal',
      hsl: 'hsl(var(--pillar-legal))',
      hslLight: 'hsl(var(--pillar-legal-light))',
    };
  }
  
  // Default fallback
  return {
    bg: 'bg-slate-grey',
    bgSolid: 'bg-gray-500',
    text: 'text-gray-700',
    textLight: 'text-gray-600',
    border: 'border-gray-300',
    hsl: 'hsl(220 13% 91%)',
    hslLight: 'hsl(220 13% 96%)',
  };
};