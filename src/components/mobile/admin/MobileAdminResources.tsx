import { useState } from 'react';
import { BookOpen, Plus, FileText, Video, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function MobileAdminResources() {
  const [selectedType, setSelectedType] = useState('all');

  const resources = [
    {
      id: 1,
      title: 'Guia de Onboarding para Empresas',
      type: 'pdf',
      category: 'Onboarding',
      downloads: 124
    },
    {
      id: 2,
      title: 'Tutorial da Plataforma',
      type: 'video',
      category: 'Tutoriais',
      downloads: 89
    },
    {
      id: 3,
      title: 'Política de Privacidade',
      type: 'pdf',
      category: 'Legal',
      downloads: 210
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Recursos</h1>
              <p className="text-gray-500 text-sm">Gerir recursos da plataforma</p>
            </div>
            <Button size="icon" className="bg-blue-600">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Type Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'pdf', 'video', 'article'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {type === 'all' ? 'Todos' : type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Resources List */}
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card 
              key={resource.id}
              className="bg-white rounded-2xl p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {resource.type === 'video' ? (
                    <Video className="w-6 h-6 text-blue-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">{resource.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {resource.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{resource.downloads} downloads</span>
                  </div>
                </div>
                <Button size="icon" variant="outline" className="flex-shrink-0">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

