import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Key, Eye, EyeOff, Building, Users } from 'lucide-react';
import { Company } from "@/types/company";
import { getAvailableSeats } from "@/utils/companyHelpers";

import { companyToasts } from "@/data/companyToastMessages";
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  onInviteSuccess: (newUser: any) => void;
}

interface InviteFormData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'hr';
  companySessions: number;
}

export function InviteEmployeeModal({ isOpen, onClose, company, onInviteSuccess }: InviteEmployeeModalProps) {
  const { t } = useTranslation('company');
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<InviteFormData>({
    name: '',
    email: '',
    password: '',
    role: 'user',
    companySessions: 0 // Will be calculated
  });

  // Calculate default sessions per employee when modal opens
  React.useEffect(() => {
    const calculateDefaultSessions = async () => {
      if (isOpen && company?.id) {
        try {
          const { data: companyData } = await supabase
            .from('companies')
            .select('sessions_allocated, employee_seats')
            .eq('id', company.id)
            .single();

          if (companyData) {
            // Calculate sessions per employee: total sessions / employee seats
            const sessionsPerEmployee = Math.floor(
              ((companyData as any).sessions_allocated || 0) / ((companyData as any).employee_seats || 1)
            );
            setFormData(prev => ({ ...prev, companySessions: sessionsPerEmployee }));
          }
        } catch (error) {
          console.error('Error calculating default sessions:', error);
          // Fallback to a default value if calculation fails
          setFormData(prev => ({ ...prev, companySessions: 6 }));
        }
      }
    };

    calculateDefaultSessions();
  }, [isOpen, company?.id]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const resetForm = async () => {
    // Recalculate default sessions when resetting
    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select('sessions_allocated, employee_seats')
        .eq('id', company.id)
        .single();

      const sessionsPerEmployee = companyData 
        ? Math.floor(((companyData as any).sessions_allocated || 0) / ((companyData as any).employee_seats || 1))
        : 6;

      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        companySessions: sessionsPerEmployee
      });
    } catch (error) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        companySessions: 6
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call edge function to create employee securely
      const { data, error } = await supabase.functions.invoke('create-employee', {
        body: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          company_id: profile?.company_id, // Use from AuthContext
          role: formData.role,
          sessions_allocated: formData.companySessions
        }
      });

      if (error) throw error;
      if (!data || !data.user_id) throw new Error('Failed to create user');

      // Create invite record
      if (profile?.id && profile?.company_id) {
        await supabase.from('invites').insert({
          invite_code: `inv_${Date.now()}`,
          invited_by: profile.id,
          company_id: profile.company_id,
          email: formData.email,
          role: formData.role,
          status: 'accepted',
          accepted_at: new Date().toISOString()
          // Note: Actual schema has 'accepted_at' but NOT 'accepted_by' - removed accepted_by
        });
      }

      // Copy credentials to clipboard
      navigator.clipboard.writeText(`Email: ${formData.email}\nPassword: ${formData.password}`);
      
      toast({
        title: 'Colaborador convidado com sucesso',
        description: `Credenciais copiadas para a área de transferência`,
      });
      
      onInviteSuccess({
        id: data.user_id,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: true,
        companyQuota: formData.companySessions,
        usedQuota: 0,
        joinedAt: new Date().toISOString()
      });
      
      resetForm();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro ao convidar colaborador',
        description: error.message || t('company:errors.inviteFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('invite.modal.title')}
          </DialogTitle>
          <DialogDescription>
            Adicione um novo colaborador à {company.company_name}. As credenciais de acesso serão enviadas por email.
          </DialogDescription>
        </DialogHeader>

        {/* Company Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{company.company_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getAvailableSeats(company.sessions_allocated, company.sessions_used)} sessões disponíveis de {company.sessions_allocated}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {company.plan_type}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="João Silva"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="joao.silva@empresa.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Colaborador</SelectItem>
                  <SelectItem value="hr">Recursos Humanos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySessions">Sessões Mensais</Label>
              <Input
                id="companySessions"
                type="number"
                min="1"
                max="20"
                value={formData.companySessions}
                onChange={(e) => setFormData(prev => ({ ...prev, companySessions: parseInt(e.target.value) || 6 }))}
              />
              <p className="text-xs text-muted-foreground">
                Número de sessões disponíveis por mês
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Palavra-passe Temporária *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Gere uma palavra-passe segura"
                className="pr-20"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-6 w-6 p-0"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generatePassword}
                  className="h-6 w-6 p-0"
                >
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              O colaborador deve alterar esta palavra-passe no primeiro login
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.email || !formData.password}
              className="flex-1"
            >
              {isSubmitting ? t('invite.modal.submitting') : t('invite.modal.submit')}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('invite.modal.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}