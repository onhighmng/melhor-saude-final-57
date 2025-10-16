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
  const resourcePosts = [{
    id: 1,
    title: "Guia Completo de Saúde Mental",
    category: "Saúde Mental",
    imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070",
    href: "#",
    views: 2180,
    readTime: 8,
    rating: 5
  }, {
    id: 2,
    title: "Planeamento Financeiro Pessoal",
    category: "Assistência Financeira",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070",
    href: "#",
    views: 1456,
    readTime: 12,
    rating: 4
  }, {
    id: 3,
    title: "Direitos do Trabalhador",
    category: "Assistência Jurídica",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
    href: "#",
    views: 987,
    readTime: 6,
    rating: 4
  }];
  return <div className="space-y-6">
      <PageHeader title="Recursos de Bem-Estar" subtitle="Aceda a guias, vídeos e artigos sobre saúde e bem-estar" icon={BookOpen} />
      
      <div className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="space-y-8">
            {/* Title and Description */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-semibold capitalize !leading-[1.4] md:text-5xl lg:text-6xl">Recursos Mais Populares De 2025</h1>
              <p className="mx-auto max-w-[800px] text-xl !leading-[2] text-foreground/50 md:text-2xl">
                Descubra o conteúdo mais relevante para o seu bem-estar físico, mental e financeiro
              </p>
            </div>
            
            {/* Tabs Bar */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              <TabsTrigger value="all" className="w-full">Todos</TabsTrigger>
              <TabsTrigger value="saude_mental" className="w-full">Saúde Mental</TabsTrigger>
              <TabsTrigger value="bem_estar_fisico" className="w-full">Bem-Estar</TabsTrigger>
              <TabsTrigger value="assistencia_financeira" className="w-full">Financeiro</TabsTrigger>
              <TabsTrigger value="assistencia_juridica" className="w-full">Jurídico</TabsTrigger>
            </TabsList>
            
            {/* Blog Cards */}
            <div className="grid h-auto grid-cols-1 gap-5 md:h-[650px] md:grid-cols-2 lg:grid-cols-[1fr_0.5fr]">
              {resourcePosts.map((post, index) => {
              const isPrimary = index === 0;
              return <div key={post.id} style={{
                backgroundImage: `url(${post.imageUrl})`
              }} className={`group relative row-span-1 flex size-full cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat p-5 text-white max-md:h-[300px] transition-all duration-300 hover:scale-[0.98] hover:rotate-[0.3deg] ${isPrimary ? 'col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-1' : ''}`} onClick={() => toast.success(`A abrir: ${post.title}`)}>
                    <div className="absolute inset-0 -z-0 h-[130%] w-full bg-gradient-to-t from-black/80 to-transparent transition-all duration-500 group-hover:h-full" />
                    <article className="relative z-0 flex items-end">
                      <div className="flex flex-1 flex-col gap-3">
                        <h1 className="text-3xl font-semibold md:text-4xl">{post.title}</h1>
                        <div className="flex flex-col gap-3">
                          <span className="text-base capitalize py-px px-2 rounded-md bg-white/40 w-fit text-white backdrop-blur-md">
                            {post.category}
                          </span>
                          <div className="text-lg font-thin">({post.views} Views)</div>
                          {post.readTime && <div className="text-xl font-semibold">{post.readTime} min read</div>}
                        </div>
                      </div>
                    </article>
                  </div>;
            })}
            </div>
          </div>
          
          {/* Tab Contents */}
          <TabsContent value="all" className="mt-6">
            <ResourceGrid resources={filterByPillar('all')} onView={handleView} onDownload={handleDownload} />
          </TabsContent>
          
          <TabsContent value="saude_mental" className="mt-6">
            <ResourceGrid resources={filterByPillar('saude_mental')} onView={handleView} onDownload={handleDownload} />
          </TabsContent>
          
          <TabsContent value="bem_estar_fisico" className="mt-6">
            <ResourceGrid resources={filterByPillar('bem_estar_fisico')} onView={handleView} onDownload={handleDownload} />
          </TabsContent>
          
          <TabsContent value="assistencia_financeira" className="mt-6">
            <ResourceGrid resources={filterByPillar('assistencia_financeira')} onView={handleView} onDownload={handleDownload} />
          </TabsContent>
          
          <TabsContent value="assistencia_juridica" className="mt-6">
            <ResourceGrid resources={filterByPillar('assistencia_juridica')} onView={handleView} onDownload={handleDownload} />
          </TabsContent>
        </Tabs>
      </div>
      
      <ResourceModal resource={selectedResource} open={modalOpen} onClose={() => setModalOpen(false)} onDownload={handleDownload} />
    </div>;
}