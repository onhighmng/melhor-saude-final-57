
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
            <h4 className="font-semibold text-xl text-green-900 mb-4">Todos os Planos Incluem</h4>
            <p className="text-green-800 text-lg leading-relaxed">
              Acesso completo às quatro áreas de apoio especializado
            </p>
          </div>

          {/* Additional benefits for quarterly and annual */}
          <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100">
            <h4 className="font-semibold text-xl text-orange-900 mb-4">Planos Trimestrais e Anuais</h4>
            <p className="text-orange-800 text-lg leading-relaxed">
              Benefícios exclusivos e suporte prioritário
            </p>
          </div>

          {/* Annual plan exclusive benefits */}
          <div className="mb-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
            <h4 className="font-semibold text-xl text-yellow-900 mb-4">Plano Anual Exclusivo</h4>
            <p className="text-yellow-800 text-lg leading-relaxed">
              Consultas mensais com especialista pessoal
            </p>
          </div>
        </>
      ) : (
        <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <h4 className="font-semibold text-xl text-blue-900 mb-4">Benefícios Empresariais</h4>
          <p className="text-blue-800 text-lg leading-relaxed">
            Gestão dedicada, relatórios e suporte personalizado para a sua empresa
          </p>
        </div>
      )}
    </div>
  );
};

export default BenefitsSection;
