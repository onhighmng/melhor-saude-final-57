import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';

type Category = 'todos' | 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica';

interface Resource {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  image: string;
  categoryColor: string;
  description?: string;
  url?: string;
}

export function MobileUserResources() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('todos');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map database resources to our format
      const mappedResources: Resource[] = (data || []).map((resource: any) => ({
        id: resource.id,
        title: resource.title || 'Recurso',
        category: resource.category || 'saude_mental',
        categoryLabel: getCategoryLabel(resource.category),
        image: resource.thumbnail_url || resource.image_url || 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=1080',
        categoryColor: getCategoryColor(resource.category),
        description: resource.description,
        url: resource.url
      }));

      setResources(mappedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      // Keep empty array on error
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'saude_mental': 'Saúde Mental',
      'bem_estar_fisico': 'Bem-Estar Físico',
      'assistencia_financeira': 'Financeiro',
      'assistencia_juridica': 'Jurídico',
      'mental_health': 'Saúde Mental',
      'physical_wellness': 'Bem-Estar Físico',
      'financial': 'Financeiro',
      'legal': 'Jurídico'
    };
    return labels[category] || 'Geral';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'saude_mental': 'bg-blue-500',
      'bem_estar_fisico': 'bg-orange-500',
      'assistencia_financeira': 'bg-green-500',
      'assistencia_juridica': 'bg-purple-500',
      'mental_health': 'bg-blue-500',
      'physical_wellness': 'bg-orange-500',
      'financial': 'bg-green-500',
      'legal': 'bg-purple-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const categories = [
    { id: 'todos' as Category, label: 'Todos', color: 'bg-gray-100 text-gray-700' },
    { id: 'saude_mental' as Category, label: 'Saúde Mental', color: 'bg-blue-50 text-blue-600' },
    { id: 'bem_estar_fisico' as Category, label: 'Bem-Estar Físico', color: 'bg-orange-50 text-orange-600' },
    { id: 'assistencia_financeira' as Category, label: 'Financeiro', color: 'bg-green-50 text-green-600' },
    { id: 'assistencia_juridica' as Category, label: 'Jurídico', color: 'bg-purple-50 text-purple-600' },
  ];

  const filteredResources = activeCategory === 'todos' 
    ? resources 
    : resources.filter(r => 
        r.category === activeCategory || 
        r.category === activeCategory.replace('_', '-') ||
        (activeCategory === 'saude_mental' && r.category === 'mental_health') ||
        (activeCategory === 'bem_estar_fisico' && r.category === 'physical_wellness')
      );

  const handleResourceClick = (resource: Resource) => {
    if (resource.url) {
      // Open external URL
      window.open(resource.url, '_blank');
    } else {
      // Navigate to resource detail page
      console.log('View resource:', resource.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Recursos de Bem-Estar</h1>
              <p className="text-gray-500 text-sm mt-1">
                Aceda a guias, vídeos e artigos sobre saúde
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-8">
        {/* Title Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl text-gray-900 mb-2 font-semibold">
            Recursos Mais Populares De 2025
          </h2>
          <p className="text-gray-500 text-sm">
            Descubra conteúdo relevante para o seu bem-estar
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-all active:scale-95 text-sm ${
                activeCategory === category.id
                  ? category.color + ' font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingAnimation 
            variant="inline" 
            message="A carregar recursos..." 
            showProgress={false}
          />
        )}

        {/* Resource Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4">
            {filteredResources.map((resource) => (
              <button
                key={resource.id}
                onClick={() => handleResourceClick(resource)}
                className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 bg-white"
              >
              <div className="relative h-48">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=1080';
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${resource.categoryColor}`}>
                      {resource.categoryLabel}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold">{resource.title}</h3>
                </div>
              </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum recurso disponível nesta categoria.</p>
          </div>
        )}
      </div>

      <MobileBottomNav userType="user" />
    </div>
  );
}

