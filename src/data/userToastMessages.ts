// Centralized toast messages for Normal User role

export const userToastMessages = {
  success: {
    sessionBooked: "Sessão agendada com sucesso",
    sessionCancelled: "Sessão cancelada",
    sessionRescheduled: "Sessão reagendada",
    feedbackSubmitted: "Feedback enviado",
    settingsSaved: "Definições guardadas",
    calendarAdded: "Adicionado ao calendário",
    preDiagnosisComplete: "Pré-diagnóstico concluído",
  },
  
  error: {
    sessionBookingFailed: "Erro ao agendar sessão",
    sessionCancelFailed: "Erro ao cancelar sessão",
    feedbackFailed: "Erro ao enviar feedback",
    settingsFailed: "Erro ao guardar definições",
    loadFailed: "Erro ao carregar dados",
    noQuotaAvailable: "Sem quota disponível",
  },
  
  warning: {
    lowQuota: "Quota baixa",
    quotaExpiring: "Quota a expirar",
    sessionStartingSoon: "Sessão a começar em breve",
    unsavedChanges: "Alterações não guardadas",
  },
  
  info: {
    sessionReminder: (time: string) => `Lembrete de sessão às ${time}`,
    quotaReset: "Quota reposta",
    newResourceAvailable: "Novo recurso disponível",
    feedbackRequest: "Pedido de feedback",
  },
};
