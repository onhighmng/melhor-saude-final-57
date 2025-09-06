
import React from 'react';

interface BenefitsSectionProps {
  membershipType: string;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ membershipType }) => {
  return (
    <div className="w-full max-w-5xl mx-auto text-center">
      {membershipType === 'individual' ? (
        <>
          {/* All plans include section */}
          <div className="mb-8 p-6 bg-green-50 rounded-2xl border border-green-100">
            <h4 className="font-semibold text-xl text-green-900 mb-4">Todos os planos incluem:</h4>
            <p className="text-green-800 text-lg leading-relaxed">
              Sessões ilimitadas com profissionais, acesso completo aos 4 pilares, agendamento seguro e suporte via chat.
            </p>
          </div>

          {/* Additional benefits for quarterly and annual */}
          <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100">
            <h4 className="font-semibold text-xl text-orange-900 mb-4">Planos Trimestral e Anual incluem:</h4>
            <p className="text-orange-800 text-lg leading-relaxed">
              Prioridade no agendamento e atendimento preferencial.
            </p>
          </div>

          {/* Annual plan exclusive benefits */}
          <div className="mb-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
            <h4 className="font-semibold text-xl text-yellow-900 mb-4">Plano Anual inclui:</h4>
            <p className="text-yellow-800 text-lg leading-relaxed">
              Suporte dedicado para empresas e famílias.
            </p>
          </div>
        </>
      ) : (
        <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h4 className="font-semibold text-xl text-blue-900 mb-4">Todos os planos empresariais incluem:</h4>
          <p className="text-blue-800 text-lg leading-relaxed">
            Acesso completo aos 4 pilares de bem-estar, sessões ilimitadas, relatórios de bem-estar e suporte dedicado.
          </p>
        </div>
      )}
    </div>
  );
};

export default BenefitsSection;
