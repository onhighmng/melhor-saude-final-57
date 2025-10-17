import { PillarsFrameLayout } from '@/components/ui/pillars-frame-layout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserBooking = () => {
  const navigate = useNavigate();

  const handleBackToHealth = () => {
    navigate('/');
  };

  const handlePillarSelect = (pillar: string) => {
    // Map each pillar to its corresponding assessment flow
    const pillarMapping = {
      'Saúde Mental': 'psicologica',
      'Bem-estar Físico': 'fisica', 
      'Assistência Financeira': 'financeira',
      'Assistência Jurídica': 'juridica'
    };
    
    const pillarKey = pillarMapping[pillar];
    if (pillarKey) {
      // Navigate to the existing booking flow with the selected pillar
      navigate(`/user/book-session?pillar=${pillarKey}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <button
            onClick={handleBackToHealth}
            className="flex items-center gap-2 text-gray-600 hover:text-navy-blue transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-medium">Voltar à Minha Saúde</span>
          </button>
        </div>
      </div>

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
              onPillarSelect={handlePillarSelect}
            />
          </div>

          {/* Instructions */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Clique na área que precisa de apoio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBooking;
