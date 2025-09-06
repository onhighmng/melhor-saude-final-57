import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SelfHelpContent } from '@/types/selfHelp';
import { FileText, Eye, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContentCardProps {
  content: SelfHelpContent;
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onClick }) => {
  const getTypeIcon = () => {
    return <FileText className="w-5 h-5" />;
  };

  const getCategoryColor = () => {
    switch (content.category) {
      case 'psicologica':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'juridica':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'medica':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryName = () => {
    switch (content.category) {
      case 'psicologica':
        return 'Psicológica';
      case 'juridica':
        return 'Jurídica';
      case 'medica':
        return 'Médica';
      default:
        return content.category;
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            {getTypeIcon()}
            <Badge variant="secondary" className={getCategoryColor()}>
              {getCategoryName()}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{content.view_count}</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {content.title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        {content.thumbnail_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={content.thumbnail_url} 
              alt={content.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {content.summary && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {content.summary}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{content.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(content.created_at), 'dd MMM yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>
        
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {content.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {content.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{content.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentCard;