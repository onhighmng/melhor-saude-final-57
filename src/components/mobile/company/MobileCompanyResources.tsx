import { useState } from 'react';
import { BookOpen, Download, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Resource {
  id: number;
  title: string;
  category: string;
  type: 'pdf' | 'video' | 'article';
  downloads: number;
}

export function MobileCompanyResources() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources: Resource[] = [
    {
      id: 1,
      title: 'Guia de Bem-Estar Mental',
      category: 'Saúde Mental',
      type: 'pdf',
      downloads: 45
    },
    {
      id: 2,
      title: 'Plano de Atividades Físicas',
      category: 'Bem-Estar Físico',
      type: 'pdf',
      downloads: 32
    },
    {
      id: 3,
      title: 'Gestão Financeira Pessoal',
      category: 'Assistência Financeira',
      type: 'article',
      downloads: 28
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Recursos</h1>
              <p className="text-gray-500 text-sm">Material educativo e guias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-4">
        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'Saúde Mental', 'Bem-Estar Físico', 'Assistência Financeira', 'Assistência Jurídica'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>

        {/* Resources List */}
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card 
              key={resource.id}
              className="bg-white rounded-2xl p-4 border border-gray-200 active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-900 font-medium">{resource.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{resource.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {resource.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">{resource.downloads} downloads</span>
                  </div>
                </div>
                <button className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform">
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

