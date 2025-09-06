import React, { useState } from 'react';
import { Search, Heart, Dumbbell, DollarSign, Scale, Star, FileText, Eye, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SelfHelpHeader from '@/components/self-help/SelfHelpHeader';
import ContentGrid from '@/components/self-help/ContentGrid';

const HelpCenter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const helpCategories = [
    {
      id: 'psicologica',
      title: 'Saúde Mental',
      description: 'Artigos de autoajuda, testes de stress, guias de relaxamento e técnicas de bem-estar mental.',
      icon: Heart,
      color: 'bg-red-50 text-red-600 border-red-200',
      iconBg: 'bg-red-100',
      articleCount: 24
    },
    {
      id: 'fisica',
      title: 'Bem-Estar Físico',
      description: 'Exercícios práticos, dicas de nutrição, ergonomia e manutenção da saúde física.',
      icon: Dumbbell,
      color: 'bg-green-50 text-green-600 border-green-200',
      iconBg: 'bg-green-100',
      articleCount: 18
    },
    {
      id: 'financeira',
      title: 'Assistência Financeira',
      description: 'Dicas de orçamento, planeamento financeiro, gestão de dívidas e poupança.',
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-100',
      articleCount: 15
    },
    {
      id: 'juridica',
      title: 'Assistência Jurídica',
      description: 'Perguntas frequentes, orientações básicas sobre direitos e procedimentos legais.',
      icon: Scale,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      iconBg: 'bg-purple-100',
      articleCount: 12
    }
  ];

  const quickFilters = [
    { id: null, name: 'Todos', count: 69 },
    { id: 'psicologica', name: 'Saúde Mental', count: 24 },
    { id: 'fisica', name: 'Bem-Estar Físico', count: 18 },
    { id: 'financeira', name: 'Assistência Financeira', count: 15 },
    { id: 'juridica', name: 'Assistência Jurídica', count: 12 }
  ];

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header Section */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Olá, em que podemos ajudar? 👋
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encontre artigos, guias e recursos para o seu bem-estar
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Pesquise artigos, guias ou testes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 shadow-sm bg-white"
                />
              </div>
            </form>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id || 'all'}
                  variant={selectedCategory === filter.id ? "default" : "outline"}
                  onClick={() => handleCategorySelect(filter.id)}
                  className="rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  {filter.name}
                  <Badge variant="secondary" className="ml-2 text-xs bg-gray-100 text-gray-600">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Show category grid or content based on selection */}
        {!selectedCategory ? (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {helpCategories.map((category) => {
                const Icon = category.icon;
                
                return (
                  <Card 
                    key={category.id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-gray-200 bg-white"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${category.iconBg} mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${category.color.split(' ')[1]}`} />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="text-center pt-0">
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {category.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="w-3 h-3" />
                          <span>{category.articleCount} artigos</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Popular Articles Preview */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Artigos Populares</h3>
                <Button variant="outline" className="rounded-full">
                  Ver todos
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Técnicas de Respiração para Ansiedade', category: 'Saúde Mental', views: 1240 },
                  { title: 'Exercícios para Escritório', category: 'Bem-Estar Físico', views: 890 },
                  { title: 'Como Criar um Orçamento Familiar', category: 'Assistência Financeira', views: 756 }
                ].map((article, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow border border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {article.title}
                      </h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Content Grid when category is selected */
          <div>
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCategory(null)}
                className="mb-4"
              >
                ← Voltar às categorias
              </Button>
            </div>
            
            <SelfHelpHeader 
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            
            <ContentGrid selectedCategory={selectedCategory} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenter;