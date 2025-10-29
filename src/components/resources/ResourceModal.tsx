import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink } from "lucide-react";
import { UserResource, pillarNames, resourceTypeNames } from "@/types/resources";

interface ResourceModalProps {
  resource: UserResource | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (resource: UserResource) => void;
}

export function ResourceModal({ resource, open, onClose, onDownload }: ResourceModalProps) {
  if (!resource) return null;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{resourceTypeNames[resource.type]}</Badge>
            <Badge variant="secondary">{pillarNames[resource.pillar]}</Badge>
          </div>
          <DialogTitle className="text-2xl">{resource.title}</DialogTitle>
          <DialogDescription>{resource.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {resource.type === 'video' && resource.videoUrl && (
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Vídeo Preview</p>
            </div>
          )}
          
          {resource.type === 'article' && (
            <div className="prose prose-sm max-w-none">
              <p>Conteúdo do artigo será exibido aqui...</p>
            </div>
          )}
          
          {resource.type === 'pdf' && (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">Pré-visualização do PDF</p>
              {onDownload && (
                <Button onClick={() => onDownload(resource)}>
                  <Download className="mr-2 h-4 w-4" />
                  Descarregar PDF
                </Button>
              )}
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            {resource.fileUrl && (
              <Button variant="outline" className="flex-1" asChild>
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir em Nova Aba
                </a>
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
