import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to check if email should get HR role based on company contact email
export async function checkForHRRole(email: string) {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data: company, error } = await supabase
      .from('company_organizations')
      .select('company_name')
      .eq('contact_email', email)
      .eq('is_active', true)
      .maybeSingle();
    
    if (!error && company) {
      return {
        role: 'hr' as const,
        company: company.company_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error checking for HR role:', error);
    return null;
  }
}
