import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const FAQSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation(0.2);
  const faqData = [
    {
      question: "O que é o programa Melhor Saúde?",
      answer: (
        <div>
          <p>O Melhor Saúde é um programa completo de bem-estar que oferece acesso a especialistas em quatro pilares fundamentais:</p>
          <br />
          <p><strong>1.</strong> Saúde Mental - Psicólogos e terapeutas para apoio emocional e mental</p>
          <br />
          <p><strong>2.</strong> Bem-estar Físico - Nutricionistas e personal trainers para saúde física</p>
          <br />
          <p><strong>3.</strong> Assistência Financeira - Consultores financeiros para gestão do dinheiro</p>
          <br />
          <p><strong>4.</strong> Assistência Jurídica - Advogados para questões legais</p>
        </div>
      )
    },
    {
      question: "Como posso agendar uma sessão?",
      answer: "É muito simples! Faça login na sua conta, escolha o tipo de especialista que precisa, selecione um horário disponível e confirme o agendamento. Receberá um email de confirmação com todos os detalhes."
    },
    {
      question: "Quantas sessões posso ter por mês?",
      answer: "O número de sessões depende do seu plano. Os planos básicos incluem 2-4 sessões por mês, enquanto os planos premium oferecem sessões ilimitadas. Pode consultar os detalhes do seu plano na área pessoal."
    },
    {
      question: "Posso ter planos individuais?",
      answer: (
        <div>
          <p>Sim! Oferecemos planos individuais flexíveis:</p>
          <br />
          <p><strong>Plano Mensal</strong> - Ideal para experimentar os serviços</p>
          <p><strong>Plano Trimestral</strong> - Melhor valor para uso regular</p>
          <p><strong>Plano Anual</strong> - Máxima poupança para compromisso a longo prazo</p>
          <br />
          <p>Os planos individuais dão acesso completo a todos os especialistas e recursos da plataforma.</p>
        </div>
      )
    },
    {
      question: "Os especialistas são certificados?",
      answer: "Sim, todos os nossos especialistas são certificados e licenciados nas suas áreas de atuação. Passam por um processo rigoroso de verificação antes de se juntarem à nossa rede."
    },
    {
      question: "Posso cancelar ou reagendar uma sessão?",
      answer: "Sim, pode cancelar ou reagendar sessões até 24 horas antes do horário agendado através da sua área pessoal. Cancelamentos em cima da hora podem estar sujeitos a políticas específicas."
    },
    {
      question: "Como funciona a confidencialidade?",
      answer: "Todas as sessões são 100% confidenciais. Os nossos especialistas seguem rigorosos códigos de ética profissional e nunca partilham informações pessoais sem o seu consentimento explícito."
    },
    {
      question: "Que tipo de tecnologia utilizam?",
      answer: "Utilizamos tecnologia de ponta para garantir sessões de alta qualidade. As videochamadas são encriptadas, a plataforma é compatível com todos os dispositivos e oferecemos gravações de sessões (com consentimento) para revisão posterior."
    },
    {
      question: "Posso aceder à plataforma no telemóvel?",
      answer: "Sim! A nossa plataforma é totalmente responsiva e funciona perfeitamente em smartphones, tablets e computadores. Também pode descarregar a nossa aplicação móvel para acesso ainda mais conveniente."
    },
    {
      question: "Como posso contactar o suporte?",
      answer: "O nosso suporte está disponível 24/7 através de chat ao vivo na plataforma, email (suporte@melhorsaude.pt) ou telefone. Temos uma equipa dedicada pronta para ajudar com qualquer questão."
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas às questões mais comuns sobre o nosso programa de bem-estar
          </p>
        </div>

        <div className={`max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className={`text-center mt-12 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-muted-foreground mb-4">
            Não encontrou a resposta que procura?
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Contactar Suporte
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;