import React, { useEffect, useState } from 'react';

const ServiceCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/lovable-uploads/6a595d34-53fe-41f3-9b79-e8d07a80e269.png',
      caption: 'Saúde Mental – Confiança e equilíbrio para a mente.'
    },
    {
      image: '/lovable-uploads/5d2071d4-8909-4e5f-b30d-cf52091ffba9.png',
      caption: 'Assistência Jurídica – Segurança e clareza em cada decisão.'
    },
    {
      image: '/lovable-uploads/8e051ede-f5b9-47a0-a9a1-53e8db6bf84f.png',
      caption: 'Assistência Financeira – Estabilidade e crescimento financeiro.'
    },
    {
      image: '/lovable-uploads/706fc722-1075-467c-bac9-f33982fdd983.png',
      caption: 'Saúde Física – Vitalidade e bem-estar em movimento.'
    },
    {
      image: '/lovable-uploads/f954ff01-4855-429e-8cee-a15e7a3cd2d1.png',
      caption: 'Swing Executive Golf Experience – Onde performance e bem-estar se encontram.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // 4 seconds per slide

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative w-full h-screen overflow-hidden font-modern">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-[3000ms] ease-out ${
            index === currentSlide
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
        >
          <div
            className="w-full h-full bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url('${slide.image}')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-12">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white leading-tight font-medium mb-2 sm:mb-3 md:mb-4">
                  <span 
                    className="inline-block"
                    style={{
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {slide.caption}
                  </span>
                </h2>
                {index === 4 && (
                  <a 
                    href="https://executive-golf-experience.lovable.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-black px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg min-h-[44px] flex items-center justify-center"
                    style={{
                      textShadow: 'none'
                    }}
                  >
                    Saber Mais
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Progress indicators */}
      <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-1.5 md:space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 min-h-[8px] min-w-[8px] ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default ServiceCarousel;