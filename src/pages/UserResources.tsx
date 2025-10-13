import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { ResourceModal } from "@/components/resources/ResourceModal";
import { mockResources, UserResource, pillarNames } from "@/data/userResourcesData";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function UserResources() {
  const [resources] = useState(mockResources);
  const [selectedResource, setSelectedResource] = useState<UserResource | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const handleView = (resource: UserResource) => {
    setSelectedResource(resource);
    setModalOpen(true);
  };
  
  const handleDownload = (resource: UserResource) => {
    toast.success(`${resource.title} será descarregado em breve`);
    // In a real app, trigger download
  };
  
  const filterByPillar = (pillar: string) => {
    if (pillar === 'all') return resources;
    return resources.filter(r => r.pillar === pillar);
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recursos de Bem-Estar"
        subtitle="Aceda a guias, vídeos e artigos sobre saúde e bem-estar"
        icon={BookOpen}
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="saude_mental">Saúde Mental</TabsTrigger>
            <TabsTrigger value="bem_estar_fisico">Bem-Estar</TabsTrigger>
            <TabsTrigger value="assistencia_financeira">Financeiro</TabsTrigger>
            <TabsTrigger value="assistencia_juridica">Jurídico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <ResourceGrid
              resources={filterByPillar('all')}
              onView={handleView}
              onDownload={handleDownload}
            />
          </TabsContent>
          
          <TabsContent value="saude_mental" className="mt-6">
            <ResourceGrid
              resources={filterByPillar('saude_mental')}
              onView={handleView}
              onDownload={handleDownload}
            />
          </TabsContent>
          
          <TabsContent value="bem_estar_fisico" className="mt-6">
            <ResourceGrid
              resources={filterByPillar('bem_estar_fisico')}
              onView={handleView}
              onDownload={handleDownload}
            />
          </TabsContent>
          
          <TabsContent value="assistencia_financeira" className="mt-6">
            <ResourceGrid
              resources={filterByPillar('assistencia_financeira')}
              onView={handleView}
              onDownload={handleDownload}
            />
          </TabsContent>
          
          <TabsContent value="assistencia_juridica" className="mt-6">
            <ResourceGrid
              resources={filterByPillar('assistencia_juridica')}
              onView={handleView}
              onDownload={handleDownload}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <ResourceModal
        resource={selectedResource}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onDownload={handleDownload}
      />
    </div>
  );
}
