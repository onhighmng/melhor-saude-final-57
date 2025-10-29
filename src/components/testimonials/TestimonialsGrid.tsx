import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Testimonial {
  name: string;
  quote: string;
  image: string;
  hoverVideo: string;
  fullVideo: string;
}

interface TestimonialsGridProps {
  testimonials: Testimonial[];
  onTestimonialClick: (testimonial: Testimonial) => void;
}

const TestimonialsGrid: React.FC<TestimonialsGridProps> = ({ testimonials, onTestimonialClick }) => {
  const { t } = useTranslation();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleMouseEnter = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.play();
    }
  };

  const handleMouseLeave = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div className="mb-3 md:mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index}
            className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => onTestimonialClick(testimonial)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            {/* Hover Tooltip */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-soft-white rounded-full px-2 py-1 shadow-lg">
                <span className="text-xs font-medium text-navy-blue">{t('testimonials.view')} {testimonial.name}</span>
              </div>
            </div>

            <div className="relative w-full h-full overflow-hidden rounded-xl text-white">
              <img
                alt={testimonial.name}
                loading="eager"
                src={testimonial.image}
                className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 group-hover:opacity-0"
              />
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                width="100%"
                height="100%"
                muted
                playsInline
                loop
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <source src={testimonial.hoverVideo} />
              </video>
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-20 flex flex-col justify-end p-2 md:p-3 h-1/2">
                <div className="mb-1">
                  <p className="text-xs md:text-sm font-medium leading-tight mb-1 text-white">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <span>{testimonial.name}</span>
                  <span>/ {t('testimonials.client')}</span>
                </div>
                
                {/* Play Button */}
                <div className="absolute bottom-2 right-2 z-30">
                  <div className="backdrop-blur-sm bg-white/20 rounded-full w-7 h-7 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="8" 
                      height="10" 
                      viewBox="0 0 13 14" 
                      fill="none"
                      className="text-white"
                    >
                      <path 
                        d="M2.71094 0.21875L11.7109 5.71875C12.1484 6 12.4297 6.5 12.4297 7C12.4297 7.53125 12.1484 8.03125 11.7109 8.28125L2.71094 13.7812C2.24219 14.0625 1.64844 14.0938 1.17969 13.8125C0.710938 13.5625 0.429688 13.0625 0.429688 12.5V1.5C0.429688 0.96875 0.710938 0.46875 1.17969 0.21875C1.64844 -0.0625 2.24219 -0.0625 2.71094 0.21875Z" 
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsGrid;
