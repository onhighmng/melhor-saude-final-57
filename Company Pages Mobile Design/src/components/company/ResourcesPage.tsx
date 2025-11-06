import { useState } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

type FilterType = 'Todos' | 'Saúde Mental' | 'Bem-Estar Físico' | 'Planeamento' | 'Jurídico';

export function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');

  const filters: FilterType[] = ['Todos', 'Saúde Mental', 'Bem-Estar Físico', 'Planeamento', 'Jurídico'];

  const resources = [
    {
      title: 'Guia Completo de Saúde Mental',
      category: 'Saúde Mental',
      views: '10k Views',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBzdXBwb3J0JTIwaGFuZHN8ZW58MXx8fHwxNzYyMzcyODg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      large: true,
    },
    {
      title: 'Planeamento Financeiro Pessoal',
      category: 'Estabilidade Financeira',
      views: '15k Views',
      readTime: '12 min read',
      image: 'https://images.unsplash.com/photo-1707779491435-000c45820db2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjBwbGFubmluZyUyMGNhbGN1bGF0b3J8ZW58MXx8fHwxNzYyMjgwMDMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      large: false,
    },
    {
      title: 'Direitos do Trabalhador',
      category: 'Assistência Jurídica',
      views: '8.9k Views',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1758554401873-be8c88d939bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JrZXIlMjByaWdodHMlMjBqdXN0aWNlfGVufDF8fHx8MTc2MjM3Mjg4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      large: false,
    },
  ];

  return (
    <div className="min-h-screen px-4 pt-6 pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-50 rounded-xl p-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-slate-900">Recursos de Bem-Estar</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Aceda a guias, vídeos e artigos sobre saúde e bem-estar
          </p>
        </div>

        {/* Main Title */}
        <div className="mb-6">
          <h2 className="text-slate-900 text-center mb-2">Recursos Mais Populares De 2025</h2>
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
          {/* Large Card - Guia Completo de Saúde Mental */}
          <div className="col-span-2 rounded-3xl overflow-hidden shadow-sm relative h-64">
            <ImageWithFallback
              src={resources[0].image}
              alt={resources[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs mb-3">
                {resources[0].category}
              </div>
              <h3 className="text-white mb-2">{resources[0].title}</h3>
              <div className="flex items-center gap-3 text-white/90 text-xs">
                <span>{resources[0].views}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {resources[0].readTime}
                </span>
              </div>
            </div>
          </div>

          {/* Planeamento Financeiro Pessoal */}
          <div className="rounded-3xl overflow-hidden shadow-sm relative h-64">
            <ImageWithFallback
              src={resources[1].image}
              alt={resources[1].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="inline-block bg-emerald-600 text-white px-2 py-1 rounded-full text-xs mb-2">
                {resources[1].category}
              </div>
              <h3 className="text-white text-sm mb-2">{resources[1].title}</h3>
              <div className="flex flex-col gap-1 text-white/90 text-xs">
                <span>{resources[1].views}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {resources[1].readTime}
                </span>
              </div>
            </div>
          </div>

          {/* Direitos do Trabalhador */}
          <div className="rounded-3xl overflow-hidden shadow-sm relative h-64">
            <ImageWithFallback
              src={resources[2].image}
              alt={resources[2].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="inline-block bg-violet-600 text-white px-2 py-1 rounded-full text-xs mb-2">
                {resources[2].category}
              </div>
              <h3 className="text-white text-sm mb-2">{resources[2].title}</h3>
              <div className="flex flex-col gap-1 text-white/90 text-xs">
                <span>{resources[2].views}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {resources[2].readTime}
                </span>
              </div>
            </div>
          </div>

          {/* Partner Logo Card */}
          <div className="col-span-2 bg-slate-700 rounded-3xl overflow-hidden shadow-sm relative h-48 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-12 h-12 bg-white rounded-xl" />
              </div>
              <div className="text-white text-xs">1K</div>
              <div className="text-white/80 text-xs mt-1">Social Plans</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
