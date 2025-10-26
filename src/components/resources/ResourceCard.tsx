import { UserResource, pillarNames, resourceTypeNames } from "@/data/userResourcesData";
import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pillar color mapping
const getPillarColors = (pillar: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    'saude_mental': {
      bg: 'bg-blue-500/80',
      text: 'text-white',
      border: 'border-blue-400'
    },
    'bem_estar_fisico': {
      bg: 'bg-yellow-500/80',
      text: 'text-white',
      border: 'border-yellow-400'
    },
    'assistencia_financeira': {
      bg: 'bg-green-500/80',
      text: 'text-white',
      border: 'border-green-400'
    },
    'assistencia_juridica': {
      bg: 'bg-purple-500/80',
      text: 'text-white',
      border: 'border-purple-400'
    }
  };
  return colorMap[pillar] || { bg: 'bg-gray-500/80', text: 'text-white', border: 'border-gray-400' };
};

interface ResourceCardProps {
  resource: UserResource;
  onView: (resource: UserResource) => void;
  onDownload?: (resource: UserResource) => void;
  onEdit?: (resource: UserResource) => void;
  onDelete?: (resource: UserResource) => void;
}

export function ResourceCard({ resource, onView, onDownload, onEdit, onDelete }: ResourceCardProps) {
  const getDurationDisplay = () => {
    if (resource.duration) {
      return `${resource.duration} min`;
    }
    return null;
  };

  const pillarColors = getPillarColors(resource.pillar);

  return (
    <div
      style={{
        backgroundImage: `url(${resource.thumbnail})`
      }}
      className="group relative flex size-full min-h-[300px] cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat p-5 text-white transition-all duration-300 hover:scale-[0.98] hover:rotate-[0.3deg]"
      onClick={() => onView(resource)}
    >
      <div className="absolute inset-0 -z-0 h-[130%] w-full bg-gradient-to-t from-black/80 to-transparent transition-all duration-500 group-hover:h-full" />
      
      {/* Action buttons - only show in admin context */}
      {(onEdit || onDelete) && (
        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(resource);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 rounded-full bg-red-500/90 hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(resource);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      
      <article className="relative z-0 flex items-end">
        <div className="flex flex-1 flex-col gap-3">
          <h1 className="text-2xl font-semibold md:text-3xl">{resource.title}</h1>
          
          <div className="flex flex-col gap-3">
            <span className={cn(
              "text-base capitalize py-px px-2 rounded-md w-fit backdrop-blur-md border",
              pillarColors.bg,
              pillarColors.text,
              pillarColors.border
            )}>
              {pillarNames[resource.pillar]}
            </span>
            
            <div className="flex items-center gap-3 text-lg font-thin">
              <span className="capitalize">{resourceTypeNames[resource.type]}</span>
              {getDurationDisplay() && (
                <>
                  <span>•</span>
                  <span>{getDurationDisplay()}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
