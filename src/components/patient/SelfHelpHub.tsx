import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSelfHelpContent, usePsychologicalTests, useTestResults } from '@/hooks/useSelfHelp';
import { SelfHelpContent, PsychologicalTest, TestResult } from '@/types/selfHelp';
import { 
  BookOpen, 
  Search, 
  Eye, 
  Calendar,
  User,
  Brain,
  Heart,
  Scale,
  Clock
} from 'lucide-react';


const SelfHelpHub = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<SelfHelpContent | null>(null);
  const [selectedTest, setSelectedTest] = useState<PsychologicalTest | null>(null);

  const { content, loading, error, incrementViewCount } = useSelfHelpContent(
    selectedCategory === 'all' ? null : (selectedCategory as any)
  );
  const { tests } = usePsychologicalTests();
  const { getUserTestResults } = useTestResults();
  const [userResults, setUserResults] = useState<TestResult[]>([]);

  useEffect(() => {
    (async () => {
      const results = await getUserTestResults();
      setUserResults(results);
    })();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'psicologica': return <Brain className="w-4 h-4" />;
      case 'juridica': return <Scale className="w-4 h-4" />;
      case 'medica': return <Heart className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getContentTypeIcon = () => {
    return <BookOpen className="w-4 h-4" />;
  };

  const filteredContent = content.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContentView = (contentItem: SelfHelpContent) => {
    setSelectedContent(contentItem);
    incrementViewCount(contentItem.id);
  };



  if (selectedContent) {
    return (
      <Card className="glass-effect border-accent-sage/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedContent(null)}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <div className="flex items-center gap-2 text-sm text-navy-blue/70">
              <Eye className="w-4 h-4" />
              {selectedContent.view_count} visualizações
            </div>
          </div>
          <CardTitle className="text-navy-blue flex items-center gap-2">
            {getCategoryIcon(selectedContent.category)}
            {selectedContent.title}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-navy-blue/70">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {selectedContent.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(selectedContent.published_at || selectedContent.created_at).toLocaleDateString('pt-PT')}
            </div>
            <Badge variant="outline">
              {selectedContent.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="prose prose-navy max-w-none">

          <div 
            className="text-navy-blue"
            dangerouslySetInnerHTML={{ __html: selectedContent.content_body }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-accent-sage/20">
      <CardHeader>
        <CardTitle className="text-navy-blue flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Centro de Autoajuda
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="tests">Testes Psicológicos</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-blue/40 w-4 h-4" />
                <Input
                  placeholder="Procurar artigos, vídeos ou recursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={selectedCategory === 'psicologica' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('psicologica')}
                  size="sm"
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Psicológica
                </Button>
                <Button
                  variant={selectedCategory === 'juridica' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('juridica')}
                  size="sm"
                >
                  <Scale className="w-4 h-4 mr-1" />
                  Jurídica
                </Button>
                <Button
                  variant={selectedCategory === 'medica' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('medica')}
                  size="sm"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Médica
                </Button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => handleContentView(item)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      {getContentTypeIcon()}
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-navy-blue text-lg line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-navy-blue/70">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.view_count}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-navy-blue/50 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date((item as any).published_at || item.created_at).toLocaleDateString('pt-PT')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-navy-blue/40 mx-auto mb-4" />
                <p className="text-navy-blue/70">
                  {searchQuery ? 'Nenhum conteúdo encontrado para a sua pesquisa.' : 'Nenhum conteúdo disponível.'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => (
                <Card 
                  key={test.id} 
                  className="cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => setSelectedTest(test)}
                >
                  <CardHeader>
                    <CardTitle className="text-navy-blue flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      {test.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-navy-blue/70 text-sm mb-4">{test.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-navy-blue/50">
                        <Clock className="w-3 h-3" />
                        ~10 minutos
                      </div>
                      {userResults.find(r => r.test_id === test.id) && (
                        <Badge variant="outline" className="text-xs">
                          Já realizado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>


            {tests.length === 0 && (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-navy-blue/40 mx-auto mb-4" />
                <p className="text-navy-blue/70">Nenhum teste psicológico disponível no momento.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SelfHelpHub;