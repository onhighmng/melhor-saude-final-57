import { ArrowLeft, Star } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

type Pillar = 'mental-health' | 'physical-wellness' | 'financial-assistance' | 'legal-assistance';

interface SpecialistMatchedPageProps {
  pillar: Pillar;
  onBack: () => void;
  onContinue: (sessionType: 'online' | 'phone') => void;
}

export function SpecialistMatchedPage({ pillar, onBack, onContinue }: SpecialistMatchedPageProps) {
  const specialistsByPillar: Record<Pillar, { name: string; title: string; rating: number; experience: string }> = {
    'mental-health': {
      name: 'Frederico prestador',
      title: 'Especialista Geral',
      rating: 5.0,
      experience: 'Anos de experiência'
    },
    'physical-wellness': {
      name: 'Ana Silva',
      title: 'Nutricionista e Personal Trainer',
      rating: 4.9,
      experience: 'Anos de experiência'
    },
    'financial-assistance': {
      name: 'João Santos',
      title: 'Consultor Financeiro',
      rating: 5.0,
      experience: 'Anos de experiência'
    },
    'legal-assistance': {
      name: 'Maria Costa',
      title: 'Advogada Especialista',
      rating: 4.8,
      experience: 'Anos de experiência'
    }
  };

  const specialist = specialistsByPillar[pillar];
  const initials = specialist.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="text-center">
            <h1 className="text-gray-900 mb-1">Especialista Atribuído</h1>
            <p className="text-gray-500 text-sm">
              Encaminhámos o especialista ideal para si
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-green-900 mb-1">Correspondência encontrada</h3>
              <p className="text-sm text-green-700">
                Conectámos você com nosso especialista
              </p>
            </div>
          </div>
        </div>

        {/* Specialist Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 text-xl">{initials}</span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">{specialist.name}</h3>
              <p className="text-blue-600 text-sm mb-2">{specialist.title}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(specialist.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{specialist.rating}</span>
              </div>

              <p className="text-sm text-gray-500">{specialist.experience}</p>
            </div>
          </div>
        </div>

        {/* Session Type Selection */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-gray-900 mb-4 text-center">Como prefere ter a sua sessão?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onContinue('online')}
              className="px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 text-gray-900"
            >
              Online (vídeo)
            </button>
            <button
              onClick={() => onContinue('phone')}
              className="px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 text-gray-900"
            >
              Telefone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
