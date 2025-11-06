import { useState } from 'react';
import { Bell, Check, Trash2, ChevronRight } from 'lucide-react';

interface Notification {
  id: number;
  emoji: string;
  title: string;
  message: string;
  timestamp: string;
  isNew: boolean;
  isHighPriority: boolean;
  isRead: boolean;
  category: 'today' | 'earlier';
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      emoji: '✅',
      title: 'Sessão Confirmada',
      message: 'A sua sessão com Frederico prestador foi agendada para 04/1/2025 às 15:00.',
      timestamp: 'há 1 hora',
      isNew: true,
      isHighPriority: true,
      isRead: false,
      category: 'today'
    },
    {
      id: 2,
      emoji: '✅',
      title: 'Sessão Confirmada',
      message: 'A sua sessão com Frederico prestador foi agendada para 04/1/2025 às 14:30.',
      timestamp: 'há 1 hora',
      isNew: true,
      isHighPriority: true,
      isRead: false,
      category: 'today'
    },
    {
      id: 3,
      emoji: '🎉',
      title: 'Bem-vindo à Melhor Saúde!',
      message: 'Parabéns por completar o seu perfil! A sua jornada de bem-estar começa agora.',
      timestamp: 'há 2 horas',
      isNew: true,
      isHighPriority: false,
      isRead: false,
      category: 'today'
    },
    {
      id: 4,
      emoji: '🔔',
      title: 'Bem-vindo à Plataforma!',
      message: 'Obrigado por se juntar a nós. Aqui receberá notificações sobre as suas sessões e mensagens.',
      timestamp: 'há 3 horas',
      isNew: false,
      isHighPriority: false,
      isRead: false,
      category: 'earlier'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true, isNew: false })));
  };

  const toggleRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: !n.isRead, isNew: false } : n
    ));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const todayNotifications = notifications.filter(n => n.category === 'today');
  const earlierNotifications = notifications.filter(n => n.category === 'earlier');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-900">Notificações</h1>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700 transition-colors active:scale-95 text-sm"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-6xl mx-auto px-5 py-6">
        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-500 text-sm px-2 mb-3">Hoje</h2>
            <div className="space-y-3">
              {todayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Emoji Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl">
                          {notification.emoji}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900">{notification.title}</h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-2">
                          {notification.message}
                        </p>

                        {/* Timestamp */}
                        <p className="text-gray-400 text-xs">
                          {notification.timestamp}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0 flex items-center">
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex border-t border-gray-100">
                    <button
                      onClick={() => toggleRead(notification.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition-colors active:bg-gray-100"
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm">
                        {notification.isRead ? 'Marcar não lida' : 'Marcar lida'}
                      </span>
                    </button>
                    <div className="w-px bg-gray-100"></div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 transition-colors active:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earlier Section */}
        {earlierNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-gray-500 text-sm px-2 mb-3">Anteriores</h2>
            <div className="space-y-3">
              {earlierNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Emoji Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl">
                          {notification.emoji}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900">{notification.title}</h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-2">
                          {notification.message}
                        </p>

                        {/* Timestamp */}
                        <p className="text-gray-400 text-xs">
                          {notification.timestamp}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0 flex items-center">
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex border-t border-gray-100">
                    <button
                      onClick={() => toggleRead(notification.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition-colors active:bg-gray-100"
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm">
                        {notification.isRead ? 'Marcar não lida' : 'Marcar lida'}
                      </span>
                    </button>
                    <div className="w-px bg-gray-100"></div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 transition-colors active:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">Não tem notificações</p>
          </div>
        )}
      </div>
    </div>
  );
}
