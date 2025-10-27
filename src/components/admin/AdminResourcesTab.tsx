import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceGrid } from "@/components/resources/ResourceGrid";
import { ResourceModal } from "@/components/resources/ResourceModal";
import { UserResource } from "@/data/userResourcesData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

const pillarToCategoryMap: Record<string, string> = {
  'saude_mental': 'Saúde Mental',
  'bem_estar_fisico': 'Bem-Estar Físico',
  'assistencia_financeira': 'Assistência Financeira',
  'assistencia_juridica': 'Assistência Jurídica'
};

export function AdminResourcesTab() {
  const { profile } = useAuth();
  const [resources, setResources] = useState<UserResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<UserResource | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<UserResource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: '',
    pillar: 'saude_mental',
    type: 'article',
    description: '',
    thumbnail: '',
    content_url: ''
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    pillar: 'saude_mental',
    type: 'article',
    description: '',
    thumbnail: '',
    content_url: '',
    isPremium: false
  });
  
  useEffect(() => {
    loadResources();
  }, []);
  
  const loadResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedResources: UserResource[] = (data || []).map(resource => ({
        id: resource.id,
        title: resource.title,
        description: resource.description || '',
        thumbnail: resource.thumbnail_url || '',
        pillar: (resource.pillar || 'saude_mental') as 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica',
        category: pillarToCategoryMap[resource.pillar || 'saude_mental'] || 'Saúde Mental',
        type: (resource.resource_type || 'article') as 'pdf' | 'video' | 'article',
        viewCount: 0,
        rating: 0,
        isPremium: false,
        createdAt: resource.created_at
      }));
      
      setResources(formattedResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Erro ao carregar recursos');
    } finally {
      setLoading(false);
    }
  };

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

  const handleEditClick = (resource: UserResource) => {
    setSelectedResource(resource);
    setEditFormData({
      title: resource.title,
      pillar: resource.pillar,
      type: resource.type,
      description: resource.description,
      thumbnail: resource.thumbnail,
      content_url: '',
      isPremium: resource.isPremium || false
    });
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!selectedResource) return;

    // Validation
    if (!editFormData.title?.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    if (!editFormData.pillar) {
      toast.error('Selecione um pilar');
      return;
    }

    try {
      const { error } = await supabase
        .from('resources')
        .update({
          title: editFormData.title,
          description: editFormData.description,
          pillar: editFormData.pillar,
          type: editFormData.type,
          is_premium: editFormData.isPremium,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedResource.id);

      if (error) throw error;

      // Log admin action
      if (profile?.id) {
        await supabase.from('admin_logs').insert({
          admin_id: profile.id,
          action: 'resource_updated',
          entity_type: 'resource',
          entity_id: selectedResource.id,
          details: { 
            title: editFormData.title,
            pillar: editFormData.pillar
          }
        });
      }

      toast.success('Recurso atualizado com sucesso');
      setShowEditDialog(false);
      setSelectedResource(null);
      await loadResources();
    } catch (error: any) {
      console.error('Error updating resource:', error);
      toast.error('Erro ao atualizar recurso: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceToDelete.id);

      if (error) throw error;

      // Log admin action
      if (profile?.id) {
        await supabase.from('admin_logs').insert({
          admin_id: profile.id,
          action: 'resource_deleted',
          entity_type: 'resource',
          entity_id: resourceToDelete.id,
          details: { 
            title: resourceToDelete.title,
            pillar: resourceToDelete.pillar
          }
        });
      }

      toast.success('Recurso eliminado com sucesso');
      setResourceToDelete(null);
      await loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Erro ao eliminar recurso');
    }
  };

  const handleDeleteClick = (resource: UserResource) => {
    setResourceToDelete(resource);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                      <Input 
                        placeholder="Nome do recurso" 
                        value={addFormData.title}
                        onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Pilar</Label>
                        <Select value={addFormData.pillar} onValueChange={(value) => setAddFormData({ ...addFormData, pillar: value })}>
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
                        <Select value={addFormData.type} onValueChange={(value) => setAddFormData({ ...addFormData, type: value })}>
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
                      <Textarea 
                        placeholder="Breve descrição do conteúdo" 
                        rows={3} 
                        value={addFormData.description}
                        onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail-upload">Imagem</Label>
                      <Input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
                            const filePath = `thumbnails/${fileName}`;
                            
                            const { error: uploadError } = await supabase.storage
                              .from('resources')
                              .upload(filePath, file);
                            
                            if (uploadError) throw uploadError;
                            
                            const { data: { publicUrl } } = supabase.storage
                              .from('resources')
                              .getPublicUrl(filePath);
                            
                            setAddFormData(prev => ({ ...prev, thumbnail: publicUrl }));
                            toast.success('Imagem carregada com sucesso');
                          } catch (error) {
                            console.error('Error uploading thumbnail:', error);
                            toast.error('Erro ao carregar imagem');
                          }
                        }}
                      />
                      {addFormData.thumbnail && (
                        <img src={addFormData.thumbnail} alt="Preview" className="w-32 h-32 object-cover rounded" />
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      disabled={isSaving}
                      onClick={async () => {
                        // Validation
                        if (!addFormData.title?.trim()) {
                          toast.error('Título é obrigatório');
                          return;
                        }
                        if (!addFormData.pillar) {
                          toast.error('Selecione um pilar');
                          return;
                        }
                        if (!addFormData.type) {
                          toast.error('Selecione um tipo');
                          return;
                        }
                        
                        setIsSaving(true);
                        
                        try {
                          const { error } = await supabase.from('resources').insert({
                            title: addFormData.title,
                            description: addFormData.description,
                            pillar: addFormData.pillar,
                            type: addFormData.type,
                            thumbnail_url: addFormData.thumbnail,
                            url: addFormData.content_url,
                            is_public: true,
                            is_premium: false,
                            created_by: profile?.id
                          });
                          
                          if (error) throw error;
                          
                          toast.success('Recurso criado com sucesso');
                          setShowAddDialog(false);
                          setAddFormData({
                            title: '',
                            pillar: 'saude_mental',
                            type: 'article',
                            description: '',
                            thumbnail: '',
                            content_url: ''
                          });
                          await loadResources();
                        } catch (error: any) {
                          console.error('Error creating resource:', error);
                          toast.error('Erro ao criar recurso: ' + error.message);
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                    >
                      {isSaving ? 'A guardar...' : 'Guardar Recurso'}
                    </Button>
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
          
          <ResourceGrid resources={filterByPillar('all')} onView={handleView} onDownload={handleDownload} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </TabsContent>
        
        <TabsContent value="saude_mental" className="mt-6">
          <ResourceGrid resources={filterByPillar('saude_mental')} onView={handleView} onDownload={handleDownload} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </TabsContent>
        
        <TabsContent value="bem_estar_fisico" className="mt-6">
          <ResourceGrid resources={filterByPillar('bem_estar_fisico')} onView={handleView} onDownload={handleDownload} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </TabsContent>
        
        <TabsContent value="assistencia_financeira" className="mt-6">
          <ResourceGrid resources={filterByPillar('assistencia_financeira')} onView={handleView} onDownload={handleDownload} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </TabsContent>
        
        <TabsContent value="assistencia_juridica" className="mt-6">
          <ResourceGrid resources={filterByPillar('assistencia_juridica')} onView={handleView} onDownload={handleDownload} onEdit={handleEditClick} onDelete={handleDeleteClick} />
        </TabsContent>
      </Tabs>
      
      <ResourceModal resource={selectedResource} open={modalOpen} onClose={() => setModalOpen(false)} onDownload={handleDownload} />

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Recurso</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Título do recurso"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Descrição do recurso"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pilar</Label>
                <Select
                  value={editFormData.pillar}
                  onValueChange={(value) => setEditFormData({ ...editFormData, pillar: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saude_mental">Saúde Mental</SelectItem>
                    <SelectItem value="bem_estar_fisico">Bem-Estar Físico</SelectItem>
                    <SelectItem value="assistencia_financeira">Assistência Financeira</SelectItem>
                    <SelectItem value="assistencia_juridica">Assistência Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Artigo</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                    <SelectItem value="guide">Guia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar o recurso "{resourceToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResourceToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
