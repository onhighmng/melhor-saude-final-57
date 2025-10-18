import { PillarsFrameLayout } from '@/components/ui/pillars-frame-layout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserBooking = () => {
  const navigate = useNavigate();

  const handleBackToHealth = () => {
    navigate('/');
  };

  // This component should only show when there's no pillar parameter

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
      // Navigate to the assessment flow
      navigate(`/user/book?pillar=${pillarKey}`);
    }
  };

  return (
    <div 
      className="relative w-full min-h-screen flex flex-col"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1600 900\'%3E%3Cdefs%3E%3ClinearGradient id=\'blueGrad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23F0F9FF;stop-opacity:1\' /%3E%3Cstop offset=\'20%25\' style=\'stop-color:%23E0F2FE;stop-opacity:1\' /%3E%3Cstop offset=\'40%25\' style=\'stop-color:%23BAE6FD;stop-opacity:1\' /%3E%3Cstop offset=\'60%25\' style=\'stop-color:%237DD3FC;stop-opacity:1\' /%3E%3Cstop offset=\'80%25\' style=\'stop-color:%2338BDF8;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%230EA5E9;stop-opacity:1\' /%3E%3C/linearGradient%3E%3CradialGradient id=\'highlight\' cx=\'50%25\' cy=\'20%25\' r=\'60%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0.3\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23FFFFFF;stop-opacity:0\' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23blueGrad)\'/%3E%3Crect width=\'1600\' height=\'900\' fill=\'url(%23highlight)\'/%3E%3C/svg%3E")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Back Button */}
      <div className="relative z-10 flex-shrink-0 pt-4 pb-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <button
            onClick={handleBackToHealth}
            className="flex items-center gap-2 text-black hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-medium">Voltar à Minha Saúde</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
              Como podemos ajudar?
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-black max-w-3xl mx-auto">
              Selecione a área em que precisa de apoio
            </p>
          </div>
          
          {/* Interactive Frame Layout */}
          <div className="h-[500px] w-full mb-8">
            <PillarsFrameLayout 
              className="w-full h-full"
              hoverSize={8}
              gapSize={6}
              onPillarSelect={handlePillarSelect}
            />
          </div>

          {/* Instructions */}
          <div className="text-center pb-12">
            <p className="text-white text-base md:text-lg lg:text-xl font-medium">
              Clique na área que precisa de apoio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBooking;
