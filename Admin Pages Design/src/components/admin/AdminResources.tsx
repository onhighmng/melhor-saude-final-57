import { FileText, Video, Image as ImageIcon } from 'lucide-react';

export function AdminResources() {
  const resources = [
    {
      id: 1,
      title: 'Guia de Bem-Estar',
      type: 'PDF',
      icon: FileText,
      color: 'blue',
    },
    {
      id: 2,
      title: 'Vídeos de Meditação',
      type: 'Vídeo',
      icon: Video,
      color: 'purple',
    },
    {
      id: 3,
      title: 'Material de Apoio',
      type: 'Imagens',
      icon: ImageIcon,
      color: 'green',
    },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Recursos</h1>
        <p className="text-sm text-gray-500">Materiais de apoio e conteúdo</p>
      </div>

      <div className="space-y-3">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <div
              key={resource.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  resource.color === 'blue'
                    ? 'bg-blue-100'
                    : resource.color === 'purple'
                    ? 'bg-purple-100'
                    : 'bg-green-100'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    resource.color === 'blue'
                      ? 'text-blue-600'
                      : resource.color === 'purple'
                      ? 'text-purple-600'
                      : 'text-green-600'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">{resource.title}</h3>
                <p className="text-xs text-gray-500">{resource.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
