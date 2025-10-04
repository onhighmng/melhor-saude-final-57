import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const { t } = useTranslation();
  
  const faqData = [
    {
      question: "O que é a Melhor Saúde?",
      answer: (
        <div>
          <p>A Melhor Saúde é uma plataforma digital de bem-estar corporativo líder em Moçambique que oferece quatro pilares essenciais:</p>
          <br />
          <p><strong>1. Saúde mental:</strong> Sessões individuais com psicólogos certificados, apoio 24/7 e terapia de grupo especializada.</p>
          <br />
          <p><strong>2. Bem estar físico:</strong> Acesso a médicos e nutricionistas, planos alimentares personalizados e programas de exercício.</p>
          <br />
          <p><strong>3. Assistência financeira:</strong> Consultoria com especialistas certificados, elaboração de orçamentos e planeamento de investimentos.</p>
          <br />
          <p><strong>4. Assistência Jurídica:</strong> Consultoria com advogados especializados em direito da família, civil e do trabalho.</p>
        </div>
      )
    },
    {
      question: "Como funciona o agendamento de sessões?",
      answer: "O agendamento é simples: escolha um dos quatro pilares (Saúde mental, Bem estar físico, Assistência financeira ou Assistência Jurídica), e o sistema atribui automaticamente um prestador disponível especializado na área. Pode agendar sessões online ou presenciais através da nossa plataforma."
    },
    {
      question: "Quantas sessões tenho direito?",
      answer: "O número de sessões varia conforme o seu plano. Empresas recebem quotas mensais baseadas no número de colaboradores, enquanto utilizadores individuais têm planos mensais, trimestrais ou anuais. Pode verificar o seu saldo de sessões disponíveis na sua conta pessoal."
    },
    {
      question: "Quanto custam os planos individuais?",
      answer: (
        <div>
          <p>Oferecemos três opções de planos individuais:</p>
          <br />
          <p><strong>Mensal:</strong> MZN 7,599 por mês</p>
          <p><strong>Trimestral:</strong> MZN 6,649 por mês (MZN 19,947 a cada 3 meses) - Mais popular</p>
          <p><strong>Anual:</strong> MZN 6,019 por mês (MZN 72,228 por ano) - Melhor valor</p>
          <br />
          <p>Todos os planos incluem acesso completo aos quatro pilares de bem-estar.</p>
        </div>
      )
    },
    {
      question: "Há planos para empresas?",
      answer: (
        <div>
          <p>Sim, oferecemos soluções empresariais personalizadas:</p>
          <br />
          <p><strong>Equipas Pequenas:</strong> A partir de MZN 6,019 por utilizador/mês com descontos por volume.</p>
          <p><strong>Empresas Grandes:</strong> Preços personalizados com integração com RH, gestão centralizada e suporte dedicado.</p>
          <br />
          <p>Entre em contacto connosco para uma proposta personalizada para a sua empresa.</p>
        </div>
      )
    },
    {
      question: "Posso aceder a conteúdo de autoajuda?",
      answer: "Sim! A nossa plataforma inclui uma secção de Self-Help com artigos educativos organizados por categorias como gestão de stress, nutrição, exercício físico e bem-estar mental. Também oferecemos testes psicológicos para autoavaliação."
    },
    {
      question: "Que tipos de prestadores estão disponíveis?",
      answer: "Temos uma rede de prestadores certificados em cada pilar: psicólogos clínicos, médicos de família, nutricionistas, fisioterapeutas, consultores financeiros certificados, advogados especializados em direito da família, civil e do trabalho. Todos os prestadores são rigorosamente selecionados e certificados."
    },
    {
      question: "As consultas são confidenciais?",
      answer: "Absolutamente. Respeitamos a privacidade e dignidade de cada utilizador com o mais alto grau de sigilo profissional. Todas as sessões são confidenciais e os dados são protegidos conforme as melhores práticas de segurança. Nenhuma informação é partilhada com empregadores ou terceiros sem consentimento expresso."
    },
    {
      question: "Posso ter sessões presenciais ou são apenas online?",
      answer: "Oferecemos ambas as opções. Pode escolher entre sessões online (através de videochamada) ou presenciais, dependendo da disponibilidade do prestador e da sua localização. As sessões online proporcionam maior flexibilidade, enquanto as presenciais oferecem contacto directo."
    },
    {
      question: "Como posso cancelar ou alterar uma sessão agendada?",
      answer: "Pode gerir os seus agendamentos através da sua conta pessoal na plataforma. Para cancelar ou reagendar uma sessão, aceda ao seu histórico de agendamentos e selecione as opções disponíveis. Recomendamos pelo menos 24 horas de antecedência para alterações."
    },
    {
      question: "Há serviços extras disponíveis?",
      answer: "Sim, oferecemos serviços extras especializados além dos quatro pilares principais. Estes incluem workshops corporativos, avaliações de saúde ocupacional, programas de bem-estar personalizados e outros serviços complementares. Pode consultar e solicitar serviços extras através da plataforma."
    },
    {
      question: "Como posso começar a usar a plataforma?",
      answer: "É simples: registe-se na plataforma, escolha o seu plano (individual ou empresarial), complete o seu perfil e comece a agendar sessões. Novos utilizadores podem experimentar a plataforma e, se não estiverem satisfeitos, podem cancelar dentro do período de garantia."
    }
  ];

  return (
    <section 
      className="relative bg-background pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 lg:pb-20 scroll-mt-24"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <h3 className="text-center text-h1 mt-0 mb-8 sm:mb-12 lg:mb-16">
          {t('faq.title')}
        </h3>
        
        <div className="w-full max-w-6xl mx-auto px-0 sm:px-4 md:px-8 lg:px-16 relative">
          <div className="z-10 w-full max-w-4xl mx-auto relative">
            <Accordion type="single" collapsible className="flex flex-col gap-2 sm:gap-3">
              {faqData.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-[#F5F7FB] rounded-lg sm:rounded-xl border-none"
                >
                  <AccordionTrigger className="px-4 sm:px-6 lg:px-12 py-3 sm:py-4 lg:py-5 text-left text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-tight tracking-[-0.2px] hover:no-underline data-[state=open]:pb-3 sm:data-[state=open]:pb-4 lg:data-[state=open]:pb-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 sm:px-6 lg:px-12 pb-4 sm:pb-6 lg:pb-8 text-sm sm:text-base md:text-lg leading-relaxed tracking-[-0.072px]">
                    {typeof faq.answer === 'string' ? (
                      <p>{faq.answer}</p>
                    ) : (
                      faq.answer
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {/* Decorative images - hidden on mobile, positioned further from cards on larger screens */}
          <img 
            src="/lovable-uploads/95a2cef7-45be-4018-af8e-4a5caea3205b.png" 
            loading="lazy" 
            alt="Blue logo illustration" 
            className="hidden lg:block w-48 h-48 xl:w-64 xl:h-64 absolute top-20 -right-8 xl:right-0 transform rotate-[15deg] z-0 opacity-60"
          />
          <img 
            src="/lovable-uploads/95a2cef7-45be-4018-af8e-4a5caea3205b.png" 
            loading="lazy" 
            alt="Blue logo illustration" 
            className="hidden lg:block w-32 h-32 xl:h-48 absolute top-[480px] -right-8 xl:right-0 z-0 opacity-50"
          />
          <img 
            src="/lovable-uploads/95a2cef7-45be-4018-af8e-4a5caea3205b.png" 
            loading="lazy" 
            alt="Blue logo illustration" 
            className="hidden lg:block w-32 h-32 xl:h-48 absolute top-[400px] -left-8 xl:left-0 z-0 opacity-50"
          />
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
