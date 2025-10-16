import { useState } from "react";
import { Component as BlogPosts } from "@/components/ui/blog-posts";
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
  
  const resourcePosts = [
    {
      id: 1,
      title: "Guia Completo de Saúde Mental",
      category: "Saúde Mental",
      imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070",
      href: "#",
      views: 2180,
      readTime: 8,
      rating: 5
    },
    {
      id: 2,
      title: "Planeamento Financeiro Pessoal",
      category: "Assistência Financeira",
      imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070",
      href: "#",
      views: 1456,
      readTime: 12,
      rating: 4
    },
    {
      id: 3,
      title: "Direitos do Trabalhador",
      category: "Assistência Jurídica",
      imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
      href: "#",
      views: 987,
      readTime: 6,
      rating: 4
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recursos de Bem-Estar"
        subtitle="Aceda a guias, vídeos e artigos sobre saúde e bem-estar"
        icon={BookOpen}
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos Mais Populares de 2024</h2>
          <p className="mx-auto max-w-[800px] text-center text-xl !leading-[2] text-foreground/50 md:text-2xl mb-8">
            Descubra o conteúdo mais relevante para o seu bem-estar físico, mental e financeiro
          </p>
        </div>
      </div>
      
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
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourcePosts.map((post) => (
            <div
              key={post.id}
              onClick={() => toast.success(`A abrir: ${post.title}`)}
              className="cursor-pointer group"
            >
              <div className="rounded-lg overflow-hidden mb-4">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{post.category}</p>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{post.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.views} visualizações</span>
                  <span>{post.readTime} min leitura</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
