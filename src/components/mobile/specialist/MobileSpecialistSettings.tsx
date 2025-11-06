import { useState } from 'react';
import { Settings, User, Bell, Calendar, Shield, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { MobileBottomNav } from '../shared/MobileBottomNav';

export function MobileSpecialistSettings() {
  const { profile } = useAuth();

  const settingsOptions = [
    {
      id: 'profile',
      icon: User,
      title: 'Perfil Profissional',
      subtitle: 'Editar informações do perfil',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'availability',
      icon: Calendar,
      title: 'Disponibilidade',
      subtitle: 'Gerir horários disponíveis',
      color: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notificações',
      subtitle: 'Preferências de avisos',
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Segurança',
      subtitle: 'Palavra-passe e 2FA',
      color: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      id: 'payments',
      icon: DollarSign,
      title: 'Pagamentos',
      subtitle: 'Gerir informações de pagamento',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-5 py-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-gray-900 text-2xl font-bold">Definições</h1>
              <p className="text-gray-500 text-sm">Gerir configurações da conta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-5 py-6">
        <div className="space-y-3">
          {settingsOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${option.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${option.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-medium">{option.title}</h3>
                    <p className="text-gray-500 text-sm">{option.subtitle}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <MobileBottomNav userType="specialist" />
    </div>
  );
}

