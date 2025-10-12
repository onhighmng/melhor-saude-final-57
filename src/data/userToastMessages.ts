// Centralized toast messages for Normal User role
<<<<<<< HEAD
export const userToastMessages = {
  success: {
    sessionBooked: 'Sessão agendada com sucesso',
    sessionCancelled: 'Sessão cancelada',
    sessionRescheduled: 'Sessão reagendada com sucesso',
    feedbackSubmitted: 'Avaliação enviada. Obrigado!',
    settingsSaved: 'Definições guardadas',
    calendarAdded: 'Sessão adicionada ao calendário',
    preDiagnosisComplete: 'Pré-diagnóstico concluído',
  },
  
  error: {
    sessionBookingFailed: 'Erro ao agendar sessão. Tente novamente.',
    sessionCancelFailed: 'Erro ao cancelar sessão',
    feedbackFailed: 'Erro ao enviar avaliação',
    settingsFailed: 'Erro ao guardar definições',
    loadFailed: 'Erro ao carregar dados',
    noQuotaAvailable: 'Não tem sessões disponíveis',
  },
  
  warning: {
    lowQuota: 'Restam poucas sessões disponíveis',
    quotaExpiring: 'As suas sessões expiram em breve',
    sessionStartingSoon: 'A sessão começa em 5 minutos',
    unsavedChanges: 'Tem alterações por guardar',
  },
  
  info: {
    sessionReminder: (time: string) => `Lembrete: Sessão hoje às ${time}`,
    quotaReset: 'As suas sessões foram renovadas',
    newResourceAvailable: 'Novos recursos disponíveis',
    feedbackRequest: 'Que tal avaliar a sua última sessão?',
=======

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
>>>>>>> 27a8624a17f72448b31e25b6a54f683078672cdc
  },
};
