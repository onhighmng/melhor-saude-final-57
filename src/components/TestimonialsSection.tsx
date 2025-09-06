
import React, { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import VideoModal from './guides/VideoModal';
import TestimonialsHeader from './testimonials/TestimonialsHeader';
import TestimonialsGrid from './testimonials/TestimonialsGrid';
import TestimonialsDisclaimer from './testimonials/TestimonialsDisclaimer';

const TestimonialsSection = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation(0.1);
  const [selectedVideo, setSelectedVideo] = useState<{ src: string; name: string } | null>(null);

  const testimonials = [];

  const handleTestimonialClick = (testimonial: typeof testimonials[0]) => {
    setSelectedVideo({ src: testimonial.fullVideo, name: testimonial.name });
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <section 
        ref={sectionRef}
        className={`relative z-10 bg-soft-white transition-all duration-1000 pt-40 ${
          isSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="pb-1 md:pb-2 lg:pb-3">
            <TestimonialsHeader />
            <TestimonialsGrid 
              testimonials={testimonials} 
              onTestimonialClick={handleTestimonialClick} 
            />
            <TestimonialsDisclaimer />
          </div>
        </div>
      </section>

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={closeModal}
        videoSrc={selectedVideo?.src || ''}
        guideName={selectedVideo?.name || ''}
      />
    </>
  );
};

export default TestimonialsSection;
