import React, { useState } from 'react';
import { Phone, Calendar, TrendingUp, User as UserIcon, ChevronLeft, Bell, Users, BarChart3, Settings as SettingsIcon, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';

interface SettingsProps {
  onNavigate: (view: 'dashboard' | 'calls' | 'sessions' | 'history' | 'stats' | 'settings') => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  // Profile form state
  const [profileName, setProfileName] = useState('Geral Especialista');
  const [profileEmail, setProfileEmail] = useState('geralespecialista@u.me');
  const [profilePhone, setProfilePhone] = useState('+351 91 111 1111');
  
  // Notification settings state
  const [notifNewCalls, setNotifNewCalls] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifCancellations, setNotifCancellations] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-2">
            <button className="p-2 -ml-2" onClick={() => onNavigate('dashboard')}>
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </button>
            <h1 className="text-center flex-1">Definições</h1>
            <div className="w-10"></div>
          </div>
          <p className="text-center text-gray-500 text-sm">
            Gerir as suas configurações pessoais e preferências
          </p>
        </div>
      </div>

      {/* Content - Just two buttons */}
      <div className="p-4 space-y-4 pb-24">
        {/* Profile Button */}
        <button 
          onClick={() => setShowProfileModal(true)}
          className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-sm text-center hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="mb-1">Perfil</h2>
            <p className="text-sm text-gray-600">Geral Especialistas</p>
          </div>
        </button>

        {/* Notifications Button */}
        <button 
          onClick={() => setShowNotificationsModal(true)}
          className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 shadow-sm text-center hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-white" />
            </div>
            <h2 className="mb-1">Notificações</h2>
            <p className="text-sm text-gray-600">Pedidos e sessões</p>
          </div>
        </button>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <h2 className="mb-6">Editar Perfil</h2>
            
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <button className="mt-2 text-sm text-blue-600">
                Carregar Foto
              </button>
              <p className="text-xs text-gray-500 mt-1">(JPG, PNG ou WEBP Máx. 2MB)</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-2 block">Nome</label>
                <Input 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Geral Especialista"
                  className="rounded-xl"
                />
              </div>
              
              <div>
                <label className="text-sm mb-2 block">Email</label>
                <Input 
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="geralespecialista@u.me"
                  type="email"
                  className="rounded-xl"
                />
              </div>
              
              <div>
                <label className="text-sm mb-2 block">Telefone</label>
                <Input 
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+351 91 111 1111"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowProfileModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  // Save logic here
                  setShowProfileModal(false);
                }}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Guardar Alterações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6">
            <h2 className="mb-2">Configurações de Notificação</h2>
            <p className="text-sm text-gray-500 mb-6">
              Configure como deseja receber notificações sobre novos pedidos de chamada e sessões.
            </p>
            
            {/* Notification Events Section */}
            <div className="mb-6">
              <h3 className="text-sm mb-4">Notificações de Eventos</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Novos Pedidos de Chamada</p>
                    <p className="text-xs text-gray-500">Receber notificações quando há novos pedidos</p>
                  </div>
                  <Switch 
                    checked={notifNewCalls}
                    onCheckedChange={setNotifNewCalls}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Lembretes de Sessões</p>
                    <p className="text-xs text-gray-500">Receber notificações antes das sessões</p>
                  </div>
                  <Switch 
                    checked={notifReminders}
                    onCheckedChange={setNotifReminders}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Cancelamentos de Sessões</p>
                    <p className="text-xs text-gray-500">Avisar quando sessões são canceladas</p>
                  </div>
                  <Switch 
                    checked={notifCancellations}
                    onCheckedChange={setNotifCancellations}
                  />
                </div>
              </div>
            </div>

            {/* Notification Channels Section */}
            <div className="mb-6">
              <h3 className="text-sm mb-4">Canais de Notificação</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Notificações por Email</p>
                    <p className="text-xs text-gray-500">Receber notificações no seu email</p>
                  </div>
                  <Switch 
                    checked={notifEmail}
                    onCheckedChange={setNotifEmail}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Notificações Push</p>
                    <p className="text-xs text-gray-500">Receber notificações no navegador</p>
                  </div>
                  <Switch 
                    checked={notifPush}
                    onCheckedChange={setNotifPush}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowNotificationsModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  // Save logic here
                  setShowNotificationsModal(false);
                }}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Guardar Configurações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* iOS-style Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="grid grid-cols-6 px-2 py-2">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button 
            onClick={() => onNavigate('calls')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">Chamadas</span>
          </button>
          <button 
            onClick={() => onNavigate('sessions')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Sessões</span>
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </button>
          <button 
            onClick={() => onNavigate('stats')}
            className="flex flex-col items-center gap-1 py-2 text-gray-400"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Stats</span>
          </button>
          <button 
            onClick={() => onNavigate('settings')}
            className="flex flex-col items-center gap-1 py-2 text-blue-600"
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
