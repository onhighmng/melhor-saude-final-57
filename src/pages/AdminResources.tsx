import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, FileText, Video, File } from 'lucide-react';
export default function AdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pillar: 'saude_mental',
    resource_type: 'article',
    url: '',
    thumbnail_url: '',
    is_active: true
  });
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        toast.error('Você precisa estar autenticado como admin para ver recursos');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading resources:', error);
        // Check if it's a permission error (404 often means RLS blocking)
        if (error.message.includes('permission') || error.code === 'PGRST301') {
          toast.error('Você não tem permissão para ver recursos. Certifique-se de ter role de admin.');
        } else {
          throw error;
        }
        return;
      }
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Erro ao carregar recursos');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      let finalUrl = formData.url;
      let finalThumbnailUrl = formData.thumbnail_url;

      // Upload resource file if provided
      if (resourceFile) {
        setUploadingResource(true);
        const uploadedUrl = await uploadFile(resourceFile, 'resources', 'resource');
        if (uploadedUrl) {
          finalUrl = uploadedUrl;
        } else {
          toast.error('Erro ao fazer upload do ficheiro');
          setUploadingResource(false);
          return;
        }
        setUploadingResource(false);
      }

      // Upload thumbnail file if provided
      if (thumbnailFile) {
        setUploadingThumbnail(true);
        const uploadedUrl = await uploadFile(thumbnailFile, 'resources', 'thumbnail');
        if (uploadedUrl) {
          finalThumbnailUrl = uploadedUrl;
        } else {
          toast.error('Erro ao fazer upload da thumbnail');
          setUploadingThumbnail(false);
          return;
        }
        setUploadingThumbnail(false);
      }
      
      if (editingResource) {
        const { error } = await supabase
          .from('resources')
          .update({
            ...formData,
            url: finalUrl,
            thumbnail_url: finalThumbnailUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResource.id);

        if (error) throw error;
        toast.success('Recurso atualizado');
      } else {
        const insertData = {
          ...formData,
          url: finalUrl,
          thumbnail_url: finalThumbnailUrl
        };
        
        console.log('=== INSERTING RESOURCE ===');
        console.log('Data being sent:', insertData);
        console.log('resource_type:', insertData.resource_type);
        console.log('=========================');
        
        const { error } = await supabase
          .from('resources')
          .insert(insertData);

        if (error) {
          console.error('Error saving resource:', error);
          console.error('Data that failed:', insertData);
          throw error;
        }
        toast.success('Recurso criado');
      }

      setDialogOpen(false);
      resetForm();
      loadResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Erro ao guardar recurso');
    }
  };

  const handleEdit = (resource: any) => {
    setEditingResource(resource);
    
    // Convert old 'pdf' type to 'guide'
    let resourceType = resource.resource_type;
    if (resourceType === 'pdf') {
      resourceType = 'guide';
    }
    
    setFormData({
      title: resource.title,
      description: resource.description || '',
      pillar: resource.pillar,
      resource_type: resourceType,
      url: resource.url || '',
      thumbnail_url: resource.thumbnail_url || '',
      is_active: resource.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este recurso?')) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Recurso eliminado');
      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Erro ao eliminar recurso');
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      pillar: 'saude_mental',
      resource_type: 'article',
      url: '',
      thumbnail_url: '',
      is_active: true
    });
    setResourceFile(null);
    setThumbnailFile(null);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'guide': return <File className="h-4 w-4" />;
      case 'worksheet': return <File className="h-4 w-4" />;
      case 'exercise': return <FileText className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Recursos</h1>
          <p className="text-muted-foreground">Gerir artigos, vídeos e PDFs</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Recurso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(resource => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getResourceIcon(resource.resource_type)}
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                </div>
                <Badge variant={resource.is_active ? 'default' : 'secondary'}>
                  {resource.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {resource.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{resource.pillar}</Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(resource)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(resource.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? 'Editar Recurso' : 'Novo Recurso'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required

              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}

              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pilar</Label>
                <Select
                  value={formData.pillar}
                  onValueChange={(value) => setFormData({...formData, pillar: value})}
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
              <div>
                <Label>Tipo</Label>
                <Select
                  value={formData.resource_type}
                  onValueChange={(value) => setFormData({...formData, resource_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Artigo (PDF, DOC, DOCX)</SelectItem>
                    <SelectItem value="video">Vídeo (MP4, MOV, AVI)</SelectItem>
                    <SelectItem value="guide">Guia (PDF, DOC, DOCX)</SelectItem>
                    <SelectItem value="exercise">Exercício (PDF, DOC, DOCX)</SelectItem>
                    <SelectItem value="worksheet">Folha de Trabalho (PDF, DOC, DOCX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>URL ou Upload de Ficheiro</Label>
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://exemplo.com/recurso.pdf"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  disabled={!!resourceFile}

                />
                <div className="text-sm text-muted-foreground text-center">ou</div>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.mp4,.mov,.avi"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setResourceFile(file);
                      setFormData({...formData, url: ''});
                    }
                  }}

                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceites: PDF, DOC, DOCX (documentos) | MP4, MOV, AVI (vídeos)
                </p>
                {resourceFile && (
                  <p className="text-sm text-green-600">✓ Ficheiro selecionado: {resourceFile.name}</p>
                )}
                {uploadingResource && (
                  <p className="text-sm text-blue-600">A fazer upload...</p>
                )}
              </div>
            </div>
            <div>
              <Label>Thumbnail (Upload de Imagem)</Label>
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg (opcional)"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                  disabled={!!thumbnailFile}

                />
                <div className="text-sm text-muted-foreground text-center">ou</div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setThumbnailFile(file);
                      setFormData({...formData, thumbnail_url: ''});
                    }
                  }}

                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceites: JPG, PNG, WEBP, GIF (imagens)
                </p>
                {thumbnailFile && (
                  <p className="text-sm text-green-600">✓ Imagem selecionada: {thumbnailFile.name}</p>
                )}
                {uploadingThumbnail && (
                  <p className="text-sm text-blue-600">A fazer upload...</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}

              />
              <Label htmlFor="is_active">Recurso ativo</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingResource ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
