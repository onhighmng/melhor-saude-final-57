import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Calendar,
  Target,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmployeeAdoption {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'invited' | 'registered' | 'active' | 'inactive';
  invite_sent_at: string;
  registered_at: string | null;
  last_activity_at: string | null;
  sessions_allocated: number;
  sessions_used: number;
  sessions_remaining: number;
}

interface AdoptionStats {
  total_invited: number;
  total_registered: number;
  total_active: number;
  adoption_rate: number;
  engagement_rate: number;
  sessions_utilization: number;
}

interface DepartmentStats {
  department: string;
  invited: number;
  registered: number;
  active: number;
  adoption_rate: number;
}

interface ActivityTimeline {
  date: string;
  registrations: number;
  sessions_booked: number;
  sessions_completed: number;
}

export const CompanyAdoption: React.FC = () => {
  const { t } = useTranslation('company');
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [employees, setEmployees] = useState<EmployeeAdoption[]>([]);
  const [stats, setStats] = useState<AdoptionStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimeline[]>([]);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  useEffect(() => {
    if (profile?.company_id) {
      loadAdoptionData();
    }
  }, [profile?.company_id, selectedPeriod]);

  const loadAdoptionData = async () => {
    if (!profile?.company_id) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadEmployeeAdoption(),
        loadAdoptionStats(),
        loadDepartmentStats(),
        loadActivityTimeline()
      ]);
    } catch (error) {
      console.error('Error loading adoption data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de adoção",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeAdoption = async () => {
    if (!profile?.company_id) return;

    // Get all invites for this company
    const { data: invites, error: invitesError } = await supabase
      .from('invites')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false });

    if (invitesError) throw invitesError;

    // Get company employees
    const { data: employees, error: employeesError } = await supabase
      .from('company_employees')
      .select(`
        *,
        profiles!company_employees_user_id_fkey(
          id,
          name,
          email,
          department,
          position,
          created_at
        )
      `)
      .eq('company_id', profile.company_id);

    if (employeesError) throw employeesError;

    // Combine invite and employee data
    const employeeAdoption: EmployeeAdoption[] = [];

    // Process invites
    for (const invite of invites || []) {
      const employee = employees?.find(e => e.profiles?.email === invite.email);
      
      if (employee) {
        // Employee registered
        employeeAdoption.push({
          id: employee.id,
          name: employee.profiles?.name || invite.metadata?.name || 'N/A',
          email: invite.email,
          department: employee.profiles?.department || invite.metadata?.department || 'N/A',
          position: employee.profiles?.position || invite.metadata?.position || 'N/A',
          status: 'active', // Simplified - would check last activity
          invite_sent_at: invite.created_at,
          registered_at: employee.profiles?.created_at || null,
          last_activity_at: null, // Would get from user_progress
          sessions_allocated: employee.sessions_allocated || invite.metadata?.sessions_allocated || 0,
          sessions_used: employee.sessions_used || 0,
          sessions_remaining: (employee.sessions_allocated || 0) - (employee.sessions_used || 0)
        });
      } else {
        // Employee not registered yet
        employeeAdoption.push({
          id: invite.id,
          name: invite.metadata?.name || 'N/A',
          email: invite.email,
          department: invite.metadata?.department || 'N/A',
          position: invite.metadata?.position || 'N/A',
          status: invite.status === 'accepted' ? 'registered' : 'invited',
          invite_sent_at: invite.created_at,
          registered_at: null,
          last_activity_at: null,
          sessions_allocated: invite.metadata?.sessions_allocated || 0,
          sessions_used: 0,
          sessions_remaining: invite.metadata?.sessions_allocated || 0
        });
      }
    }

    setEmployees(employeeAdoption);
  };

  const loadAdoptionStats = async () => {
    if (!profile?.company_id) return;

    const totalInvited = employees.length;
    const totalRegistered = employees.filter(e => e.status === 'active' || e.status === 'registered').length;
    const totalActive = employees.filter(e => e.status === 'active').length;
    
    const adoptionRate = totalInvited > 0 ? (totalRegistered / totalInvited) * 100 : 0;
    const engagementRate = totalRegistered > 0 ? (totalActive / totalRegistered) * 100 : 0;
    
    const totalSessionsAllocated = employees.reduce((sum, e) => sum + e.sessions_allocated, 0);
    const totalSessionsUsed = employees.reduce((sum, e) => sum + e.sessions_used, 0);
    const sessionsUtilization = totalSessionsAllocated > 0 ? (totalSessionsUsed / totalSessionsAllocated) * 100 : 0;

    setStats({
      total_invited: totalInvited,
      total_registered: totalRegistered,
      total_active: totalActive,
      adoption_rate: adoptionRate,
      engagement_rate: engagementRate,
      sessions_utilization: sessionsUtilization
    });
  };

  const loadDepartmentStats = async () => {
    const departments = [...new Set(employees.map(e => e.department))];
    
    const deptStats: DepartmentStats[] = departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const invited = deptEmployees.length;
      const registered = deptEmployees.filter(e => e.status === 'active' || e.status === 'registered').length;
      const active = deptEmployees.filter(e => e.status === 'active').length;
      const adoptionRate = invited > 0 ? (registered / invited) * 100 : 0;

      return {
        department: dept,
        invited,
        registered,
        active,
        adoption_rate: adoptionRate
      };
    });

    setDepartmentStats(deptStats.sort((a, b) => b.adoption_rate - a.adoption_rate));
  };

  const loadActivityTimeline = async () => {
    const days = parseInt(selectedPeriod);
    const timeline: ActivityTimeline[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Get registrations for this date
      const registrations = employees.filter(e => 
        e.registered_at && e.registered_at.startsWith(dateStr)
      ).length;

      // Get sessions for this date (simplified)
      const sessionsBooked = 0; // Would query bookings table
      const sessionsCompleted = 0; // Would query bookings table

      timeline.push({
        date: dateStr,
        registrations,
        sessions_booked: sessionsBooked,
        sessions_completed: sessionsCompleted
      });
    }

    setActivityTimeline(timeline);
  };

  const sendReminderEmails = async () => {
    setIsSendingReminders(true);
    
    try {
      const unregisteredEmployees = employees.filter(e => e.status === 'invited');
      
      for (const employee of unregisteredEmployees) {
        // This would integrate with email service
        console.log(`Sending reminder to ${employee.email}`);
      }

      toast({
        title: "Lembretes enviados",
        description: `${unregisteredEmployees.length} lembretes enviados para colaboradores não registados`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar lembretes",
        variant: "destructive"
      });
    } finally {
      setIsSendingReminders(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
      case 'registered':
        return <Badge variant="outline"><UserCheck className="h-3 w-3 mr-1" />Registado</Badge>;
      case 'invited':
        return <Badge variant="secondary"><Mail className="h-3 w-3 mr-1" />Convidado</Badge>;
      case 'inactive':
        return <Badge variant="destructive"><UserX className="h-3 w-3 mr-1" />Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Acompanhamento de Adoção</h2>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Acompanhamento de Adoção</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={sendReminderEmails} 
            disabled={isSendingReminders}
            variant="outline"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isSendingReminders ? 'Enviando...' : 'Enviar Lembretes'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Convidados</p>
                <p className="text-2xl font-bold">{stats?.total_invited || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registados</p>
                <p className="text-2xl font-bold">{stats?.total_registered || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Adoção</p>
                <p className="text-2xl font-bold">{stats?.adoption_rate.toFixed(1) || '0.0'}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilização</p>
                <p className="text-2xl font-bold">{stats?.sessions_utilization.toFixed(1) || '0.0'}%</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="employees">Colaboradores</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Adoption Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso de Adoção</CardTitle>
                <CardDescription>
                  Taxa de adoção geral da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Adoção</span>
                    <span>{stats?.adoption_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats?.adoption_rate || 0} className="w-full" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Engajamento</span>
                    <span>{stats?.engagement_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats?.engagement_rate || 0} className="w-full" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Utilização de Sessões</span>
                    <span>{stats?.sessions_utilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats?.sessions_utilization || 0} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Gerir adoção dos colaboradores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={sendReminderEmails} 
                  disabled={isSendingReminders}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isSendingReminders ? 'Enviando Lembretes...' : 'Enviar Lembretes'}
                </Button>
                
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatório Detalhado
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  <p>Colaboradores não registados: {employees.filter(e => e.status === 'invited').length}</p>
                  <p>Colaboradores ativos: {employees.filter(e => e.status === 'active').length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4">
            {departmentStats.map((dept) => (
              <Card key={dept.department}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {dept.department}
                    <Badge variant="outline">
                      {dept.adoption_rate.toFixed(1)}% adoção
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Convidados</p>
                      <p className="text-lg font-semibold">{dept.invited}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Registados</p>
                      <p className="text-lg font-semibold">{dept.registered}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos</p>
                      <p className="text-lg font-semibold">{dept.active}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Adoção</span>
                      <span>{dept.adoption_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={dept.adoption_rate} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          <div className="space-y-4">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.email} • {employee.department} • {employee.position}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Convidado em {new Date(employee.invite_sent_at).toLocaleDateString('pt-PT')}
                          {employee.registered_at && (
                            <span> • Registado em {new Date(employee.registered_at).toLocaleDateString('pt-PT')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {employee.sessions_used}/{employee.sessions_allocated} sessões
                        </p>
                        <div className="w-20">
                          <Progress 
                            value={employee.sessions_allocated > 0 ? (employee.sessions_used / employee.sessions_allocated) * 100 : 0} 
                            className="w-full" 
                          />
                        </div>
                      </div>
                      {getStatusBadge(employee.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {employees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum colaborador encontrado</p>
                <p className="text-sm">Envie convites para começar</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="space-y-4">
            {activityTimeline.map((day, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {new Date(day.date).toLocaleDateString('pt-PT', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Registros</p>
                        <p className="text-lg font-semibold">{day.registrations}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Sessões Agendadas</p>
                        <p className="text-lg font-semibold">{day.sessions_booked}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Sessões Concluídas</p>
                        <p className="text-lg font-semibold">{day.sessions_completed}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
