import { useState } from 'react';
import { Settings, Users, Bell, Shield, Mail, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type ModalType = 'profile' | 'notifications' | 'security' | 'email' | 'consents' | null;

export function MobileUserSettings() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  const [profileData, setProfileData] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone_number || ''
  });

  const [emailPrefs, setEmailPrefs] = useState({
    emailNotifications: true,
    sessionConfirmed: true,
    sessionCancelled: true,
    sessionRescheduled: true
  });

  const [consents, setConsents] = useState({
    dataProcessing: true,
    wellnessCommunications: false,
    anonymousData: true
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailConfirmation: true,
    pushNotification: false,
    reminder24h: true,
    feedbackReminder: true
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const settingsCards = [
    {
      id: 'profile',
      icon: Users,
      title: 'Perfil',
      subtitle: profile?.full_name || 'Editar perfil',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notificações',
      subtitle: 'Gerir avisos',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Segurança',
      subtitle: 'Palavra-passe & 2FA',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      id: 'email',
      icon: Mail,
      title: 'Preferências de Email',
      subtitle: 'Gerir notificações por email',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'consents',
      icon: FileText,
      title: 'Consentimentos',
      subtitle: 'Tratamento de dados',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Definições</h1>
              <p className="text-gray-500 text-sm mt-1">
                Gerir as suas preferências
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Cards Grid */}
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="grid grid-cols-1 gap-4">
          {settingsCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => setActiveModal(card.id as ModalType)}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${card.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-semibold">{card.title}</h3>
                    <p className="text-gray-500 text-sm">{card.subtitle}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Modal */}
      <Dialog open={activeModal === 'profile'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Informação do Perfil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preferences Modal */}
      <Dialog open={activeModal === 'email'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preferências de Email</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Notificações por Email</p>
                <p className="text-sm text-gray-500">Receber notificações por email</p>
              </div>
              <Switch
                checked={emailPrefs.emailNotifications}
                onCheckedChange={(checked) =>
                  setEmailPrefs({ ...emailPrefs, emailNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Sessão Confirmada</p>
                <p className="text-sm text-gray-500">Quando agendar uma sessão</p>
              </div>
              <Switch
                checked={emailPrefs.sessionConfirmed}
                onCheckedChange={(checked) =>
                  setEmailPrefs({ ...emailPrefs, sessionConfirmed: checked })
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={activeModal === 'notifications'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preferências de Notificação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Email de Confirmação</p>
                <p className="text-sm text-gray-500">Quando sessão for confirmada</p>
              </div>
              <Switch
                checked={notificationPrefs.emailConfirmation}
                onCheckedChange={(checked) =>
                  setNotificationPrefs({ ...notificationPrefs, emailConfirmation: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Notificação Push</p>
                <p className="text-sm text-gray-500">Notificações no dispositivo</p>
              </div>
              <Switch
                checked={notificationPrefs.pushNotification}
                onCheckedChange={(checked) =>
                  setNotificationPrefs({ ...notificationPrefs, pushNotification: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Lembrete 24h antes</p>
                <p className="text-sm text-gray-500">Dia anterior à sessão</p>
              </div>
              <Switch
                checked={notificationPrefs.reminder24h}
                onCheckedChange={(checked) =>
                  setNotificationPrefs({ ...notificationPrefs, reminder24h: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Lembrete de Feedback</p>
                <p className="text-sm text-gray-500">Após cada sessão</p>
              </div>
              <Switch
                checked={notificationPrefs.feedbackReminder}
                onCheckedChange={(checked) =>
                  setNotificationPrefs({ ...notificationPrefs, feedbackReminder: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Modal */}
      <Dialog open={activeModal === 'security'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Segurança</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Palavra-passe Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Palavra-passe</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Palavra-passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Alterar Palavra-passe
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Consents Modal */}
      <Dialog open={activeModal === 'consents'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Consentimentos</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="dataProcessing"
                checked={consents.dataProcessing}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, dataProcessing: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="dataProcessing" className="cursor-pointer">
                  Tratamento de dados pessoais
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Obrigatório para o funcionamento da plataforma
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MobileBottomNav userType="user" />
    </div>
  );
}

