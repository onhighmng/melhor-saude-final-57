import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type Category = 'todos' | 'saude-mental' | 'bem-estar-fisico' | 'financeiro' | 'juridico';

interface Resource {
  id: number;
  title: string;
  category: Category;
  categoryLabel: string;
  image: string;
  categoryColor: string;
}

export function RecursosPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('saude-mental');

  const resources: Resource[] = [
    {
      id: 1,
      title: 'Recurso',
      category: 'saude-mental',
      categoryLabel: 'Saúde Mental',
      image: 'https://images.unsplash.com/photo-1759216853310-7d315a1fd07d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB0aGVyYXB5JTIwY2FsbXxlbnwxfHx8fDE3NjIzMjY4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      categoryColor: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Recurso',
      category: 'saude-mental',
      categoryLabel: 'Saúde Mental',
      image: 'https://images.unsplash.com/photo-1759216853310-7d315a1fd07d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB0aGVyYXB5JTIwY2FsbXxlbnwxfHx8fDE3NjIzMjY4OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      categoryColor: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'Recurso',
      category: 'bem-estar-fisico',
      categoryLabel: 'Bem-Estar Físico',
      image: 'https://images.unsplash.com/photo-1666979290238-2d862b573345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZXhlcmNpc2UlMjB3ZWxsbmVzc3xlbnwxfHx8fDE3NjIzNTAwNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      categoryColor: 'bg-orange-500'
    },
    {
      id: 4,
      title: 'Recurso',
      category: 'financeiro',
      categoryLabel: 'Financeiro',
      image: 'https://images.unsplash.com/photo-1709080381729-965c62ab0471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwbW9uZXklMjBwbGFubmluZ3xlbnwxfHx8fDE3NjIyNTQxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      categoryColor: 'bg-green-500'
    },
    {
      id: 5,
      title: 'Recurso',
      category: 'juridico',
      categoryLabel: 'Jurídico',
      image: 'https://images.unsplash.com/photo-1715036857278-6f611e582506?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGxhdyUyMGp1c3RpY2V8ZW58MXx8fHwxNzYyMjU2MTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      categoryColor: 'bg-purple-500'
    }
  ];

  const categories = [
    { id: 'todos' as Category, label: 'Todos', color: 'bg-gray-100 text-gray-700' },
    { id: 'saude-mental' as Category, label: 'Saúde Mental', color: 'bg-blue-50 text-blue-600' },
    { id: 'bem-estar-fisico' as Category, label: 'Bem-Estar Físico', color: 'bg-orange-50 text-orange-600' },
    { id: 'financeiro' as Category, label: 'Financeiro', color: 'bg-green-50 text-green-600' },
    { id: 'juridico' as Category, label: 'Jurídico', color: 'bg-purple-50 text-purple-600' },
  ];

  const filteredResources = activeCategory === 'todos' 
    ? resources 
    : resources.filter(r => r.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900">Recursos de Bem-Estar</h1>
              <p className="text-gray-500 text-sm mt-1">
                Aceda a guias, vídeos e artigos sobre saúde e bem-estar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-5 py-12">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl text-gray-900 mb-4">
            Recursos Mais Populares De 2025
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Descubra o conteúdo mais relevante para o seu bem-estar físico, mental, financeiro e jurídico
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full transition-all active:scale-95 ${
                activeCategory === category.id
                  ? category.color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <button
              key={resource.id}
              className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-lg transition-all active:scale-95 bg-white"
            >
              <div className="relative h-64">
                <ImageWithFallback
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${resource.categoryColor}`}>
                      {resource.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-white">{resource.title}</h3>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum recurso disponível nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
