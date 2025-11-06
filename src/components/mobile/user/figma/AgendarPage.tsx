import { ArrowLeft } from 'lucide-react';

// Pillar images
const mentalHealthImg = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop';
const fitnessImg = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop';
const financeImg = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop';
const legalImg = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop';

type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

interface AgendarPageProps {
  onBack: () => void;
  onSelectPillar: (pillar: Pillar) => void;
}

export function AgendarPage({ onBack, onSelectPillar }: AgendarPageProps) {
  return (
    <div className="min-h-screen bg-blue-200 pb-20">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar à Minha Saúde
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2">Como podemos ajudar?</h1>
          <p className="text-gray-700">Selecione a área em que precisa de apoio</p>
        </div>

        {/* Grid of Pillars */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Saúde Mental - Blue */}
          <button 
            onClick={() => onSelectPillar('mental-health')}
            className="relative overflow-hidden bg-blue-300 rounded-3xl active:scale-95 transition-transform shadow-sm"
          >
            <div className="relative h-[200px]">
              <img
                src={mentalHealthImg}
                alt="Saúde Mental"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-600/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                <div className="text-white text-2xl leading-tight" style={{ fontFamily: "'Magiel Lotto', sans-serif" }}>
                  <div>Saúde</div>
                  <div>Mental</div>
                </div>
              </div>
            </div>
          </button>

          {/* Bem estar Físico - Yellow */}
          <button 
            onClick={() => onSelectPillar('physical-wellness')}
            className="relative overflow-hidden bg-yellow-200 rounded-3xl active:scale-95 transition-transform shadow-sm"
          >
            <div className="relative h-[200px]">
              <img
                src={fitnessImg}
                alt="Bem estar Físico"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-orange-600/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                <div className="text-white text-2xl leading-tight" style={{ fontFamily: "'Magiel Lotto', sans-serif" }}>
                  <div>Bem estar</div>
                  <div>Físico</div>
                </div>
              </div>
            </div>
          </button>

          {/* Assistência Financeira - Green */}
          <button 
            onClick={() => onSelectPillar('financial-assistance')}
            className="relative overflow-hidden bg-green-200 rounded-3xl active:scale-95 transition-transform shadow-sm"
          >
            <div className="relative h-[200px]">
              <img
                src={financeImg}
                alt="Assistência Financeira"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-600/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                <div className="text-white text-2xl leading-tight" style={{ fontFamily: "'Magiel Lotto', sans-serif" }}>
                  <div>Assistência</div>
                  <div>Financeira</div>
                </div>
              </div>
            </div>
          </button>

          {/* Assistência Jurídica - Purple */}
          <button 
            onClick={() => onSelectPillar('legal-assistance')}
            className="relative overflow-hidden bg-purple-200 rounded-3xl active:scale-95 transition-transform shadow-sm"
          >
            <div className="relative h-[200px]">
              <img
                src={legalImg}
                alt="Assistência Jurídica"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-600/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                <div className="text-white text-2xl leading-tight" style={{ fontFamily: "'Magiel Lotto', sans-serif" }}>
                  <div>Assistência</div>
                  <div>Jurídica</div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Bottom instruction */}
        <p className="text-center text-white">Clique na área que precisa de apoio</p>
      </div>
    </div>
  );
}
