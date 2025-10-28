import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Pillar } from '@/integrations/supabase/types-unified';

interface SpecialistNotification {
  id: string;
  type: 'escalated_chat' | 'session_request' | 'urgent_case' | 'follow_up';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  description: string;
  user_id: string;
  user_name: string;
  pillar: Pillar;
  chat_session_id?: string;
  booking_id?: string;
  created_at: string;
  read: boolean;
  metadata: any;
}

interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  escalated_chats: number;
  session_requests: number;
}

export const useSpecialistNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SpecialistNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    urgent: 0,
    escalated_chats: 0,
    session_requests: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Load escalated chats
      const { data: escalatedChats, error: chatsError } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          user_id,
          pillar,
          phone_escalation_reason,
          created_at,
          profiles!chat_sessions_user_id_fkey(name)
        `)
        .eq('status', 'phone_escalated')
        .order('created_at', { ascending: false })
        .limit(20);

      if (chatsError) throw chatsError;

      // Load session requests
      const { data: sessionRequests, error: sessionsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          pillar,
          status,
          created_at,
          profiles!bookings_user_id_fkey(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);

      if (sessionsError) throw sessionsError;

      // Transform data into notifications
      const chatNotifications: SpecialistNotification[] = (escalatedChats || []).map(chat => ({
        id: `chat_${chat.id}`,
        type: 'escalated_chat',
        priority: 'high',
        title: 'Chat Escalado',
        description: `Chat de ${chat.profiles?.name || 'Utilizador'} escalado: ${chat.phone_escalation_reason || 'Motivo não especificado'}`,
        user_id: chat.user_id,
        user_name: chat.profiles?.name || 'Utilizador',
        pillar: chat.pillar as Pillar,
        chat_session_id: chat.id,
        created_at: chat.created_at,
        read: false,
        metadata: { escalation_reason: chat.phone_escalation_reason }
      }));

      const sessionNotifications: SpecialistNotification[] = (sessionRequests || []).map(booking => ({
        id: `session_${booking.id}`,
        type: 'session_request',
        priority: 'normal',
        title: 'Solicitação de Sessão',
        description: `${booking.profiles?.name || 'Utilizador'} solicitou uma sessão de ${booking.pillar}`,
        user_id: booking.user_id,
        user_name: booking.profiles?.name || 'Utilizador',
        pillar: booking.pillar as Pillar,
        booking_id: booking.id,
        created_at: booking.created_at,
        read: false,
        metadata: { booking_status: booking.status }
      }));

      const allNotifications = [...chatNotifications, ...sessionNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(allNotifications);

      // Calculate stats
      const unread = allNotifications.filter(n => !n.read).length;
      const urgent = allNotifications.filter(n => n.priority === 'urgent').length;
      const escalated_chats = allNotifications.filter(n => n.type === 'escalated_chat').length;
      const session_requests = allNotifications.filter(n => n.type === 'session_request').length;

      setStats({
        total: allNotifications.length,
        unread,
        urgent,
        escalated_chats,
        session_requests
      });

    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const subscribeToNotifications = useCallback(() => {
    if (!user?.id || isSubscribed) return;

    // Subscribe to chat session changes
    const chatSubscription = supabase
      .channel('specialist_chat_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_sessions',
        filter: `status=eq.phone_escalated`
      }, (payload) => {
        console.log('New escalated chat:', payload);
        loadNotifications(); // Reload notifications
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_sessions',
        filter: `status=eq.phone_escalated`
      }, (payload) => {
        console.log('Updated escalated chat:', payload);
        loadNotifications(); // Reload notifications
      })
      .subscribe();

    // Subscribe to booking changes
    const bookingSubscription = supabase
      .channel('specialist_booking_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `status=eq.pending`
      }, (payload) => {
        console.log('New session request:', payload);
        loadNotifications(); // Reload notifications
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `status=eq.pending`
      }, (payload) => {
        console.log('Updated session request:', payload);
        loadNotifications(); // Reload notifications
      })
      .subscribe();

    setIsSubscribed(true);

    return () => {
      chatSubscription.unsubscribe();
      bookingSubscription.unsubscribe();
      setIsSubscribed(false);
    };
  }, [user?.id, isSubscribed, loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      // Update notification in local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));

      // In a real implementation, you would save this to the database
      // For now, we'll just update the local state
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );

      setStats(prev => ({
        ...prev,
        unread: 0
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getUnreadNotifications = (): SpecialistNotification[] => {
    return notifications.filter(n => !n.read);
  };

  const getUrgentNotifications = (): SpecialistNotification[] => {
    return notifications.filter(n => n.priority === 'urgent' && !n.read);
  };

  const getNotificationsByType = (type: SpecialistNotification['type']): SpecialistNotification[] => {
    return notifications.filter(n => n.type === type);
  };

  const getNotificationsByPillar = (pillar: Pillar): SpecialistNotification[] => {
    return notifications.filter(n => n.pillar === pillar);
  };

  const requestDesktopNotification = async (notification: SpecialistNotification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.description,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications();
    return unsubscribe;
  }, [subscribeToNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Show desktop notifications for urgent notifications
  useEffect(() => {
    const urgentNotifications = getUrgentNotifications();
    if (urgentNotifications.length > 0) {
      urgentNotifications.forEach(notification => {
        requestDesktopNotification(notification);
      });
    }
  }, [notifications]);

  return {
    loading,
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    getUnreadNotifications,
    getUrgentNotifications,
    getNotificationsByType,
    getNotificationsByPillar,
    requestNotificationPermission,
    refreshNotifications: loadNotifications
  };
};
