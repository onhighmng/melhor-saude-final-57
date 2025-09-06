
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const MoneySystemSection = () => {
  const features = [
    {
      title: "Saúde Psicológica",
      description: "Sessões individuais com psicólogos certificados, atendimento em crises emocionais, aconselhamento sobre stress laboral e acesso a conteúdos sobre autocuidado e mindfulness.",
      image: "/lovable-uploads/8e2df1aa-a1c7-4f91-b724-fc348e3347ee.png"
    },
    {
      title: "Saúde Financeira",
      description: "Sessões com consultores financeiros, apoio na elaboração de orçamentos, orientação para reorganizar finanças e programas educativos sobre gestão de dinheiro.",
      image: "/lovable-uploads/922a13c5-6f7f-427b-8497-e5ca6c19e48e.png"
    },
    {
      title: "Saúde Física",
      description: "Acesso a médicos, nutricionistas e fisioterapeutas, avaliações de saúde ocupacional, planos alimentares personalizados e programas de exercício físico.",
      image: "/lovable-uploads/fad5a7e1-4fd0-4f9b-8151-d9c8b54fc079.png"
    },
    {
      title: "Saúde Jurídica e Social", 
      description: "Consultoria com advogados especializados, esclarecimento sobre contratos e direitos, acompanhamento preventivo e apoio na resolução de conflitos no trabalho.",
      image: "/lovable-uploads/f48e9a64-fcb0-4691-baa9-c6007ac1a750.png"
    }
  ];

  return (
    <section className="relative z-10 bg-soft-white py-20">
      <div className="w-full max-w-[1500px] mx-auto px-12">
        {/* Header Section */}
        <div className="flex flex-col justify-start items-center w-full max-w-[640px] mx-auto text-center mb-16">
          <h2 className="font-semibold text-[51.2px] leading-[56.32px] mt-0 mb-0 text-navy-blue">
            <div className="block text-center w-full">Os 4 Pilares</div>
            <div className="block text-center w-full">
              <span className="relative text-cool-grey">do Bem-Estar da Melhor Saúde</span>
            </div>
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square w-full overflow-hidden">
                <img 
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-8">
                <h3 className="font-semibold text-[32px] leading-[38px] mb-4 text-navy-blue">
                  {feature.title}
                </h3>
                <p className="text-lg leading-6 text-navy-blue">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoneySystemSection;
