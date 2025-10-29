import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CodeValidationResult, UserType } from '@/types/accessCodes';

export const useAccessCodeValidation = (code: string) => {
  const [result, setResult] = useState<CodeValidationResult>({
    isValid: false,
    isLoading: false,
    error: undefined
  });

  const validateCode = useCallback(async (codeToValidate: string) => {
    if (!codeToValidate || codeToValidate.length < 6) {
      setResult({
        isValid: false,
        isLoading: false,
        error: undefined
      });
      return;
    }

    setResult(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const { data, error } = await supabase.rpc('validate_access_code', {
        p_code: codeToValidate.toUpperCase()
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        setResult({
          isValid: false,
          isLoading: false,
          error: 'Código inválido ou expirado'
        });
        return;
      }

      const codeData = data[0];
      
      setResult({
        isValid: true,
        isLoading: false,
        userType: codeData.user_type as UserType,
        companyName: codeData.company_name,
        companyId: codeData.company_id,
        expiresAt: codeData.expires_at,
        error: undefined
      });
    } catch (err) {
      console.error('Error validating code:', err);
      setResult({
        isValid: false,
        isLoading: false,
        error: 'Erro ao validar código'
      });
    }
  }, []);

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      validateCode(code);
    }, 500);

    return () => clearTimeout(timer);
  }, [code, validateCode]);

  return result;
};
