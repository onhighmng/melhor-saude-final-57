import React from 'react';

const TestimonialsHeader: React.FC = () => {
  return (
    <div className="flex flex-col justify-start items-center w-full max-w-3xl mx-auto text-center mb-2 md:mb-3">
      <div className="flex items-center gap-2 flex-col justify-start">
        <h3 className="font-semibold text-2xl md:text-3xl leading-tight mb-1 text-navy-blue mx-0 my-0 py-0 px-[17px] lg:text-4xl">
          Testemunhos
        </h3>
        <div className="max-w-lg w-full">
          <p className="text-base md:text-lg leading-relaxed text-navy-blue">
            Veja o que os nossos utilizadores dizem sobre o nosso serviço
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsHeader;
