import React, { useState, useEffect } from 'react';
import ScrollAnimationProvider from './guides/ScrollAnimationProvider';
import MainGuidesSection from './guides/MainGuidesSection';

const GuidesSection = () => {
  const [guides] = useState([]);

  const [steps] = useState([
    {
      title: "Escolha o seu especialista",
      description: "Selecione entre os nossos profissionais qualificados nas áreas de psicologia, direito, finanças e fitness."
    },
    {
      title: "Agende uma consulta",
      description: "Marque uma sessão individual ou em grupo, presencial ou online, conforme a sua preferência."
    },
    {
      title: "Desenvolva o seu plano",
      description: "Trabalhe com o especialista para criar um plano personalizado de bem-estar integral."
    },
    {
      title: "Acompanhe o progresso",
      description: "Monitorize os seus resultados e ajuste o plano conforme necessário com apoio contínuo."
    }
  ]);

  return (
    <div data-section="guides">
      <ScrollAnimationProvider>
        <MainGuidesSection />
      </ScrollAnimationProvider>
    </div>
  );
};

export default GuidesSection;
