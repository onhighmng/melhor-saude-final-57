import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, BookOpen, Download, Eye, Play } from "lucide-react";
import { UserResource, pillarNames, resourceTypeNames } from "@/data/userResourcesData";
import { useTranslation } from 'react-i18next';

interface ResourceCardProps {
  resource: UserResource;
  onView: (resource: UserResource) => void;
  onDownload?: (resource: UserResource) => void;
}

const iconMap = {
  pdf: FileText,
  video: Video,
  article: BookOpen,
};

const colorMap = {
  pdf: 'text-red-500',
  video: 'text-purple-500',
  article: 'text-blue-500',
};

export function ResourceCard({ resource, onView, onDownload }: ResourceCardProps) {
  const { t } = useTranslation('user');
  const Icon = iconMap[resource.type];
  const colorClass = colorMap[resource.type];
  
  const getCTA = () => {
    switch (resource.type) {
      case 'video':
        return t('resources.ctaWatch');
      case 'article':
        return t('resources.ctaRead');
      case 'pdf':
      default:
        return t('resources.ctaRead');
    }
  };
  
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      {resource.thumbnail && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={resource.thumbnail} 
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className={colorClass}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline">{resourceTypeNames[resource.type]}</Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
        <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {pillarNames[resource.pillar]}
          </span>
          {resource.duration && (
            <span className="text-muted-foreground">{resource.duration}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onView(resource)}
            className="flex-1"
          >
            {resource.type === 'video' ? (
              <Play className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {getCTA()}
          </Button>
          
          {resource.type === 'pdf' && onDownload && (
            <Button 
              variant="outline"
              onClick={() => onDownload(resource)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
