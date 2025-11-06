import { useState } from 'react';
import { Settings, Users, Bell, Shield, Mail, FileText, AlertTriangle, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { NotificationsPage } from './NotificationsPage';

type ModalType = 'profile' | 'avisos' | 'security' | 'email' | 'consents' | 'history' | null;

interface HistoryNotification {
  id: number;
  emoji: string;
  title: string;
  message: string;
  timestamp: string;
  isNew: boolean;
}

export function SettingsPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [profileData, setProfileData] = useState({
    name: 'lorino rodrigues',
    email: 'lorinofrodriguesjunior@gmail.com',
    phone: '+258 61 466 3528'
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

  const [historyNotifications] = useState<HistoryNotification[]>([
    {
      id: 1,
      emoji: '✅',
      title: 'Sessão Confirmada',
      message: 'A sua sessão com Frederico prestador foi agendada para 04/1/2025 às 15:00:00.',
      timestamp: '05/h, 14:58',
      isNew: true
    },
    {
      id: 2,
      emoji: '✅',
      title: 'Sessão Confirmada',
      message: 'A sua sessão com Frederico prestador foi agendada para 04/1/2025 às 14:30:00.',
      timestamp: '05/h, 14:57',
      isNew: true
    },
    {
      id: 3,
      emoji: '🎉',
      title: 'Bem-vindo à Melhor Saúde!',
      message: 'Parabéns por completar o seu perfil! A sua jornada de bem-estar começa agora.',
      timestamp: '05/h, 14:45',
      isNew: true
    }
  ]);

  const settingsCards = [
    {
      id: 'profile',
      icon: Users,
      title: 'Perfil',
      subtitle: 'lorino rodrigues',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'avisos',
      icon: Bell,
      title: 'Avisos',
      subtitle: '4 não lidas',
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
    },
    {
      id: 'history',
      icon: AlertTriangle,
      title: 'Histórico de Notificações',
      subtitle: '4 notificações',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900">Definições</h1>
              <p className="text-gray-500 text-sm mt-1">
                Gerir as suas preferências e configurações
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Cards Grid */}
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => setActiveModal(card.id as ModalType)}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all active:scale-95 text-left"
              >
                <div className={`w-14 h-14 ${card.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${card.iconColor}`} />
                </div>
                <h3 className="text-gray-900 mb-1">{card.title}</h3>
                <p className="text-gray-500 text-sm">{card.subtitle}</p>
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
            <p className="text-sm text-gray-500">Atualize as suas informações pessoais</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-3xl text-gray-600">I</span>
              </div>
              <div>
                <p className="text-gray-900">{profileData.name}</p>
                <p className="text-sm text-gray-500 mb-2">{profileData.email}</p>
                <button className="text-blue-600 text-sm hover:underline">
                  Alterar foto
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setActiveModal(null)}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors active:scale-95"
            >
              Guardar alterações
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preferences Modal */}
      <Dialog open={activeModal === 'email'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preferências de Email</DialogTitle>
            <p className="text-sm text-gray-500">Gerir as suas preferências de notificações por email</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Preferences Header */}
            <div>
              <h3 className="text-gray-900 mb-2">Preferências de Notificações</h3>
              <p className="text-sm text-gray-500">
                Gerir como e quando recebe notificações sobre a sua conta e atividade.
              </p>
            </div>

            {/* Email Notifications Toggle */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <p className="text-gray-900">Notificações por Email</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Receber notificações por email (pode personalizar abaixo)
                  </p>
                </div>
                <Switch
                  checked={emailPrefs.emailNotifications}
                  onCheckedChange={(checked) =>
                    setEmailPrefs({ ...emailPrefs, emailNotifications: checked })
                  }
                />
              </div>
            </div>

            {/* Email Types Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-blue-600" />
                <h3 className="text-gray-900">Notificações por Email</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Escolha que tipos de emails quer receber
              </p>

              <div className="space-y-4">
                <p className="text-sm text-gray-900">Agendamentos</p>

                {/* Session Confirmed */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Sessão Confirmada</p>
                    <p className="text-sm text-gray-500">Quando agendar uma nova sessão</p>
                  </div>
                  <Switch
                    checked={emailPrefs.sessionConfirmed}
                    onCheckedChange={(checked) =>
                      setEmailPrefs({ ...emailPrefs, sessionConfirmed: checked })
                    }
                  />
                </div>

                {/* Session Cancelled */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Sessão Cancelada</p>
                    <p className="text-sm text-gray-500">Quando uma sessão for cancelada</p>
                  </div>
                  <Switch
                    checked={emailPrefs.sessionCancelled}
                    onCheckedChange={(checked) =>
                      setEmailPrefs({ ...emailPrefs, sessionCancelled: checked })
                    }
                  />
                </div>

                {/* Session Rescheduled */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Sessão Reagendada</p>
                    <p className="text-sm text-gray-500">Quando reagendar uma sessão</p>
                  </div>
                  <Switch
                    checked={emailPrefs.sessionRescheduled}
                    onCheckedChange={(checked) =>
                      setEmailPrefs({ ...emailPrefs, sessionRescheduled: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Modal */}
      <Dialog open={activeModal === 'security'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Segurança & Acesso</DialogTitle>
            <p className="text-sm text-gray-500">Gerir as definições de segurança da sua conta</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Password Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-900 mb-1">Palavra-passe</p>
                <p className="text-sm text-gray-500">
                  Última alteração em 15 de Janeiro, 2024
                </p>
              </div>
              <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                Alterar Palavra-Passe
              </button>
            </div>

            {/* 2FA Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-900 mb-1">Autenticação de dois fatores (2FA)</p>
                <p className="text-sm text-gray-500">
                  Em breve estará disponível
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Brevemente
              </Badge>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => setActiveModal(null)}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Consents Modal */}
      <Dialog open={activeModal === 'consents'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Consentimentos</DialogTitle>
            <p className="text-sm text-gray-500">Gerir os seus consentimentos para tratamento de dados</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Data Processing Consent */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="dataProcessing"
                checked={consents.dataProcessing}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, dataProcessing: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="dataProcessing" className="text-gray-900 cursor-pointer">
                  Consentimento para tratamento de dados pessoais
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Obrigatório para o funcionamento da plataforma.
                </p>
              </div>
            </div>

            {/* Wellness Communications Consent */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="wellnessCommunications"
                checked={consents.wellnessCommunications}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, wellnessCommunications: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="wellnessCommunications" className="text-gray-900 cursor-pointer">
                  Consentimento para comunicações de bem-estar
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Receber dicas e conselhos sobre saúde e bem-estar.
                </p>
              </div>
            </div>

            {/* Anonymous Data Consent */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="anonymousData"
                checked={consents.anonymousData}
                onCheckedChange={(checked) =>
                  setConsents({ ...consents, anonymousData: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="anonymousData" className="text-gray-900 cursor-pointer">
                  Uso de dados anônimos em relatórios agregados
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Ajudar a melhorar os serviços através de análises agregadas.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setActiveModal(null)}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors active:scale-95"
            >
              Guardar consentimentos
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification History Modal */}
      <Dialog open={activeModal === 'history'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico de Notificações</DialogTitle>
            <p className="text-sm text-gray-500">Ver todas as suas notificações</p>
          </DialogHeader>

          {/* Unread Count */}
          <div className="py-2">
            <p className="text-sm text-gray-900">
              Não Lidas ({historyNotifications.filter(n => n.isNew).length})
            </p>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {historyNotifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Bell Icon */}
                  <div className="flex-shrink-0 pt-1">
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title Row */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{notification.emoji}</span>
                      <h4 className="text-gray-900">{notification.title}</h4>
                      {notification.isNew && (
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-xs ml-auto">
                          Nova
                        </Badge>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-400">
                          {notification.timestamp}
                        </p>
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                          Marcar como lida
                        </button>
                      </div>
                      <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors active:scale-95">
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Avisos Full Screen Modal */}
      {activeModal === 'avisos' && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="h-full flex flex-col">
            {/* Header with close button */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
              <div className="max-w-6xl mx-auto px-5 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-gray-900">Avisos</h1>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* NotificationsPage content without header */}
            <div className="flex-1 overflow-y-auto">
              <NotificationsPage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}