import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Bell, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NotificationPreferences {
  // Global settings
  email_enabled: boolean;
  
  // Email preferences
  email_booking_confirmed: boolean;
  email_booking_cancelled: boolean;
  email_booking_rescheduled: boolean;
  email_session_reminder_1h: boolean;
  email_session_reminder_10min: boolean;
  email_session_completed: boolean;
  email_milestone_achieved: boolean;
  email_goal_progress: boolean;
  email_new_resource: boolean;
  email_message_from_specialist: boolean;
  email_chat_escalation: boolean;
  email_system_alert: boolean;
  email_provider_new_booking: boolean;
  email_provider_cancellation: boolean;
  
  // In-app preferences
  inapp_booking_confirmed: boolean;
  inapp_booking_cancelled: boolean;
  inapp_session_reminder: boolean;
  inapp_session_completed: boolean;
  inapp_milestone_achieved: boolean;
  inapp_goal_progress: boolean;
  inapp_new_resource: boolean;
  inapp_message_from_specialist: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_enabled: true,
  email_booking_confirmed: true,
  email_booking_cancelled: true,
  email_booking_rescheduled: true,
  email_session_reminder_1h: true,
  email_session_reminder_10min: true,
  email_session_completed: true,
  email_milestone_achieved: true,
  email_goal_progress: true,
  email_new_resource: false,
  email_message_from_specialist: true,
  email_chat_escalation: true,
  email_system_alert: true,
  email_provider_new_booking: true,
  email_provider_cancellation: true,
  inapp_booking_confirmed: true,
  inapp_booking_cancelled: true,
  inapp_session_reminder: true,
  inapp_session_completed: true,
  inapp_milestone_achieved: true,
  inapp_goal_progress: true,
  inapp_new_resource: true,
  inapp_message_from_specialist: true,
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no preferences exist, create them
        if (error.code === "PGRST116") {
          await supabase
            .from("notification_preferences")
            .insert({ user_id: user.id, ...defaultPreferences });
          setPreferences(defaultPreferences);
        } else {
          throw error;
        }
      } else if (data) {
        setPreferences(data as NotificationPreferences);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast({
        title: "Erro ao carregar preferências",
        description: "Não foi possível carregar as suas preferências de notificações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notification_preferences")
        .update(preferences)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "✅ Preferências guardadas",
        description: "As suas preferências de notificações foram atualizadas.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Erro ao guardar",
        description: "Não foi possível guardar as suas preferências.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificações</CardTitle>
        <CardDescription>
          Gerir como e quando recebe notificações sobre a sua conta e atividade.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Email Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
          <div className="space-y-0.5">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Notificações por Email
            </Label>
            <p className="text-sm text-muted-foreground">
              Receber notificações por email (pode personalizar abaixo)
            </p>
          </div>
          <Switch
            checked={preferences.email_enabled}
            onCheckedChange={() => togglePreference("email_enabled")}
          />
        </div>

        {/* Email Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Notificações por Email</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Escolha que tipos de emails quer receber
          </p>

          {/* Bookings Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Agendamentos</h4>
            {[
              { key: "email_booking_confirmed", label: "Sessão Confirmada", desc: "Quando agendar uma nova sessão" },
              { key: "email_booking_cancelled", label: "Sessão Cancelada", desc: "Quando uma sessão for cancelada" },
              { key: "email_booking_rescheduled", label: "Sessão Reagendada", desc: "Quando uma sessão for reagendada" },
              { key: "email_session_reminder_1h", label: "Lembrete 1 Hora Antes", desc: "Lembrete uma hora antes da sessão" },
              { key: "email_session_reminder_10min", label: "Lembrete 10 Minutos Antes", desc: "Lembrete dez minutos antes da sessão" },
              { key: "email_session_completed", label: "Sessão Concluída", desc: "Após concluir uma sessão" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                  onCheckedChange={() => togglePreference(item.key as keyof NotificationPreferences)}
                  disabled={!preferences.email_enabled}
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Progress & Achievements Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Progresso & Conquistas</h4>
            {[
              { key: "email_milestone_achieved", label: "Marcos Conquistados", desc: "Quando alcançar um novo marco" },
              { key: "email_goal_progress", label: "Progresso nos Objetivos", desc: "Atualizações sobre os seus objetivos" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                  onCheckedChange={() => togglePreference(item.key as keyof NotificationPreferences)}
                  disabled={!preferences.email_enabled}
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Communication Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Comunicação</h4>
            {[
              { key: "email_message_from_specialist", label: "Mensagens de Especialistas", desc: "Quando receber uma mensagem" },
              { key: "email_chat_escalation", label: "Assistência Necessária", desc: "Quando um utilizador necessitar de ajuda (especialistas)" },
              { key: "email_new_resource", label: "Novos Recursos", desc: "Quando novos recursos forem adicionados" },
              { key: "email_system_alert", label: "Alertas do Sistema", desc: "Notificações importantes do sistema" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                  onCheckedChange={() => togglePreference(item.key as keyof NotificationPreferences)}
                  disabled={!preferences.email_enabled}
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* In-App Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Notificações na App</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Notificações que aparecem dentro da plataforma
          </p>

          <div className="space-y-3">
            {[
              { key: "inapp_booking_confirmed", label: "Agendamentos Confirmados" },
              { key: "inapp_booking_cancelled", label: "Agendamentos Cancelados" },
              { key: "inapp_session_reminder", label: "Lembretes de Sessões" },
              { key: "inapp_session_completed", label: "Sessões Concluídas" },
              { key: "inapp_milestone_achieved", label: "Marcos Conquistados" },
              { key: "inapp_goal_progress", label: "Progresso nos Objetivos" },
              { key: "inapp_new_resource", label: "Novos Recursos" },
              { key: "inapp_message_from_specialist", label: "Mensagens de Especialistas" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <Label className="text-sm font-medium">{item.label}</Label>
                <Switch
                  checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                  onCheckedChange={() => togglePreference(item.key as keyof NotificationPreferences)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Preferências
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

