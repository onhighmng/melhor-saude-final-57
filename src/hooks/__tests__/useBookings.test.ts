import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBookings } from '../useBookings';
import { supabase } from '@/integrations/supabase/client';
import { mockBookings, mockBookingsList } from '@/test/fixtures/bookings';
import { mockUsers } from '@/test/fixtures/users';

// Mock useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: mockUsers.user.id },
    isLoading: false,
  }),
}));

describe('useBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetch Bookings', () => {
    it('should fetch bookings successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockBookingsList,
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allBookings).toHaveLength(3);
      expect(result.current.allBookings[0].id).toBe(mockBookings.upcoming.id);
    });

    it('should handle fetch errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allBookings).toEqual([]);
    });

    it('should return empty array when no user is logged in', async () => {
      // Override the mock for this test
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          user: null,
          isLoading: false,
        }),
      }));

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allBookings).toEqual([]);
    });
  });

  describe('Filter Upcoming Bookings', () => {
    it('should filter upcoming bookings correctly', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockBookingsList,
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Only upcoming and pending bookings should be in upcomingBookings
      expect(result.current.upcomingBookings.length).toBeGreaterThanOrEqual(1);
      
      // All upcoming bookings should have future dates
      result.current.upcomingBookings.forEach((booking) => {
        const bookingDate = new Date(booking.date!);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        expect(bookingDate >= now).toBe(true);
      });
    });

    it('should not include completed bookings in upcoming', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockBookings.completed, mockBookings.upcoming],
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const completedInUpcoming = result.current.upcomingBookings.find(
        (b) => b.status === 'completed'
      );
      expect(completedInUpcoming).toBeUndefined();
    });
  });

  describe('Booking Stats', () => {
    it('should calculate booking stats correctly', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockBookingsList,
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bookingStats.totalBookings).toBe(3);
      expect(result.current.bookingStats.completedBookings).toBe(1);
    });

    it('should identify next appointment correctly', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [mockBookings.upcoming, mockBookings.pending],
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.bookingStats.nextAppointment).toBeDefined();
    });
  });

  describe('Real-time Updates', () => {
    it('should set up real-time subscription', async () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
      };

      vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockBookingsList,
          error: null,
        }),
      } as any);

      renderHook(() => useBookings());

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith(
          expect.stringContaining('booking-updates-for-')
        );
      });

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'bookings',
        }),
        expect.any(Function)
      );
    });
  });

  describe('Utility Functions', () => {
    it('should format pillar names correctly', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.formatPillarName('saude_mental')).toBe('Saúde Mental');
      expect(result.current.formatPillarName('bem_estar_fisico')).toBe('Bem-Estar Físico');
      expect(result.current.formatPillarName('assistencia_financeira')).toBe('Assistência Financeira');
      expect(result.current.formatPillarName('assistencia_juridica')).toBe('Assistência Jurídica');
    });

    it('should calculate time until appointment correctly', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const timeUntil = result.current.getTimeUntilAppointment(futureDateString);
      expect(timeUntil).toContain('dia');
    });
  });

  describe('Refetch', () => {
    it('should refetch bookings when called', async () => {
      const orderMock = vi.fn().mockResolvedValue({
        data: mockBookingsList,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: orderMock,
      } as any);

      const { result } = renderHook(() => useBookings());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCount = orderMock.mock.calls.length;

      await result.current.refetch();

      await waitFor(() => {
        expect(orderMock).toHaveBeenCalledTimes(callCount + 1);
      });
    });
  });
});

