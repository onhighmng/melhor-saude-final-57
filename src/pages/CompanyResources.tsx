import { useState, useEffect } from "react";
import { Component as BlogPosts } from "@/components/ui/blog-posts";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { ResourceModal } from "@/components/resources/ResourceModal";
import { UserResource, pillarNames } from "@/data/userResourcesData";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
// Pillar color mapping
const getPillarColors = (pillar: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    'saude_mental': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-100'
    },
    'bem_estar_fisico': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      hover: 'hover:bg-yellow-100'
    },
    'assistencia_financeira': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      hover: 'hover:bg-green-100'
    },
    'assistencia_juridica': {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      hover: 'hover:bg-purple-100'
    },
    'all': {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-100'
    }
  };
  return colorMap[pillar] || colorMap['all'];
};

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

export default function CompanyResources() {
  const [resources, setResources] = useState<UserResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<UserResource | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const loadResources = async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedResources: UserResource[] = (data || []).map(r => {
          const validPillars = ['saude_mental', 'bem_estar_fisico', 'assistencia_financeira', 'assistencia_juridica'];
          const pillar = validPillars.includes(r.pillar) ? r.pillar : 'saude_mental';
          
          return {
            id: r.id,
            title: r.title,
            pillar: pillar as 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica',
            type: (r.resource_type || 'article') as 'pdf' | 'video' | 'article',
            description: r.description || '',
            url: r.url,
            thumbnail: r.thumbnail_url,
            createdAt: r.created_at || new Date().toISOString()
          };
        });

        setResources(transformedResources);
      } catch (error) {
        console.error('Error loading resources:', error);
        toast.error('Erro ao carregar recursos');
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);
  
  useEffect(() => {
    // Add company-page class to body for light blue background
    document.body.classList.add('company-page');
    
    // Cleanup: remove class when component unmounts
    return () => {
      document.body.classList.remove('company-page');
    };
  }, []);
  
  const handleView = async (resource: UserResource) => {
    setSelectedResource(resource);
    setModalOpen(true);
    
    // Track resource view in resource_access_log table
    if (user?.id) {
      try {
        await supabase.from('resource_access_log').insert({
          user_id: user.id,
          resource_id: resource.id,
          access_type: 'view'
        });
        
        // Also track in user_progress
        await supabase.from('user_progress').insert({
          user_id: user.id,
          action_type: 'resource_viewed',
          pillar: resource.pillar,
          metadata: {
            resource_id: resource.id,
            resource_type: resource.type,
            resource_title: resource.title
          }
        });
      } catch (error) {
        console.error('Error tracking resource view:', error);
      }
    }
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
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">A carregar recursos...</p>
        </div>
      </div>
    );
  }

  return <div className="w-full min-h-screen">
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Recursos de Bem-Estar</h1>
            <p className="text-base text-muted-foreground mt-1">Aceda a guias, vídeos e artigos sobre saúde e bem-estar</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="space-y-8">
            {/* Title and Description */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-semibold capitalize !leading-[1.4] md:text-5xl lg:text-6xl">Recursos Mais Populares De 2025</h1>
              <p className="mx-auto max-w-[800px] text-xl !leading-[2] text-foreground/50 md:text-2xl">
                Descubra o conteúdo mais relevante para o seu bem-estar físico, mental, financeiro e jurídico
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
              return <div key={post.id} style={{
                backgroundImage: `url(${post.imageUrl})`
              }} className={`group relative row-span-1 flex size-full cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat p-5 text-white max-md:h-[300px] transition-all duration-300 hover:scale-[0.99] ${isPrimary ? 'col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-1' : ''}`} onClick={() => toast.success(`A abrir: ${post.title}`)}>
                <div className="absolute inset-0 -z-0 h-[130%] w-full bg-gradient-to-t from-black/80 to-transparent transition-all duration-300 group-hover:h-full" />
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
                  </div>;
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
      </div>
      
      <ResourceModal resource={selectedResource} open={modalOpen} onClose={() => setModalOpen(false)} onDownload={handleDownload} />
    </div>
  </div>;
}
