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

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Erro ao carregar recursos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userData = await supabase.auth.getUser();
      
      if (editingResource) {
        const { error } = await supabase
          .from('resources')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResource.id);

        if (error) throw error;
        toast.success('Recurso atualizado');
      } else {
        const { error } = await supabase
          .from('resources')
          .insert({
            ...formData,
            created_by: userData.data.user?.id
          });

        if (error) throw error;
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
    setFormData({
      title: resource.title,
      description: resource.description || '',
      pillar: resource.pillar,
      resource_type: resource.resource_type,
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
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'pdf': return <File className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                    <SelectItem value="article">Artigo</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>URL</Label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>
            <div>
              <Label>URL da Thumbnail</Label>
              <Input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
              />
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
