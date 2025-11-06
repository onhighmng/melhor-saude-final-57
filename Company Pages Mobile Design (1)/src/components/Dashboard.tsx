import { ImageWithFallback } from './figma/ImageWithFallback';

export function Dashboard() {
  return (
    <div className="p-4 space-y-4">
      {/* Pilar Mais Utilizado - White Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-gray-700 text-sm mb-1">Pilar Mais Utilizado</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-lg">Saúde Mental</span>
              <span className="text-purple-600">42%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">das sessões totais</p>
          </div>
        </div>

        {/* Taxa de Utilização */}
        <div className="flex items-start gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-gray-700 text-sm mb-1">Taxa de Utilização</h3>
            <div className="text-purple-600 text-lg">59%</div>
            <p className="text-sm text-gray-500 mt-1">Sessões utilizadas este mês</p>
          </div>
        </div>
      </div>

      {/* Sessões Este Mês - Blue Gradient Card */}
      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 text-sm mb-1">Sessões Este Mês</h3>
            <div className="text-3xl mb-1">234</div>
            <p className="text-sm text-gray-700">de 400 utilizadas</p>
          </div>
        </div>
      </div>

      {/* Estado de Registo - Purple/Lavender Card with Background */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm h-48">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/90 to-purple-300/90 backdrop-blur-sm" />
        
        <div className="relative h-full p-6 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-gray-900 mb-2">Estado de Registo</h3>
            <p className="text-gray-800">
              <span className="text-xl">47</span> registados, <span className="text-xl">3</span> pendentes
            </p>
          </div>
        </div>
      </div>

      {/* Recursos - Image Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm h-56">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1525296416200-59aaed194d0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGV4ZXJjaXNpbmclMjBmaXRuZXNzfGVufDF8fHx8MTc2MjM3MzcxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Recursos"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm mb-4" />
          <h3 className="text-white text-xl mb-1">Recursos</h3>
          <p className="text-white/90 text-sm">Conteúdos e materiais de apoio</p>
        </div>
      </div>
    </div>
  );
}
