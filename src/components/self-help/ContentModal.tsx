import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SelfHelpContent } from '@/types/selfHelp';
import { 
  FileText, 
  Eye, 
  Calendar, 
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContentModalProps {
  content: SelfHelpContent;
  isOpen: boolean;
  onClose: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({ content, isOpen, onClose }) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getTypeIcon()}
                  <Badge variant="secondary" className={getCategoryColor()}>
                    {getCategoryName()}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{content.view_count} visualizações</span>
                </div>
              </div>
              
              <DialogTitle className="text-2xl font-bold leading-tight mb-4">
                {content.title}
              </DialogTitle>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Por {content.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(content.created_at), 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thumbnail */}
          {content.thumbnail_url && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={content.thumbnail_url} 
                alt={content.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Summary */}
          {content.summary && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumo</h4>
              <p className="text-muted-foreground">{content.summary}</p>
            </div>
          )}

          {/* Content Body */}
          {content.content_body && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div 
                dangerouslySetInnerHTML={{ __html: content.content_body }}
                className="space-y-4"
              />
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentModal;