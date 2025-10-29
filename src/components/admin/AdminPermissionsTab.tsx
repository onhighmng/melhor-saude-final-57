import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Lock, Key, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AccessLevel {
  id: string;
  name: string;
  description: string;
  permissions: {
    dashboard: boolean;
    users: boolean;
    companies: boolean;
    providers: boolean;
    sessions: boolean;
    reports: boolean;
    resources: boolean;
    settings: boolean;
    logs: boolean;
  };
}

const defaultAccessLevels: AccessLevel[] = [
  {
    id: 'super_admin',
    name: 'Super Administrador',
    description: 'Acesso total ao sistema',
    permissions: {
      dashboard: true,
      users: true,
      companies: true,
      providers: true,
      sessions: true,
      reports: true,
      resources: true,
      settings: true,
      logs: true,
    },
  },
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso a gestão operacional',
    permissions: {
      dashboard: true,
      users: true,
      companies: true,
      providers: true,
      sessions: true,
      reports: true,
      resources: true,
      settings: false,
      logs: true,
    },
  },
  {
    id: 'manager',
    name: 'Gestor',
    description: 'Acesso a gestão de utilizadores e sessões',
    permissions: {
      dashboard: true,
      users: true,
      companies: true,
      providers: false,
      sessions: true,
      reports: true,
      resources: false,
      settings: false,
      logs: false,
    },
  },
  {
    id: 'support',
    name: 'Suporte',
    description: 'Acesso limitado para suporte',
    permissions: {
      dashboard: true,
      users: true,
      companies: false,
      providers: false,
      sessions: true,
      reports: false,
      resources: false,
      settings: false,
      logs: false,
    },
  },
];

const AdminPermissionsTab = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const { profile } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<string>('admin');
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>(defaultAccessLevels);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadUserCounts();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'access_levels')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.setting_value) {
        const settings = data.setting_value as Record<string, unknown>;
        if (settings.access_levels) {
          setAccessLevels(settings.access_levels as AccessLevel[]);
        }
        if (settings.session_timeout) {
          setSessionTimeout((settings.session_timeout as number).toString());
        }
        if (typeof settings.two_factor_enabled === 'boolean') {
          setTwoFactorEnabled(settings.two_factor_enabled);
        }
      }
    } catch (error) {
      // Keep default values - silent fail
    }
  };

  const loadUserCounts = async () => {
    try {
      setLoading(true);

      // Count users per role (using valid database roles only)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .in('role', ['admin', 'hr', 'prestador', 'specialist', 'user']);

      if (error) throw error;

      const counts = (data || []).reduce((acc, role) => {
        acc[role.role] = (acc[role.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setUserCounts(counts);
    } catch (error) {
      console.error('Error loading user counts:', error);
      toast({
        title: 'Erro ao carregar contagens',
        description: 'Não foi possível carregar as contagens de utilizadores.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = accessLevels.find(level => level.id === selectedLevel);

  const handlePermissionToggle = (permission: keyof AccessLevel['permissions']) => {
    if (!currentLevel) return;

    setAccessLevels(prev =>
      prev.map(level =>
        level.id === selectedLevel
          ? {
              ...level,
              permissions: {
                ...level.permissions,
                [permission]: !level.permissions[permission],
              },
            }
          : level
      )
    );
  };

  const handleSaveChanges = async () => {
    try {
      if (!profile) {
        throw new Error('No profile found');
      }

      // Save access level definitions to platform_settings
      const { data: existingSettings } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('setting_key', 'access_levels')
        .maybeSingle();

      const settingValue = {
        access_levels: accessLevels,
        session_timeout: parseInt(sessionTimeout),
        two_factor_enabled: twoFactorEnabled,
        updated_by: profile.id,
        updated_at: new Date().toISOString()
      };

      if (existingSettings) {
        await supabase
          .from('platform_settings')
          .update({
            setting_value: settingValue as any,
            updated_by: profile.id
          })
          .eq('id', existingSettings.id);
      } else {
        await supabase
          .from('platform_settings')
          .insert({
            setting_key: 'access_levels',
            setting_type: 'json',
            setting_value: settingValue as any,
            description: 'Configuração de níveis de acesso e permissões',
            is_public: false,
            updated_by: profile.id
          });
      }

      // Log admin action
      if (profile?.id) {
        await supabase
          .from('admin_logs')
          .insert({
            admin_id: profile.id,
            action: 'update_platform_permissions',
            entity_type: 'platform_settings',
            details: { access_levels: accessLevels } as any
          });
      }

      toast({
        title: 'Permissões Atualizadas',
        description: 'As alterações foram guardadas com sucesso.',
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível guardar as alterações.',
        variant: 'destructive'
      });
    }
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? '2FA Desativado' : '2FA Ativado',
      description: twoFactorEnabled
        ? 'A autenticação de dois fatores foi desativada.'
        : 'A autenticação de dois fatores foi ativada com sucesso.',
    });
  };

  const totalPermissions = Object.keys(currentLevel?.permissions || {}).length;
  const enabledPermissions = currentLevel
    ? Object.values(currentLevel.permissions).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Níveis de Acesso</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessLevels.length}</div>
            <p className="text-xs text-muted-foreground">
              {Object.values(userCounts).reduce((sum, count) => sum + count, 0)} utilizadores ativos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {twoFactorEnabled ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-muted-foreground">Autenticação de dois fatores</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeout de Sessão</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionTimeout}min</div>
            <p className="text-xs text-muted-foreground">Tempo de inatividade</p>
          </CardContent>
        </Card>
      </div>

      {/* Access Level Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Níveis de Acesso</CardTitle>
          <CardDescription>
            Selecione um nível de acesso para editar as suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Nível de Acesso</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accessLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentLevel && (
            <>
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{currentLevel.name}</h4>
                  <Badge>
                    {enabledPermissions}/{totalPermissions} Permissões
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Permissões</h4>
                
                <div className="space-y-3">
                  {Object.entries(currentLevel.permissions).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      dashboard: 'Dashboard',
                      users: 'Gestão de Utilizadores',
                      companies: 'Gestão de Empresas',
                      providers: 'Gestão de Prestadores',
                      sessions: 'Gestão de Sessões',
                      reports: 'Relatórios',
                      resources: 'Recursos',
                      settings: 'Configurações do Sistema',
                      logs: 'Logs e Auditoria',
                    };

                    const descriptions: Record<string, string> = {
                      dashboard: 'Acesso ao painel principal',
                      users: 'Ver e editar utilizadores',
                      companies: 'Ver e editar empresas',
                      providers: 'Ver e editar prestadores',
                      sessions: 'Ver e gerir sessões',
                      reports: 'Aceder a relatórios e análises',
                      resources: 'Gerir recursos do sistema',
                      settings: 'Editar configurações globais',
                      logs: 'Visualizar logs do sistema',
                    };

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="space-y-0.5">
                          <Label className="text-base">{labels[key]}</Label>
                          <p className="text-sm text-muted-foreground">{descriptions[key]}</p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={() =>
                            handlePermissionToggle(key as keyof AccessLevel['permissions'])
                          }
                          disabled={selectedLevel === 'super_admin'}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveChanges}>
                  Guardar Alterações
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Segurança</CardTitle>
          <CardDescription>
            Configure as definições de segurança do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 mt-0.5 text-primary" />
                <div className="space-y-0.5">
                  <Label className="text-base">Autenticação de Dois Fatores (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    Requer código adicional para iniciar sessão
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {twoFactorEnabled ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={handleEnable2FA} />
            </div>

            <div className="space-y-3 p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary" />
                <div className="space-y-0.5">
                  <Label className="text-base">Timeout de Sessão</Label>
                  <p className="text-sm text-muted-foreground">
                    Tempo de inatividade antes de desconectar automaticamente
                  </p>
                </div>
              </div>
              <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <div className="space-y-0.5">
                  <Label className="text-base">Política de Passwords</Label>
                  <p className="text-sm text-muted-foreground">
                    Requisitos mínimos para passwords
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Mínimo de 8 caracteres</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Incluir letras maiúsculas e minúsculas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Incluir números</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Incluir caracteres especiais</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPermissionsTab;
