import React, { useState } from 'react';
import { useSelfHelpContent } from '@/hooks/useSelfHelp';
import ContentCard from './ContentCard';
import ContentModal from './ContentModal';
import { SelfHelpContent } from '@/types/selfHelp';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContentGridProps {
  selectedCategory: string | null;
}

const ContentGrid: React.FC<ContentGridProps> = ({ selectedCategory }) => {
  const { content, loading, error, incrementViewCount } = useSelfHelpContent(selectedCategory);
  const [selectedContent, setSelectedContent] = useState<SelfHelpContent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'title'>('recent');

  const filteredAndSortedContent = React.useMemo(() => {
    let filtered = content.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.view_count - a.view_count;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [content, searchTerm, sortBy]);

  const handleContentClick = async (content: SelfHelpContent) => {
    setSelectedContent(content);
    await incrementViewCount(content.id);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">Erro ao carregar conteúdo: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Pesquisar por título, autor ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recente</SelectItem>
                <SelectItem value="popular">Mais popular</SelectItem>
                <SelectItem value="title">Título A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredAndSortedContent.length} {filteredAndSortedContent.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          {searchTerm && ` para "${searchTerm}"`}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedContent.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              onClick={() => handleContentClick(item)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? `Não encontrámos conteúdo que corresponda à sua pesquisa "${searchTerm}".`
                : 'Não há conteúdo disponível nesta categoria.'
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Limpar pesquisa
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content Modal */}
      {selectedContent && (
        <ContentModal
          content={selectedContent}
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  );
};

export default ContentGrid;