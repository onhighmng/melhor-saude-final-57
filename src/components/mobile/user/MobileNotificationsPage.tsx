import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ChevronRight } from 'lucide-react';
import { MobileBottomNav } from '../shared/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import melhorSaudeLogo from '@/assets/melhor-saude-logo.png';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export function MobileNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setNotifications(data);
          
          // If user has no notifications, create a welcome notification
          if (data.length === 0) {
            const { error: insertError } = await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type: 'system_alert',
                title: 'Bem-vindo à Plataforma!',
                message: 'Obrigado por se juntar a nós. Aqui receberá notificações sobre as suas sessões, mensagens e atualizações importantes.',
                priority: 'normal',
                is_read: false
              });
            
            if (!insertError) {
              // Refetch to show the welcome notification
              const { data: newData } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
              
              if (newData) setNotifications(newData);
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        toast.error('Erro ao carregar notificações');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Real-time subscription
    const subscription = supabase
      .channel('user-notifications-mobile')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
        toast.success('Nova notificação');
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const toggleRead = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: !notification.is_read,
          read_at: !notification.is_read ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: !n.is_read } : n
      ));
    } catch (error) {
      console.error('Error toggling read status:', error);
      toast.error('Erro ao atualizar notificação');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notificação eliminada');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erro ao eliminar notificação');
    }
  };

  const getNotificationEmoji = (type: string): string => {
    const emojiMap: Record<string, string> = {
      'booking_confirmed': '✅',
      'booking_cancelled': '❌',
      'session_reminder': '⏰',
      'new_resource': '📚',
      'milestone_achieved': '🎉',
      'message_from_specialist': '💬',
      'session_completed': '✨',
      'goal_progress': '📈',
      'system_alert': '🔔',
      'chat_escalation': '📞'
    };
    return emojiMap[type] || '📬';
  };

  const getTimeAgo = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: pt 
      });
    } catch {
      return 'recentemente';
    }
  };

  const isToday = (timestamp: string): boolean => {
    const notifDate = new Date(timestamp);
    const today = new Date();
    return notifDate.toDateString() === today.toDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const todayNotifications = notifications.filter(n => isToday(n.created_at));
  const earlierNotifications = notifications.filter(n => !isToday(n.created_at));

  if (loading) {
    return (
      <LoadingAnimation 
        variant="fullscreen" 
        message="A carregar notificações..." 
        showProgress={true}
        mascotSrc={melhorSaudeLogo}
        wordmarkSrc={melhorSaudeLogo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-slate-900 text-2xl font-bold">Notificações</h1>
            
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
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Emoji Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl">
                          {getNotificationEmoji(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900 font-medium">{notification.title}</h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                          {notification.priority === 'high' || notification.priority === 'urgent' && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              Urgente
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-2">
                          {notification.message}
                        </p>

                        <p className="text-gray-400 text-xs">
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>

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
                        {notification.is_read ? 'Marcar não lida' : 'Marcar lida'}
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
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl">
                          {getNotificationEmoji(notification.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900 font-medium">{notification.title}</h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-2">
                          {notification.message}
                        </p>

                        <p className="text-gray-400 text-xs">
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex items-center">
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t border-gray-100">
                    <button
                      onClick={() => toggleRead(notification.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm">
                        {notification.is_read ? 'Marcar não lida' : 'Marcar lida'}
                      </span>
                    </button>
                    <div className="w-px bg-gray-100"></div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 transition-colors"
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

      <MobileBottomNav userType="user" />
    </div>
  );
}
