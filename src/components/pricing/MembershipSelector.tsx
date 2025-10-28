
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MembershipSelectorProps {
  membershipType: string;
  onMembershipChange: (type: string) => void;
}

const MembershipSelector: React.FC<MembershipSelectorProps> = ({
  membershipType,
  onMembershipChange
}) => {
  const { t } = useTranslation('common');
  
  return (
    <div className="flex flex-row items-center gap-5">
      <button
        onClick={() => onMembershipChange('individual')}
        className={`flex flex-col items-center justify-center w-[12.5rem] px-6 py-2 rounded-[20px] border transition-all duration-300 cursor-pointer ${
          membershipType === 'individual' 
            ? 'bg-black text-white border-black' 
            : 'bg-white text-black border-black'
        }`}
      >
        <div className="font-semibold text-base leading-[22px] tracking-[-0.064px]">{t('pricing.selector.individual.title')}</div>
        <div className="text-xs leading-[13.8px] tracking-[-0.048px]">{t('pricing.selector.individual.subtitle')}</div>
      </button>
      <button
        onClick={() => onMembershipChange('empresarial')}
        className={`flex flex-col items-center justify-center w-[12.5rem] px-6 py-2 rounded-[20px] border transition-all duration-300 cursor-pointer ${
          membershipType === 'empresarial' 
            ? 'bg-black text-white border-black' 
            : 'bg-white text-black border-black'
        }`}
      >
        <div className="font-semibold text-base leading-[22px] tracking-[-0.064px]">{t('pricing.selector.enterprise.title')}</div>
        <div className="text-xs leading-[13.8px] tracking-[-0.048px]">{t('pricing.selector.enterprise.subtitle')}</div>
      </button>
    </div>
  );
};

export default MembershipSelector;
