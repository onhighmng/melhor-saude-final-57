
import React from 'react';
import { useTranslation } from 'react-i18next';

interface BenefitsSectionProps {
  membershipType: string;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ membershipType }) => {
  const { t } = useTranslation('common');
  
  return (
    <div className="w-full max-w-5xl mx-auto text-center">
      {membershipType === 'individual' ? (
        <>
          {/* All plans include section */}
          <div className="mb-8 p-6 bg-green-50 rounded-2xl border border-green-100">
            <h4 className="font-semibold text-xl text-green-900 mb-4">{t('pricing.benefits.allPlans.title')}</h4>
            <p className="text-green-800 text-lg leading-relaxed">
              {t('pricing.benefits.allPlans.description')}
            </p>
          </div>

          {/* Additional benefits for quarterly and annual */}
          <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100">
            <h4 className="font-semibold text-xl text-orange-900 mb-4">{t('pricing.benefits.quarterlyAnnual.title')}</h4>
            <p className="text-orange-800 text-lg leading-relaxed">
              {t('pricing.benefits.quarterlyAnnual.description')}
            </p>
          </div>

          {/* Annual plan exclusive benefits */}
          <div className="mb-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
            <h4 className="font-semibold text-xl text-yellow-900 mb-4">{t('pricing.benefits.annualPlan.title')}</h4>
            <p className="text-yellow-800 text-lg leading-relaxed">
              {t('pricing.benefits.annualPlan.description')}
            </p>
          </div>
        </>
      ) : (
        <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h4 className="font-semibold text-xl text-blue-900 mb-4">{t('pricing.benefits.enterprise.title')}</h4>
          <p className="text-blue-800 text-lg leading-relaxed">
            {t('pricing.benefits.enterprise.description')}
          </p>
        </div>
      )}
    </div>
  );
};

export default BenefitsSection;
