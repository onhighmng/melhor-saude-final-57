import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmployeeQuota {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  sessions_allocated: number;
  sessions_used: number;
  sessions_remaining: number;
  is_active: boolean;
  joined_at: string;
}

interface QuotaSettings {
  session_model: 'pool' | 'fixed';
  sessions_per_employee: number;
  auto_refresh: boolean;
  refresh_period: 'monthly' | 'quarterly' | 'annually';
  alert_threshold: number; // Percentage when to alert
}

interface QuotaHistory {
  id: string;
  user_id: string;
  action: 'allocated' | 'used' | 'refreshed' | 'adjusted';
  old_value: number;
  new_value: number;
  reason: string;
  created_at: string;
  created_by: string;
}

export const SessionQuotaManager: React.FC = () => {
  const { t } = useTranslation('company');
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeQuota[]>([]);
  const [quotaSettings, setQuotaSettings] = useState<QuotaSettings>({
    session_model: 'pool',
    sessions_per_employee: 6,
    auto_refresh: true,
    refresh_period: 'monthly',
    alert_threshold: 80
  });
  const [quotaHistory, setQuotaHistory] = useState<QuotaHistory[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeQuota | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    if (profile?.company_id) {
      loadQuotaData();
    }
  }, [profile?.company_id]);

  const loadQuotaData = async () => {
    if (!profile?.company_id) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadEmployeeQuotas(),
        loadQuotaSettings(),
        loadQuotaHistory()
      ]);
    } catch (error) {
      console.error('Error loading quota data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de quotas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeQuotas = async () => {
    if (!profile?.company_id) return;

    const { data, error } = await supabase
      .from('company_employees')
      .select(`
        id,
        user_id,
        sessions_allocated,
        sessions_used,
        is_active,
        joined_at
      `)
      .eq('company_id', profile.company_id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    const employeeQuotas: EmployeeQuota[] = (data || []).map(emp => ({
      id: emp.id,
      user_id: emp.user_id,
      name: 'Colaborador', // Will be fetched separately if needed
      email: 'N/A',
      department: 'N/A',
      position: 'N/A',
      sessions_allocated: emp.sessions_allocated || 0,
      sessions_used: emp.sessions_used || 0,
      sessions_remaining: (emp.sessions_allocated || 0) - (emp.sessions_used || 0),
      is_active: emp.is_active,
      joined_at: emp.joined_at
    }));

    setEmployees(employeeQuotas);
  };

  const loadQuotaSettings = async () => {
    if (!profile?.company_id) return;

    // Columns session_model and sessions_per_employee don't exist
    // Using default values
    setQuotaSettings(prev => ({
      ...prev,
      session_model: 'pool',
      sessions_per_employee: 6
    }));
  };

  const loadQuotaHistory = async () => {
    if (!profile?.company_id) return;

    // This would be a separate table for quota history
    // For now, we'll simulate it
    setQuotaHistory([]);
  };

  const updateQuotaSettings = async () => {
    if (!profile?.company_id) return;

    setIsUpdating(true);
    try {
      // Columns session_model and sessions_per_employee don't exist in companies table
      // Quota settings updated locally only
      
      toast({
        title: "Configurações atualizadas",
        description: "As configurações de quota foram atualizadas localmente"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar configurações",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const adjustEmployeeQuota = async () => {
    if (!selectedEmployee || !profile?.company_id) return;

    setIsUpdating(true);
    try {
      const newAllocated = selectedEmployee.sessions_allocated + adjustmentValue;
      
      if (newAllocated < 0) {
        toast({
          title: "Erro",
          description: "A quota não pode ser negativa",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('company_employees')
        .update({
          sessions_allocated: newAllocated
        })
        .eq('id', selectedEmployee.id);

      if (error) throw error;

      // Log the adjustment
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: profile.id,
          action: 'quota_adjusted',
          entity_type: 'company_employee',
          entity_id: selectedEmployee.id,
          details: {
            old_value: selectedEmployee.sessions_allocated,
            new_value: newAllocated,
            reason: adjustmentReason,
            employee_name: selectedEmployee.name
          }
        });

      toast({
        title: "Quota ajustada",
        description: `Quota de ${selectedEmployee.name} ajustada para ${newAllocated} sessões`
      });

      setIsAdjustmentOpen(false);
      setSelectedEmployee(null);
      setAdjustmentValue(0);
      setAdjustmentReason('');
      loadEmployeeQuotas();

    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao ajustar quota",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const refreshAllQuotas = async () => {
    if (!profile?.company_id) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('company_employees')
        .update({
          sessions_allocated: quotaSettings.sessions_per_employee,
          sessions_used: 0
        })
        .eq('company_id', profile.company_id)
        .eq('is_active', true);

      if (error) throw error;

      toast({
        title: "Quotas renovadas",
        description: `Todas as quotas foram renovadas para ${quotaSettings.sessions_per_employee} sessões`
      });

      loadEmployeeQuotas();

    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao renovar quotas",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getQuotaStatus = (employee: EmployeeQuota) => {
    const usagePercentage = employee.sessions_allocated > 0 
      ? (employee.sessions_used / employee.sessions_allocated) * 100 
      : 0;

    if (usagePercentage >= quotaSettings.alert_threshold) {
      return { status: 'warning', color: 'text-orange-500', icon: AlertTriangle };
    } else if (usagePercentage >= 50) {
      return { status: 'moderate', color: 'text-blue-500', icon: Clock };
    } else {
      return { status: 'good', color: 'text-green-500', icon: CheckCircle };
    }
  };

  const getTotalStats = () => {
    const totalAllocated = employees.reduce((sum, emp) => sum + emp.sessions_allocated, 0);
    const totalUsed = employees.reduce((sum, emp) => sum + emp.sessions_used, 0);
    const totalRemaining = totalAllocated - totalUsed;
    const utilizationRate = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

    return {
      totalAllocated,
      totalUsed,
      totalRemaining,
      utilizationRate
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestão de Quotas de Sessões</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de Quotas de Sessões</h2>
        <div className="flex gap-2">
          <Button 
            onClick={refreshAllQuotas} 
            disabled={isUpdating}
            variant="outline"
          >
            <Target className="h-4 w-4 mr-2" />
            {isUpdating ? 'Renovando...' : 'Renovar Todas'}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações de Quota</DialogTitle>
                <DialogDescription>
                  Configure como as quotas de sessões são geridas
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-model">Modelo de Sessões</Label>
                  <Select 
                    value={quotaSettings.session_model} 
                    onValueChange={(value: 'pool' | 'fixed') => 
                      setQuotaSettings(prev => ({ ...prev, session_model: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pool">Pool Compartilhado</SelectItem>
                      <SelectItem value="fixed">Quota Fixa por Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessions-per-employee">Sessões por Colaborador</Label>
                  <Input
                    id="sessions-per-employee"
                    type="number"
                    min="1"
                    max="50"
                    value={quotaSettings.sessions_per_employee}
                    onChange={(e) => setQuotaSettings(prev => ({ 
                      ...prev, 
                      sessions_per_employee: parseInt(e.target.value) || 6 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Limiar de Alerta (%)</Label>
                  <Input
                    id="alert-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={quotaSettings.alert_threshold}
                    onChange={(e) => setQuotaSettings(prev => ({ 
                      ...prev, 
                      alert_threshold: parseInt(e.target.value) || 80 
                    }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAdjustmentOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={updateQuotaSettings} disabled={isUpdating}>
                    {isUpdating ? 'Atualizando...' : 'Atualizar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alocado</p>
                <p className="text-2xl font-bold">{stats.totalAllocated}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usado</p>
                <p className="text-2xl font-bold">{stats.totalUsed}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Restante</p>
                <p className="text-2xl font-bold">{stats.totalRemaining}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Utilização</p>
                <p className="text-2xl font-bold">{stats.utilizationRate.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Quotas */}
      <Card>
        <CardHeader>
          <CardTitle>Quotas por Colaborador</CardTitle>
          <CardDescription>
            Gerir quotas individuais de sessões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => {
              const quotaStatus = getQuotaStatus(employee);
              const StatusIcon = quotaStatus.icon;
              
              return (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.email} • {employee.department} • {employee.position}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Entrou em {new Date(employee.joined_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {employee.sessions_used}/{employee.sessions_allocated} sessões
                      </p>
                      <div className="w-32">
                        <Progress 
                          value={employee.sessions_allocated > 0 ? (employee.sessions_used / employee.sessions_allocated) * 100 : 0} 
                          className="w-full" 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {employee.sessions_remaining} restantes
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${quotaStatus.color}`} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsAdjustmentOpen(true);
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {employees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum colaborador encontrado</p>
                <p className="text-sm">Adicione colaboradores para gerir quotas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quota Adjustment Dialog */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Quota</DialogTitle>
            <DialogDescription>
              Ajustar quota de sessões para {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded">
              <p className="text-sm text-muted-foreground">Quota atual:</p>
              <p className="font-medium">{selectedEmployee?.sessions_allocated} sessões</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adjustment-value">Ajuste (+/-)</Label>
              <Input
                id="adjustment-value"
                type="number"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(parseInt(e.target.value) || 0)}
                placeholder="Ex: +2 ou -1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adjustment-reason">Motivo</Label>
              <Input
                id="adjustment-reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Ex: Promoção, projeto especial, etc."
              />
            </div>
            
            {adjustmentValue !== 0 && (
              <div className="p-4 bg-blue-50 rounded">
                <p className="text-sm font-medium">
                  Nova quota: {selectedEmployee?.sessions_allocated + adjustmentValue} sessões
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdjustmentOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={adjustEmployeeQuota} 
                disabled={isUpdating || adjustmentValue === 0}
              >
                {isUpdating ? 'Ajustando...' : 'Ajustar Quota'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
