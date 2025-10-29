import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { ResourceModal } from "@/components/resources/ResourceModal";
import { mockResources, UserResource } from "@/data/userResourcesData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Category to pillar color mapping for blog posts
const getCategoryColors = (category: string) => {
  const categoryMap: Record<string, { bg: string; text: string; border: string }> = {
    'Saúde Mental': {
      bg: 'bg-blue-500/80',
      text: 'text-white',
      border: 'border-blue-400'
    },
    'Assistência Financeira': {
      bg: 'bg-green-500/80',
      text: 'text-white',
      border: 'border-green-400'
    },
    'Assistência Jurídica': {
      bg: 'bg-purple-500/80',
      text: 'text-white',
      border: 'border-purple-400'
    },
    'Bem-Estar Físico': {
      bg: 'bg-yellow-500/80',
      text: 'text-white',
      border: 'border-yellow-400'
    }
  };
  return categoryMap[category] || { bg: 'bg-gray-500/80', text: 'text-white', border: 'border-gray-400' };
};

export function AdminResourcesTab() {
  const [resources] = useState(mockResources);
  const [selectedResource, setSelectedResource] = useState<UserResource | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleView = (resource: UserResource) => {
    setSelectedResource(resource);
    setModalOpen(true);
  };

  const handleDownload = (resource: UserResource) => {
    toast.success(`${resource.title} será descarregado em breve`);
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
    <div className="w-full space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <div className="space-y-8">
          {/* Title and Description */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-4xl font-semibold capitalize !leading-[1.4] md:text-5xl lg:text-6xl">
                Recursos Mais Populares De 2025
              </h1>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline" className="rounded-full">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Recurso</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Título</Label>
                      <Input placeholder="Nome do recurso" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Pilar</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar pilar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="saude_mental">Saúde Mental</SelectItem>
                            <SelectItem value="bem_estar_fisico">Bem-Estar Físico</SelectItem>
                            <SelectItem value="assistencia_financeira">Assistência Financeira</SelectItem>
                            <SelectItem value="assistencia_juridica">Assistência Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="article">Artigo</SelectItem>
                            <SelectItem value="video">Vídeo</SelectItem>
                            <SelectItem value="guide">Guia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea placeholder="Breve descrição do conteúdo" rows={3} />
                    </div>
                    <div>
                      <Label>URL da Imagem</Label>
                      <Input placeholder="https://..." />
                    </div>
                    <Button className="w-full">Guardar Recurso</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="mx-auto max-w-[800px] text-xl !leading-[2] text-foreground/50 md:text-2xl">
              Gerir e adicionar conteúdo para bem-estar físico, mental, financeiro e jurídico
            </p>
          </div>
          
          {/* Tabs Bar */}
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className={cn(
                "w-full data-[state=active]:bg-gray-100 data-[state=active]:text-gray-800 data-[state=active]:border-gray-300",
                "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              )}
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="saude_mental" 
              className={cn(
                "w-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:border-blue-300",
                "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              )}
            >
              Saúde Mental
            </TabsTrigger>
            <TabsTrigger 
              value="bem_estar_fisico" 
              className={cn(
                "w-full data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800 data-[state=active]:border-yellow-300",
                "border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              )}
            >
              Bem-Estar Físico
            </TabsTrigger>
            <TabsTrigger 
              value="assistencia_financeira" 
              className={cn(
                "w-full data-[state=active]:bg-green-100 data-[state=active]:text-green-800 data-[state=active]:border-green-300",
                "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              )}
            >
              Financeiro
            </TabsTrigger>
            <TabsTrigger 
              value="assistencia_juridica" 
              className={cn(
                "w-full data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 data-[state=active]:border-purple-300",
                "border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
              )}
            >
              Jurídico
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Tab Contents */}
        <TabsContent value="all" className="mt-6">
          {/* Blog Cards - Only show in "Todos" tab */}
          <div className="grid h-auto grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[1fr_0.5fr] mb-8">
            {resourcePosts.map((post, index) => {
              const isPrimary = index === 0;
              const categoryColors = getCategoryColors(post.category);
              return (
                <div 
                  key={post.id} 
                  style={{ backgroundImage: `url(${post.imageUrl})` }}
                  className={`group relative row-span-1 flex size-full cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat p-5 text-white max-md:h-[300px] transition-all duration-300 hover:scale-[0.99] ${
                    isPrimary ? 'col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-1' : ''
                  }`}
                  onClick={() => toast.success(`Editar: ${post.title}`)}
                >
                  <div className="absolute inset-0 -z-0 h-[130%] w-full bg-gradient-to-t from-black/80 to-transparent transition-all duration-300 group-hover:h-full" />
                  <div className="absolute top-4 right-4 z-10">
                    <Button size="icon" variant="secondary" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <article className="relative z-0 flex items-end">
                    <div className="flex flex-1 flex-col gap-3">
                      <h1 className="text-3xl font-semibold md:text-4xl">{post.title}</h1>
                      <div className="flex flex-col gap-3">
                        <span className={cn(
                          "text-base capitalize py-px px-2 rounded-md w-fit backdrop-blur-md border",
                          categoryColors.bg,
                          categoryColors.text,
                          categoryColors.border
                        )}>
                          {post.category}
                        </span>
                        <div className="text-lg font-thin">({post.views} Views)</div>
                        {post.readTime && <div className="text-xl font-semibold">{post.readTime} min read</div>}
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
          
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
      
      <ResourceModal resource={selectedResource} open={modalOpen} onClose={() => setModalOpen(false)} onDownload={handleDownload} />
    </div>
  );
}
