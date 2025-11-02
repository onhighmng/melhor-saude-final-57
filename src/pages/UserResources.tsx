import { useState, useEffect } from "react";
import { Component as BlogPosts } from "@/components/ui/blog-posts";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { ResourceModal } from "@/components/resources/ResourceModal";
import { pillarNames } from "@/types/resources";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EmptyState } from "@/components/ui/empty-state";
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

export default function UserResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const { user, profile } = useAuth();

  // Mark resources milestone as complete on first visit
  useEffect(() => {
    const markResourcesMilestone = async () => {
      if (!profile?.id) return;

      try {
        // Update milestone to mark it as complete
        await supabase
          .from('user_milestones')
          .update({ 
            completed: true, 
            completed_at: new Date().toISOString(),
            metadata: { visited_at: new Date().toISOString() }
          })
          .eq('user_id', profile.id)
          .eq('milestone_type', 'resources')
          .eq('completed', false); // Only update if not already completed
      } catch (error) {
        console.error('Error marking resources milestone:', error);
      }
    };

    markResourcesMilestone();
  }, [profile?.id]);

  useEffect(() => {
    const loadResources = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        // Get employee's company to check premium access (simplified)
        const { data: employee } = await supabase
          .from('company_employees')
          .select('company_id, user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        const hasPremiumAccess = !!employee?.company_id;

        // Load all active resources for company employees
        const query = supabase
          .from('resources')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        setResources(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading resources:', error);
        setLoading(false);
      }
    };

    loadResources();
  }, [user?.id]);
  
  const handleView = async (resource: any) => {
    setSelectedResource(resource);
    setModalOpen(true);
    setViewStartTime(Date.now());
    
    // Track resource view in user_progress table
    if (user?.id) {
      try {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          pillar: resource.pillar,
          action_type: 'resource_viewed',
          action_date: new Date().toISOString(),
          metadata: {
            resource_id: resource.id,
            resource_type: resource.type,
            resource_title: resource.title
          }
        });

        // Also log to resource_access_log
        await supabase.from('resource_access_log').insert({
          user_id: user.id,
          resource_id: resource.id
        });
      } catch (error) {
        console.error('Error tracking resource view:', error);
      }
    }
  };

  // Track duration when modal closes
  useEffect(() => {
    return () => {
      if (viewStartTime && selectedResource && user?.id) {
        const durationSeconds = Math.floor((Date.now() - viewStartTime) / 1000);
        
        if (durationSeconds > 3) {
          // Update resource_access_log with duration
          supabase
            .from('resource_access_log')
            .update({ duration_seconds: durationSeconds })
            .eq('user_id', user.id)
            .eq('resource_id', selectedResource.id)
            .order('accessed_at', { ascending: false })
            .limit(1)
            .then(() => {});
        }
      }
    };
  }, [modalOpen]);
  
  const handleDownload = async (resource: any) => {
    // Check if resource has a downloadable file
    const downloadUrl = resource.file_url || resource.content_url;
    
    if (!downloadUrl) {
      // Resource doesn't have a file to download
      if (resource.resource_type === 'article') {
        toast.error('Este artigo não tem ficheiro para descarregar. Por favor, visualize o conteúdo.');
      } else if (resource.resource_type === 'video') {
        toast.error('Este vídeo deve ser visualizado na plataforma.');
      } else {
        toast.error('Este recurso não tem ficheiro disponível para descarregar.');
      }
      return;
    }

    try {
      // Open the file in a new tab
      window.open(downloadUrl, '_blank');
      
      // Log download
      await supabase.from('resource_access_log').insert({
        user_id: user?.id,
        resource_id: resource.id,
        completed: true
      });

      toast.success(`${resource.title} será descarregado`);
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Erro ao descarregar recurso. Por favor, tente novamente.');
    }
  };
  const filterByPillar = (pillar: string) => {
    if (pillar === 'all') return resources;
    return resources.filter(r => r.pillar === pillar);
  };

  // Get top 3 featured resources from database (most recent)
  const featuredResources = resources.slice(0, 3);
  const remainingResources = resources.slice(3);
  
  // Map pillar to readable category name
  const getPillarCategoryName = (pillar: string): string => {
    const pillarMap: Record<string, string> = {
      'saude_mental': 'Saúde Mental',
      'bem_estar_fisico': 'Bem-Estar Físico',
      'assistencia_financeira': 'Assistência Financeira',
      'assistencia_juridica': 'Assistência Jurídica'
    };
    return pillarMap[pillar] || pillar;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show empty state if no resources
  if (resources.length === 0) {
    return (
      <div className="w-full min-h-screen bg-white">
        <PageHeader title="Recursos de Bem-Estar" subtitle="Aceda a guias, vídeos e artigos sobre saúde e bem-estar" icon={BookOpen} sticky={false} />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <EmptyState
            icon={BookOpen}
            title="Recursos disponíveis em breve"
            description="Estamos a preparar conteúdo valioso para apoiar o seu bem-estar. Volte em breve para aceder a guias, vídeos e artigos."
          />
        </div>
      </div>
    );
  }

  return <div className="w-full min-h-screen bg-white">
    <div className="space-y-6">
      <PageHeader title="Recursos de Bem-Estar" subtitle="Aceda a guias, vídeos e artigos sobre saúde e bem-estar" icon={BookOpen} sticky={false} />
      
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
            {/* Featured Resources - Top 3 from database */}
            {featuredResources.length > 0 && (
              <div className="grid h-auto grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[1fr_0.5fr] mb-8">
                {featuredResources.map((resource, index) => {
                  const isPrimary = index === 0;
                  const categoryColors = getCategoryColors(getPillarCategoryName(resource.pillar));
                  const thumbnailUrl = resource.thumbnail_url || resource.file_url || 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070';
                  
                  return (
                    <div 
                      key={resource.id} 
                      style={{
                        backgroundImage: `url(${thumbnailUrl})`
                      }} 
                      className={`group relative row-span-1 flex size-full cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-cover bg-center bg-no-repeat p-5 text-white max-md:h-[300px] transition-all duration-300 hover:scale-[0.99] ${isPrimary ? 'col-span-1 row-span-1 md:col-span-2 md:row-span-2 lg:col-span-1' : ''}`} 
                      onClick={() => handleView(resource)}
                    >
                      <div className="absolute inset-0 -z-0 h-[130%] w-full bg-gradient-to-t from-black/80 to-transparent transition-all duration-300 group-hover:h-full" />
                      <article className="relative z-0 flex items-end">
                        <div className="flex flex-1 flex-col gap-3">
                          <h1 className="text-3xl font-semibold md:text-4xl">{resource.title}</h1>
                          <div className="flex flex-col gap-3">
                            <span className={cn(
                              "text-base capitalize py-px px-2 rounded-md w-fit backdrop-blur-md border",
                              categoryColors.bg,
                              categoryColors.text,
                              categoryColors.border
                            )}>
                              {getPillarCategoryName(resource.pillar)}
                            </span>
                            <div className="text-lg font-thin">{resource.type || 'Recurso'}</div>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Empty state if no resources */}
            {resources.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum recurso disponível</h3>
                <p className="text-muted-foreground">Novos recursos serão adicionados em breve.</p>
              </div>
            )}
            
            {/* Remaining resources in grid */}
            {remainingResources.length > 0 && (
              <ResourceGrid resources={remainingResources} onView={handleView} onDownload={handleDownload} />
            )}
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