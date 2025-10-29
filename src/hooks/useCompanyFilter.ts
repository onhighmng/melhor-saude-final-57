import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyFilter = () => {
  const { profile, isEspecialistaGeral } = useAuth();
  const [assignedCompanies, setAssignedCompanies] = useState<string[]>([]);

  useEffect(() => {
    const fetchAssignedCompanies = async () => {
      if (isEspecialistaGeral && profile?.id) {
        const { data } = await supabase
          .from('specialist_assignments')
          .select('company_id')
          .eq('specialist_id', profile.id)
          .eq('is_active', true);
        
        setAssignedCompanies(data?.map(a => a.company_id) || []);
      }
    };
    fetchAssignedCompanies();
  }, [isEspecialistaGeral, profile?.id]);

  const getAllowedCompanies = () => {
    if (isEspecialistaGeral) {
      return assignedCompanies;
    }
    
    if (profile?.role === 'hr') {
      // HR only sees their own company
      return profile.company_id ? [profile.company_id] : [];
    }
    
    if (profile?.role === 'admin') {
      // Admin sees all companies (we'll return empty array to indicate no filtering)
      return [];
    }
    
    // Regular users see no companies in admin context
    return [];
  };

  const filterByCompanyAccess = <T extends { company_id?: string; company?: string }>(items: T[]): T[] => {
    const allowedCompanies = getAllowedCompanies();
    
    // If admin or no restrictions, return all items
    if (allowedCompanies.length === 0 && profile?.role === 'admin') {
      return items;
    }
    
    // Filter items based on allowed companies
    return items.filter(item => {
      // Check both company_id and company fields for compatibility
      const itemCompany = item.company_id || item.company;
      return allowedCompanies.includes(itemCompany || '');
    });
  };

  const canAccessCompany = (companyId: string): boolean => {
    const allowedCompanies = getAllowedCompanies();
    
    // Admin can access all companies
    if (profile?.role === 'admin' && allowedCompanies.length === 0) {
      return true;
    }
    
    return allowedCompanies.includes(companyId);
  };

  return {
    allowedCompanies: getAllowedCompanies(),
    filterByCompanyAccess,
    canAccessCompany,
    isAdmin: profile?.role === 'admin',
    isEspecialistaGeral,
    isHR: profile?.role === 'hr'
  };
};
