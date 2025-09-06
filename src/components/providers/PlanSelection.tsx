
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SessionBalance } from '@/types/session';

interface PlanSelectionProps {
  sessionBalance: SessionBalance | null;
  selectedPlan: 'personal' | 'employer' | null;
  onPlanChange: (plan: 'personal' | 'employer') => void;
  loading?: boolean;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({
  sessionBalance,
  selectedPlan,
  onPlanChange,
  loading = false
}) => {
  if (loading || !sessionBalance) {
    return null;
  }

  const hasPersonalSessions = sessionBalance.personalRemaining > 0;
  const hasEmployerSessions = sessionBalance.employerRemaining > 0;

  // Don't show if no sessions available at all
  if (!hasPersonalSessions && !hasEmployerSessions) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-sky-blue/10 to-mint-green/10 rounded-xl border border-sky-blue/20">
      <h3 className="font-semibold text-lg text-navy-blue mb-4">Como deseja utilizar esta sessão?</h3>
      
      <RadioGroup
        value={selectedPlan || ''}
        onValueChange={(value) => onPlanChange(value as 'personal' | 'employer')}
        className="space-y-3"
      >
        {/* Personal Plan Option */}
        {sessionBalance.personalRemaining > 0 && (
          <div className="flex items-center space-x-3">
            <RadioGroupItem 
              value="personal" 
              id="personal"
              className="text-royal-blue border-royal-blue"
            />
            <label 
              htmlFor="personal" 
              className="flex-1 text-base text-navy-blue cursor-pointer hover:text-royal-blue transition-colors"
            >
              <span className="font-medium">Usar plano pessoal</span>
              <span className="ml-2 text-sm text-royal-blue">
                ({sessionBalance.personalRemaining} restantes)
              </span>
            </label>
          </div>
        )}

        {/* Employer Plan Option */}
        {sessionBalance.employerRemaining > 0 && (
          <div className="flex items-center space-x-3">
            <RadioGroupItem 
              value="employer" 
              id="employer"
              className="text-royal-blue border-royal-blue"
            />
            <label 
              htmlFor="employer" 
              className="flex-1 text-base text-navy-blue cursor-pointer hover:text-royal-blue transition-colors"
            >
              <span className="font-medium">Usar plano da empresa</span>
              <span className="ml-2 text-sm text-royal-blue">
                ({sessionBalance.employerRemaining} restantes)
              </span>
            </label>
          </div>
        )}
      </RadioGroup>

      {/* Disabled options with explanations */}
      <div className="mt-3 space-y-2">
        {sessionBalance.personalRemaining === 0 && (
          <div className="flex items-center space-x-3 opacity-50">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
            <span className="text-sm text-gray-500">
              Plano pessoal - Sem sessões disponíveis
            </span>
          </div>
        )}
        
        {sessionBalance.employerRemaining === 0 && (
          <div className="flex items-center space-x-3 opacity-50">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
            <span className="text-sm text-gray-500">
              Plano da empresa - Sem sessões disponíveis
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSelection;
