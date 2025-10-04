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
      question: t('faq.questions.whatIs.question'),
      answer: (
        <div>
          <p>{t('faq.questions.whatIs.intro')}</p>
          <br />
          <p><strong>1.</strong> {t('faq.questions.whatIs.mental')}</p>
          <br />
          <p><strong>2.</strong> {t('faq.questions.whatIs.physical')}</p>
          <br />
          <p><strong>3.</strong> {t('faq.questions.whatIs.financial')}</p>
          <br />
          <p><strong>4.</strong> {t('faq.questions.whatIs.legal')}</p>
        </div>
      )
    },
    {
      question: t('faq.questions.howToBook.question'),
      answer: t('faq.questions.howToBook.answer')
    },
    {
      question: t('faq.questions.sessionsQuota.question'),
      answer: t('faq.questions.sessionsQuota.answer')
    },
    {
      question: t('faq.questions.individualPlans.question'),
      answer: (
        <div>
          <p>{t('faq.questions.individualPlans.intro')}</p>
          <br />
          <p><strong>{t('faq.questions.individualPlans.monthly')}</strong></p>
          <p><strong>{t('faq.questions.individualPlans.quarterly')}</strong></p>
          <p><strong>{t('faq.questions.individualPlans.annual')}</strong></p>
          <br />
          <p>{t('faq.questions.individualPlans.access')}</p>
        </div>
      )
    },
    {
      question: t('faq.questions.businessPlans.question'),
      answer: (
        <div>
          <p>{t('faq.questions.businessPlans.intro')}</p>
          <br />
          <p><strong>{t('faq.questions.businessPlans.small')}</strong></p>
          <p><strong>{t('faq.questions.businessPlans.large')}</strong></p>
          <br />
          <p>{t('faq.questions.businessPlans.contact')}</p>
        </div>
      )
    },
    {
      question: t('faq.questions.selfHelp.question'),
      answer: t('faq.questions.selfHelp.answer')
    },
    {
      question: t('faq.questions.providers.question'),
      answer: t('faq.questions.providers.answer')
    },
    {
      question: t('faq.questions.confidentiality.question'),
      answer: t('faq.questions.confidentiality.answer')
    },
    {
      question: t('faq.questions.sessionTypes.question'),
      answer: t('faq.questions.sessionTypes.answer')
    },
    {
      question: t('faq.questions.cancelReschedule.question'),
      answer: t('faq.questions.cancelReschedule.answer')
    },
    {
      question: t('faq.questions.extraServices.question'),
      answer: t('faq.questions.extraServices.answer')
    },
    {
      question: t('faq.questions.getStarted.question'),
      answer: t('faq.questions.getStarted.answer')
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
