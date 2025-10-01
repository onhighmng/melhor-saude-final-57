import { supabase } from '@/integrations/supabase/client';

export interface ReportData {
  month: string;
  year: number;
  totalUsers: number;
  usersWithBookings: number;
  usersAttended: number;
  usersCompleted: number;
  consultationsByCategory: {
    [key: string]: { booked: number; attended: number; completed: number };
  };
  employeeAccessPercentage: number;
  totalCompanySize: number;
  detailedReports: Array<{
    userName: string;
    sessionType: string;
    professional: string;
    date: string;
    duration: number;
    status: string;
  }>;
}

class ReportService {
  async getMonthlyReport(month: number, year: number, companyName?: string): Promise<ReportData> {
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      // Get total users for company or all users
      let userQuery = supabase
        .from('profiles')
        .select('user_id, name, company')
        .eq('is_active', true);

      if (companyName) {
        userQuery = userQuery.eq('company', companyName);
      }

      const { data: users, error: usersError } = await userQuery;
      if (usersError) throw usersError;

      const userIds = users?.map(u => u.user_id) || [];
      const totalUsers = users?.length || 0;

      // Get bookings for the period
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          prestadores!inner(name, specialties)
        `)
        .in('user_id', userIds)
        .gte('booking_date', startDate.toISOString())
        .lt('booking_date', endDate.toISOString());

      if (bookingsError) throw bookingsError;

      // Get pillar specialties for categorization
      const { data: specialties } = await supabase
        .from('pillar_specialties')
        .select('*');

      const specialtyMap = specialties?.reduce((acc, spec) => {
        acc[spec.id] = spec.pillar_name.toLowerCase();
        return acc;
      }, {} as Record<string, string>) || {};

      // Calculate metrics
      const usersWithBookings = new Set(bookings?.map(b => b.user_id) || []).size;
      const usersAttended = new Set(
        bookings?.filter(b => ['confirmed', 'completed'].includes(b.status))
          .map(b => b.user_id) || []
      ).size;
      const usersCompleted = new Set(
        bookings?.filter(b => b.status === 'completed')
          .map(b => b.user_id) || []
      ).size;

      // Categorize consultations
      const consultationsByCategory: { [key: string]: { booked: number; attended: number; completed: number } } = {
        juridico: { booked: 0, attended: 0, completed: 0 },
        psicologico: { booked: 0, attended: 0, completed: 0 },
        financeiro: { booked: 0, attended: 0, completed: 0 },
        fisico: { booked: 0, attended: 0, completed: 0 }
      };

      bookings?.forEach(booking => {
        const pillar = booking.pillar_specialty_id 
          ? specialtyMap[booking.pillar_specialty_id] 
          : 'psicologico'; // default
        
        if (consultationsByCategory[pillar]) {
          consultationsByCategory[pillar].booked++;
          if (['confirmed', 'completed'].includes(booking.status)) {
            consultationsByCategory[pillar].attended++;
          }
          if (booking.status === 'completed') {
            consultationsByCategory[pillar].completed++;
          }
        }
      });

      // Get user names for detailed reports
      const userMap = users?.reduce((acc, user) => {
        acc[user.user_id] = user.name;
        return acc;
      }, {} as Record<string, string>) || {};

      // Create detailed reports
      const detailedReports = bookings?.map(booking => ({
        userName: userMap[booking.user_id] || 'Unknown',
        sessionType: booking.session_type || 'individual',
        professional: booking.prestadores?.name || 'Unknown',
        date: booking.booking_date,
        duration: booking.duration || 60,
        status: booking.status
      })) || [];

      // Calculate employee access percentage
      const employeeAccessPercentage = totalUsers > 0 
        ? Math.round((usersWithBookings / totalUsers) * 100)
        : 0;

      return {
        month: new Date(year, month).toLocaleDateString('pt-PT', { month: 'long' }),
        year,
        totalUsers,
        usersWithBookings,
        usersAttended,
        usersCompleted,
        consultationsByCategory,
        employeeAccessPercentage,
        totalCompanySize: totalUsers,
        detailedReports
      };
    } catch (error) {
      console.error('Error generating monthly report:', error);
      return {
        month: new Date(year, month).toLocaleDateString('pt-PT', { month: 'long' }),
        year,
        totalUsers: 0,
        usersWithBookings: 0,
        usersAttended: 0,
        usersCompleted: 0,
        consultationsByCategory: {
          juridico: { booked: 0, attended: 0, completed: 0 },
          psicologico: { booked: 0, attended: 0, completed: 0 },
          financeiro: { booked: 0, attended: 0, completed: 0 },
          fisico: { booked: 0, attended: 0, completed: 0 }
        },
        employeeAccessPercentage: 0,
        totalCompanySize: 0,
        detailedReports: []
      };
    }
  }

  async getCompanyReport(companyName: string, month: number, year: number): Promise<ReportData> {
    return this.getMonthlyReport(month, year, companyName);
  }
}

export const reportService = new ReportService();