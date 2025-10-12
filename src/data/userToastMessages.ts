// Centralized toast messages for Normal User role
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
  },
};
