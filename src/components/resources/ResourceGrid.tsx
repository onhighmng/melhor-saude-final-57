import { ResourceCard } from "./ResourceCard";
import { UserResource } from "@/types/resources";

interface ResourceGridProps {
  resources: UserResource[];
  onView: (resource: UserResource) => void;
  onDownload?: (resource: UserResource) => void;
  onEdit?: (resource: UserResource) => void;
  onDelete?: (resource: UserResource) => void;
}

export function ResourceGrid({ resources, onView, onDownload, onEdit, onDelete }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sem recursos disponíveis</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onView={onView}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
