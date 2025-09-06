import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useCompanyNotes = (companyName?: string) => {
  const [finalNotes, setFinalNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyNotes = async () => {
      if (!companyName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('company_organizations')
          .select('final_notes')
          .eq('company_name', companyName)
          .eq('is_active', true)
          .maybeSingle();

        if (queryError) {
          throw queryError;
        }

        setFinalNotes(data?.final_notes || null);
      } catch (err) {
        console.error('Error fetching company notes:', err);
        setError('Erro ao carregar observações da empresa');
        setFinalNotes(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyNotes();
  }, [companyName]);

  return { finalNotes, loading, error };
};