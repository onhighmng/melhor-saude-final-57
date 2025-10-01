import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminCard, AdminGrid, AdminFormRow, AdminTableWrapper } from './ResponsiveAdminLayout';
import { Plus, Building, Users, Settings, UserPlus, Eye, EyeOff, RefreshCw, Power, PowerOff, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from '@/utils/errorMessages';

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  planType: string;
  totalSessions: number;
  description: string;
}

interface CompanyManagementProps {
  companies: Array<{
    name: string;
    users: any[];
    totalSessions: number;
    usedSessions: number;
    is_active?: boolean;
    contact_email?: string;
    contact_phone?: string;
    plan_type?: string;
    sessions_allocated?: number;
    final_notes?: string;
  }>;
  onCreateCompany: (companyData: CompanyData) => Promise<void>;
  onUpdateCompany: (companyName: string, updates: Partial<CompanyData>) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

const CompanyManagement = ({ companies, onCreateCompany, onUpdateCompany, onRefresh }: CompanyManagementProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHRForm, setShowHRForm] = useState(false);
  const [isCreatingHR, setIsCreatingHR] = useState(false);
  const { toast } = useToast();

  // Debug: log companies to console
  console.log('Companies received in CompanyManagement:', companies);

  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    email: '',
    phone: '',
    planType: 'basic',
    totalSessions: 0,
    description: ''
  });

  const [hrCredentials, setHRCredentials] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const [hrFormData, setHRFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      planType: 'basic',
      totalSessions: 0,
      description: ''
    });
    setHRCredentials({
      email: '',
      password: ''
    });
  };

  const createHRUserAndSendEmail = async (companyName: string) => {
    if (!hrCredentials.email || !hrCredentials.password) {
      return;
    }

    try {
      // Call edge function to create HR user
      const { data, error } = await supabase.functions.invoke('create-hr-user', {
        body: {
          email: hrCredentials.email,
          password: hrCredentials.password,
          companyName: companyName,
          loginUrl: 'https://jjgsucleibzqvccjnlov.lovableproject.com/login'
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create HR user');
      }

      return data;
    } catch (error: any) {
      console.error('Error creating HR user:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCompany) {
        await onUpdateCompany(editingCompany, formData);
        toast({
          title: "Empresa atualizada!",
          description: "As informações da empresa foram atualizadas com sucesso."
        });
        setEditingCompany(null);
      } else {
        // Create company first
        await onCreateCompany(formData);
        
        // Create HR user if credentials provided
        if (hrCredentials.email && hrCredentials.password) {
          const hrResult = await createHRUserAndSendEmail(formData.name);
          if (hrResult && hrResult.isExistingUser) {
            toast({
              title: "Empresa criada e utilizador atualizado!",
              description: `Empresa ${formData.name} foi criada com sucesso e o utilizador existente ${hrCredentials.email} foi atualizado para HR.`
            });
          } else {
            toast({
              title: "Empresa e HR criados!",
              description: `Empresa ${formData.name} foi criada com sucesso e o utilizador HR foi notificado por email.`
            });
          }
        } else {
          toast({
            title: "Empresa criada!",
            description: `Empresa ${formData.name} foi criada com sucesso.`
          });
        }
        setShowCreateForm(false);
      }
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (company: any) => {
    setFormData({
      name: company.name,
      email: company.contact_email || '',
      phone: company.contact_phone || '',
      planType: company.plan_type || 'basic',
      totalSessions: company.sessions_allocated || company.totalSessions || 0,
      description: company.final_notes || ''
    });
    setEditingCompany(company.name);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCompany(null);
    resetForm();
  };

  const resetHRForm = () => {
    setHRFormData({
      name: '',
      email: '',
      password: '',
      company: ''
    });
  };

  const handleHRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingHR(true);

    try {
      // Create user in auth with auto-verification
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: hrFormData.email,
        password: hrFormData.password,
        email_confirm: true,
        user_metadata: { name: hrFormData.name }
      });

      if (authError) {
        throw authError;
      }

      // Update profile with HR role and company assignment
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name: hrFormData.name,
          role: 'hr',
          company: hrFormData.company
        })
        .eq('user_id', authUser.user.id);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Utilizador HR criado!",
        description: `Conta HR para ${hrFormData.name} foi criada com sucesso e atribuída à empresa ${hrFormData.company}.`
      });

      resetHRForm();
      setShowHRForm(false);
    } catch (error: any) {
      console.error('Error creating HR user:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar utilizador HR. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingHR(false);
    }
  };

  const handleHRCancel = () => {
    setShowHRForm(false);
    resetHRForm();
  };

  const handleCompanyStatusChange = async (company: any, isActive: boolean) => {
    try {
      // Enhanced company object debugging
      console.log('=== COMPANY STATUS CHANGE DEBUG ===');
      console.log('Full company object:', company);
      console.log('Company ID details:', {
        id: company.id,
        typeof_id: typeof company.id,
        id_length: company.id ? company.id.length : 'N/A',
        id_is_null: company.id === null,
        id_is_undefined: company.id === undefined,
        id_string_value: String(company.id),
        id_boolean_check: !!company.id
      });
      console.log('Company name:', company.name);
      console.log('Target status (isActive):', isActive);
      console.log('==================================');
      
      // Comprehensive validation: Ensure company.id exists and is not null/undefined
      if (!company.id || company.id === null || company.id === undefined) {
        console.error('Company ID validation failed:', {
          id: company.id,
          name: company.name,
          fullObject: company
        });
        toast({
          title: "Erro de Validação",
          description: `ID da empresa "${company.name || 'desconhecida'}" está ausente ou inválido. Não é possível atualizar o status da empresa.`,
          variant: "destructive"
        });
        return;
      }

      // Ensure company name exists
      if (!company.name || company.name.trim() === '') {
        console.error('Company name validation failed:', company);
        toast({
          title: "Erro de Validação",
          description: "Nome da empresa não encontrado ou vazio. Não é possível atualizar o status.",
          variant: "destructive"
        });
        return;
      }

      // Log the payload being sent to the edge function
      const payload = {
        action: 'update_status',
        company_id: company.id,
        company_name: company.name,
        is_active: isActive
      };
      console.log('=== PAYLOAD DEBUG ===');
      console.log('Payload object:', payload);
      console.log('Payload JSON string:', JSON.stringify(payload));
      console.log('Payload company_id type:', typeof payload.company_id);
      console.log('Payload company_id value:', payload.company_id);
      console.log('===================');

      const { data, error } = await supabase.functions.invoke('admin-companies', {
        body: payload
      });

      console.log('Edge function response:', { data, error });
      
      if (error) {
        console.error('Edge function error details:', error);
        throw error;
      }

      console.log('Status update successful:', data);

      toast({
        title: isActive ? "Empresa ativada!" : "Empresa desativada!",
        description: `A empresa "${company.name}" foi ${isActive ? 'ativada' : 'desativada'} com sucesso. Todos os utilizadores associados também foram ${isActive ? 'ativados' : 'desativados'}.`
      });

      // Force-refresh the company list to reflect the new state immediately
      console.log('Force-refreshing company list...');
      if (onRefresh) {
        await onRefresh();
        console.log('Company list refresh completed');
      } else {
        console.warn('onRefresh callback not available - manual refresh may be required');
      }

    } catch (error: any) {
      console.error('Error updating company status:', {
        error: error,
        errorMessage: error.message,
        company: company,
        targetStatus: isActive
      });
      
      toast({
        title: "Erro ao Atualizar Status",
        description: `Falha ao ${isActive ? 'ativar' : 'desativar'} a empresa "${company.name || 'desconhecida'}": ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <AdminCard
      title="Gestão de Empresas"
      description="Criar e gerir empresas e seus utilizadores"
    >
      <AdminFormRow>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? 'Cancelar' : 'Nova Empresa'}
        </Button>
        
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isSubmitting}
            className="mb-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        )}
        
        {!showHRForm && (
          <Button 
            variant="outline" 
            onClick={() => setShowHRForm(true)}
            className="mb-4"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Criar HR
          </Button>
        )}
      </AdminFormRow>

      {showCreateForm && (
        <AdminCard title="Criar Nova Empresa">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminGrid columns={2}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={editingCompany !== null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email de Contacto *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalSessions">Total de Sessões</Label>
                <Input
                  id="totalSessions"
                  type="number"
                  min="0"
                  value={formData.totalSessions}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalSessions: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </AdminGrid>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Informações adicionais sobre a empresa..."
              />
            </div>

            <AdminFormRow className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'A processar...' : (editingCompany ? 'Atualizar' : 'Criar Empresa')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </AdminFormRow>
          </form>
        </AdminCard>
      )}

      {showHRForm && (
        <AdminCard title="Criar Utilizador HR">
          <form onSubmit={handleHRSubmit} className="space-y-4">
            <AdminGrid columns={2}>
              <div className="space-y-2">
                <Label htmlFor="hr-name">Nome Completo *</Label>
                <Input
                  id="hr-name"
                  value={hrFormData.name}
                  onChange={(e) => setHRFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Nome do utilizador HR"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hr-email">Email *</Label>
                <Input
                  id="hr-email"
                  type="email"
                  value={hrFormData.email}
                  onChange={(e) => setHRFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="email@empresa.com"
                />
              </div>
            </AdminGrid>

            <div className="space-y-2">
              <Label htmlFor="hr-company">Empresa *</Label>
              <select
                id="hr-company"
                value={hrFormData.company}
                onChange={(e) => setHRFormData(prev => ({ ...prev, company: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Selecione uma empresa</option>
                {companies.map((company) => (
                  <option key={company.name} value={company.name}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hr-password">Palavra-passe *</Label>
              <Input
                id="hr-password"
                type="password"
                value={hrFormData.password}
                onChange={(e) => setHRFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <AdminFormRow className="pt-4">
              <Button type="submit" disabled={isCreatingHR}>
                {isCreatingHR ? 'A criar...' : 'Criar Utilizador HR'}
              </Button>
              <Button type="button" variant="outline" onClick={handleHRCancel}>
                Cancelar
              </Button>
            </AdminFormRow>
          </form>
        </AdminCard>
      )}

      <AdminGrid columns={3}>
        {companies.map((company) => (
          <Card key={company.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Building className={`w-5 h-5 ${company.is_active === false ? 'text-destructive' : 'text-green-600'}`} />
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  {company.is_active === false && (
                    <Badge variant="destructive" className="text-xs">
                      Inativa
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(company)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCompanyStatusChange(company, !company.is_active)}
                    className={company.is_active === false ? "text-green-600 hover:text-green-700" : "text-destructive hover:text-destructive/80"}
                  >
                    {company.is_active === false ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Utilizadores:
                </span>
                <span className="font-medium">{company.users.length}</span>
              </div>

              {company.users.length > 0 && (
                <AdminTableWrapper>
                  <div className="space-y-1">
                    {company.users.slice(0, 3).map((user: any) => (
                      <div key={user.id} className="text-xs bg-muted/20 p-2 rounded flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-muted-foreground truncate">{user.email}</div>
                        </div>
                        <Badge variant={user.is_active ? "secondary" : "destructive"} className="text-xs ml-2">
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    ))}
                    {company.users.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{company.users.length - 3} mais utilizadores
                      </div>
                    )}
                  </div>
                </AdminTableWrapper>
              )}
            </CardContent>
          </Card>
        ))}
      </AdminGrid>

      {companies.length === 0 && !showCreateForm && (
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma empresa encontrada</h3>
          <p className="text-muted-foreground mb-4">Comece criando a primeira empresa do sistema.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Empresa
          </Button>
        </div>
      )}
    </AdminCard>
  );
};

export default CompanyManagement;