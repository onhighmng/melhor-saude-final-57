import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtraService {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceRequest {
  id: string;
  service_id: string;
  user_name: string;
  user_email: string;
  message: string;
  status: string;
  created_at: string;
  extra_services: {
    name: string;
  };
}

const CATEGORIES = [
  'Documentos',
  'Terapia',
  'Avaliação',
  'Workshop',
  'Emergência',
  'Nutrição',
  'Outros'
];

export const ExtraServicesManagement = () => {
  const [services, setServices] = useState<ExtraService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ExtraService | null>(null);
  const [selectedTab, setSelectedTab] = useState<'services' | 'requests'>('services');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    is_active: true
  });

  useEffect(() => {
    fetchServices();
    fetchRequests();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('extra_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          extra_services (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        const { error } = await supabase
          .from('extra_services')
          .update(formData)
          .eq('id', editingService.id);
        
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Serviço atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('extra_services')
          .insert([formData]);
        
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Serviço criado com sucesso!",
        });
      }
      
      setFormData({ name: '', description: '', category: '', is_active: true });
      setIsAddDialogOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (service: ExtraService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      is_active: service.is_active
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        const { error } = await supabase
          .from('extra_services')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Serviço excluído com sucesso!",
        });
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o serviço.",
          variant: "destructive",
        });
      }
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', requestId);
      
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy-blue">Gestão de Serviços Extras</h2>
        <div className="flex gap-4">
          <Button
            variant={selectedTab === 'services' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('services')}
          >
            Serviços ({services.length})
          </Button>
          <Button
            variant={selectedTab === 'requests' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('requests')}
          >
            Solicitações ({requests.length})
          </Button>
        </div>
      </div>

      {selectedTab === 'services' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Serviços Disponíveis</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingService(null);
                    setFormData({ name: '', description: '', category: '', is_active: true });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Nome do serviço"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Textarea
                    placeholder="Descrição"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <label htmlFor="is_active">Serviço ativo</label>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingService ? 'Atualizar' : 'Criar'} Serviço
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.extra_services?.name}
                    </TableCell>
                    <TableCell>{request.user_name}</TableCell>
                    <TableCell>{request.user_email}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === 'pending' && 'Pendente'}
                        {request.status === 'in_progress' && 'Em Andamento'}
                        {request.status === 'completed' && 'Concluído'}
                        {request.status === 'cancelled' && 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value) => updateRequestStatus(request.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};