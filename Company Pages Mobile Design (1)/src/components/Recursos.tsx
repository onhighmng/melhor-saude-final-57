import { Book, FileText, Video, Download } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Recursos() {
  const recursos = [
    { id: 1, title: 'Guia de Nutrição', type: 'PDF', icon: FileText, color: 'blue' },
    { id: 2, title: 'Exercícios de Meditação', type: 'Vídeo', icon: Video, color: 'purple' },
    { id: 3, title: 'Manual de Fitness', type: 'PDF', icon: Book, color: 'orange' },
    { id: 4, title: 'Técnicas de Respiração', type: 'Vídeo', icon: Video, color: 'green' },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: 'bg-blue-100', icon: 'text-blue-600', badge: 'bg-blue-600' },
      purple: { bg: 'bg-purple-100', icon: 'text-purple-600', badge: 'bg-purple-600' },
      orange: { bg: 'bg-orange-100', icon: 'text-orange-600', badge: 'bg-orange-600' },
      green: { bg: 'bg-green-100', icon: 'text-green-600', badge: 'bg-green-600' },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-3xl mb-1">Recursos</h1>
        <p className="text-gray-500 text-sm">Conteúdos e materiais de apoio</p>
      </div>

      {/* Hero Image Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm h-48">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1525296416200-59aaed194d0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGV4ZXJjaXNpbmclMjBmaXRuZXNzfGVufDF8fHx8MTc2MjM3MzcxNnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Recursos de Saúde"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <h3 className="text-white text-xl mb-1">Biblioteca de Recursos</h3>
          <p className="text-white/90 text-sm">Material educacional e de apoio</p>
        </div>
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        {recursos.map((recurso) => {
          const Icon = recurso.icon;
          const colors = getColorClasses(recurso.color);
          
          return (
            <div key={recurso.id} className="bg-white rounded-3xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 truncate">{recurso.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${colors.badge}`}>
                    {recurso.type}
                  </span>
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                  <Download className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Book className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1">Recursos Disponíveis</h3>
            <div className="text-3xl mb-1">47</div>
            <p className="text-sm text-gray-700">documentos e vídeos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
