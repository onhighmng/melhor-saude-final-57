import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface UseProviderAvailabilityReturn {
  availableSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch real availability for a provider on a specific date
 * Checks both existing bookings and blocked dates from prestadores table
 */
export const useProviderAvailability = (
  providerId: string | null,
  selectedDate: Date | undefined
): UseProviderAvailabilityReturn => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId || !selectedDate) {
      // Generate default slots when no date/provider selected
      const defaultSlots = generateDefaultTimeSlots();
      setAvailableSlots(defaultSlots);
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      try {
        const dateStr = selectedDate.toISOString().split('T')[0];

        // Fetch existing bookings for this provider on this date
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('start_time, end_time')
          .eq('prestador_id', providerId)
          .eq('date', dateStr)
          .in('status', ['pending', 'confirmed', 'scheduled']);

        if (bookingsError) throw bookingsError;

        // Fetch blocked dates for this provider
        const { data: prestador, error: prestadorError } = await supabase
          .from('prestadores')
          .select('blocked_dates')
          .eq('id', providerId)
          .single();

        if (prestadorError) {
          console.warn('Could not fetch prestador blocked dates:', prestadorError);
        }

        // Extract booked time slots
        const bookedTimes = new Set<string>();
        bookings?.forEach((booking) => {
          if (booking.start_time) {
            // Store time in HH:MM format
            const time = booking.start_time.substring(0, 5);
            bookedTimes.add(time);
          }
        });

        // Check blocked dates
        const blockedDates = prestador?.blocked_dates || [];
        const blockedTimesForDate = new Set<string>();
        
        if (Array.isArray(blockedDates)) {
          blockedDates.forEach((blockedSlot: any) => {
            if (blockedSlot.date === dateStr && Array.isArray(blockedSlot.times)) {
              blockedSlot.times.forEach((time: string) => {
                blockedTimesForDate.add(time);
              });
            }
          });
        }

        // Generate all possible time slots
        const allSlots = generateDefaultTimeSlots();
        
        // Mark slots as unavailable if booked or blocked
        const slotsWithAvailability = allSlots.map((slot) => ({
          time: slot.time,
          available: !bookedTimes.has(slot.time) && !blockedTimesForDate.has(slot.time)
        }));

        setAvailableSlots(slotsWithAvailability);
      } catch (err) {
        console.error('Error fetching provider availability:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch availability');
        // Fall back to default slots
        setAvailableSlots(generateDefaultTimeSlots());
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [providerId, selectedDate]);

  return { availableSlots, loading, error };
};

/**
 * Generate default time slots (8:00 AM - 5:00 PM, 30-minute intervals)
 */
function generateDefaultTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 17 && minute === 30) break; // Stop at 17:00
      
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({
        time: timeStr,
        available: true
      });
    }
  }
  
  return slots;
}

