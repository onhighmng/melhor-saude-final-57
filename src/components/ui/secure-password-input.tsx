import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { validatePasswordStrength } from '@/utils/passwordValidation';
import { getErrorMessage } from '@/utils/errorMessages';
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useState } from 'react';

interface PasswordStrengthValidatorProps {
  password: string;
  onValidationChange: (isValid: boolean, issues: string[]) => void;
  showStrength?: boolean;
}

export const PasswordStrengthValidator: React.FC<PasswordStrengthValidatorProps> = ({
  password,
  onValidationChange,
  showStrength = true
}) => {
  const [validation, setValidation] = useState<{ valid: boolean; issues: string[] }>({
    valid: false,
    issues: []
  });

  React.useEffect(() => {
    const result = validatePasswordStrength(password);
    setValidation(result);
    onValidationChange(result.valid, result.issues);
  }, [password, onValidationChange]);

  if (!showStrength || !password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        {validation.valid ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
        <span className={`text-sm font-medium ${
          validation.valid ? 'text-green-600' : 'text-red-600'
        }`}>
          {validation.valid ? 'Palavra-passe forte' : 'Palavra-passe fraca'}
        </span>
      </div>
      
      {validation.issues.length > 0 && (
        <ul className="text-xs text-red-600 space-y-1">
          {validation.issues.map((issue, index) => (
            <li key={index} className="flex items-start gap-1">
              <span className="text-red-500 mt-1">•</span>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showStrength?: boolean;
  onValidationChange?: (isValid: boolean, issues: string[]) => void;
  className?: string;
}

export const SecurePasswordInput: React.FC<SecurePasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Digite sua palavra-passe",
  required = false,
  showStrength = true,
  onValidationChange,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);

  const handleValidationChange = (isValid: boolean, issues: string[]) => {
    setIsValidPassword(isValid);
    onValidationChange?.(isValid, issues);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`pr-10 ${className}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      
      {showStrength && onValidationChange && (
        <PasswordStrengthValidator
          password={value}
          onValidationChange={handleValidationChange}
          showStrength={showStrength}
        />
      )}
    </div>
  );
};

// Hook for password validation in forms
export const usePasswordValidation = () => {
  const { toast } = useToast();

  const validateAndShowErrors = async (password: string): Promise<boolean> => {
    try {
      const result = validatePasswordStrength(password);
      
      if (!result.valid) {
        toast({
          title: "Palavra-passe fraca",
          description: result.issues.join('. '),
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      toast({
        title: "Erro de validação",
        description: getErrorMessage(error),
        variant: "destructive"
      });
      return false;
    }
  };

  return { validateAndShowErrors };
};

export default SecurePasswordInput;