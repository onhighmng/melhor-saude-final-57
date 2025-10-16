import { UserResource, pillarNames, resourceTypeNames } from "@/data/userResourcesData";

interface ResourceCardProps {
  resource: UserResource;
  onView: (resource: UserResource) => void;
  onDownload?: (resource: UserResource) => void;
}

export function ResourceCard({ resource, onView, onDownload }: ResourceCardProps) {
  const getDurationDisplay = () => {
    if (resource.duration) {
      return `${resource.duration} min`;
    }
    return null;
  };

  return (
    <div
      style={{
        backgroundImage: `url(${resource.thumbnail})`
      }}
      className="group relative flex size-full min-h-[300px] cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat p-5 text-white transition-all duration-300 hover:scale-[0.98] hover:rotate-[0.3deg]"
      onClick={() => onView(resource)}
    >
      <div className="absolute inset-0 -z-0 h-[130%] w-full bg-gradient-to-t from-black/80 to-transparent transition-all duration-500 group-hover:h-full" />
      
      <article className="relative z-0 flex items-end">
        <div className="flex flex-1 flex-col gap-3">
          <h1 className="text-2xl font-semibold md:text-3xl">{resource.title}</h1>
          
          <div className="flex flex-col gap-3">
            <span className="text-base capitalize py-px px-2 rounded-md bg-white/40 w-fit text-white backdrop-blur-md">
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
