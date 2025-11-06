import { useState, useEffect } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { supabase } from '@/integrations/supabase/client';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

type FilterType = 'Todos' | 'Saúde Mental' | 'Bem-Estar Físico' | 'Planeamento' | 'Jurídico';

interface Resource {
  title: string;
  category: string;
  views: string;
  readTime: string;
  image: string;
  large: boolean;
}

export function MobileCompanyResources() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([
    {
      title: 'Guia Completo de Saúde Mental',
      category: 'Saúde Mental',
      views: '10k Views',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=80',
      large: true,
    },
    {
      title: 'Planeamento Financeiro Pessoal',
      category: 'Estabilidade Financeira',
      views: '15k Views',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1707779491435-000c45820db2?w=800&q=80',
      large: false,
    },
    {
      title: 'Direitos do Trabalhador',
      category: 'Assistência Jurídica',
      views: '8.9k Views',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1758554401873-be8c88d939bb?w=800&q=80',
      large: false,
    },
  ]);

  const filters: FilterType[] = ['Todos', 'Saúde Mental', 'Bem-Estar Físico', 'Planeamento', 'Jurídico'];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data && data.length > 0) {
          const mappedResources: Resource[] = data.map((resource: any, idx: number) => ({
            title: resource.title || 'Recurso',
            category: resource.category || 'Geral',
            views: '10k Views',
            readTime: '8 min read',
            image: resource.thumbnail_url || resource.image_url || 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=80',
            large: idx === 0,
          }));
          setResources(mappedResources);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar recursos..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-50 rounded-xl p-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-slate-900 text-xl font-bold">Recursos de Bem-Estar</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Aceda a guias, vídeos e artigos sobre saúde e bem-estar
          </p>
        </div>

        {/* Main Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">Recursos Mais Populares De 2025</h2>
          <p className="text-slate-600 text-center text-sm mb-1">
            Descubra o conteúdo mais relevante para o seu bem-estar
          </p>
          <p className="text-slate-500 text-center text-sm">
            físico, mental, financeiro e jurídico
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 min-w-max pb-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl transition-all text-sm whitespace-nowrap ${
                  activeFilter === filter
                    ? filter === 'Todos'
                      ? 'bg-slate-100 text-slate-900'
                      : filter === 'Saúde Mental'
                      ? 'bg-blue-50 text-blue-700'
                      : filter === 'Bem-Estar Físico'
                      ? 'bg-amber-50 text-amber-700'
                      : filter === 'Planeamento'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-violet-50 text-violet-700'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Large Card - First Resource */}
          {resources[0] && (
            <div className="col-span-2 rounded-3xl overflow-hidden shadow-sm relative h-64">
              <img
                src={resources[0].image}
                alt={resources[0].title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="inline-block bg-blue-500/80 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
                  <span className="text-white text-xs font-medium">{resources[0].category}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{resources[0].title}</h3>
                <div className="flex items-center gap-3 text-white/80 text-xs">
                  <span>{resources[0].views}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{resources[0].readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smaller Resource Cards */}
          {resources.slice(1, 3).map((resource, index) => (
            <div key={index} className="rounded-3xl overflow-hidden shadow-sm relative h-48">
              <img
                src={resource.image}
                alt={resource.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className={`inline-block px-2 py-1 rounded-full mb-2 ${
                  resource.category.includes('Financ') 
                    ? 'bg-emerald-500/80' 
                    : 'bg-violet-500/80'
                } backdrop-blur-sm`}>
                  <span className="text-white text-xs font-medium">{resource.category}</span>
                </div>
                <h3 className="text-white text-sm font-semibold mb-1">{resource.title}</h3>
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <span>{resource.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if no resources */}
        {resources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum recurso disponível</p>
          </div>
        )}
      </div>

      <MobileBottomNav userType="company" />
    </div>
  );
}
