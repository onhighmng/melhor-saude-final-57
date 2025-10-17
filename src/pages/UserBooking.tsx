import BookingFlow from '@/components/booking/BookingFlow';
import { PillarsFrameLayout } from '@/components/ui/pillars-frame-layout';

const UserBooking = () => {
  return (
    <div className="min-h-screen">
      {/* Interactive Pillars Section */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy-blue mb-4">
              Como podemos ajudar?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Selecione a área em que precisa de apoio
            </p>
          </div>
          
          {/* Interactive Frame Layout */}
          <div className="h-[600px] w-full">
            <PillarsFrameLayout 
              className="w-full h-full"
              hoverSize={8}
              gapSize={6}
            />
          </div>

          {/* Instructions */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Passe o rato sobre cada área para saber mais
            </p>
          </div>
        </div>
      </div>
      
      <BookingFlow />
    </div>
  );
};

export default UserBooking;
