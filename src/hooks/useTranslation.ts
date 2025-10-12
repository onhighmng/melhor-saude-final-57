// Working Portuguese stub - returns actual Portuguese text instead of keys
const translations: Record<string, any> = {
  // Common
  'buttons.cancel': 'Cancelar',
  'buttons.confirm': 'Confirmar',
  'buttons.save': 'Guardar',
  'buttons.back': 'Voltar',
  'buttons.next': 'Continuar',
  'buttons.submit': 'Enviar',
  'buttons.close': 'Fechar',
  'common.actions.save': 'Guardar',
  'common.loading': 'A carregar...',
  'common.error': 'Erro',
  'common.success': 'Sucesso',
  
  // Support
  'support.title': 'Centro de Apoio',
  'support.subtitle': 'Estamos aqui para ajudar',
  'support.virtualAssistant': 'Assistente Virtual',
  'support.humanSupport': 'Apoio Humano',
  
  // Booking
  'booking.choosePillar': 'Como podemos ajudar?',
  'booking.chooseSpecialist': 'Escolha o tipo de especialista',
  'booking.scheduleSession': 'Agende a sua sessão',
  'booking.confirmation': 'Confirmação',
  'booking.pillarSelection': 'Selecione o pilar de apoio',
  'booking.banner.title': 'Pronto para agendar a sua próxima sessão?',
  'booking.banner.subtitle': 'Escolha o melhor momento para si',
  'booking.banner.action': 'Agendar Sessão',
  
  // Universal Chat
  'universalChat.intro.title': 'Como posso ajudar hoje?',
  'universalChat.intro.description': 'Partilhe o que sente ou escolha uma das opções abaixo',
  'universalChat.intro.button1': 'me levou a procurar apoio',
  'universalChat.intro.button1Highlight': 'me levou a procurar apoio',
  'universalChat.intro.button2': 'Gostaria de falar sobre os meus objetivos',
  'universalChat.intro.button3': 'Preciso de ajuda para escolher o melhor tipo de apoio',
  
  // Pillars
  'pillars.psychological.title': 'Saúde Mental',
  'pillars.psychological.description': 'Apoio psicológico e emocional',
  'pillars.psychological.specialists.title': 'Especialistas Disponíveis',
  'pillars.psychological.specialists.list': [
    'Psicólogos Clínicos',
    'Terapeutas Cognitivo-Comportamentais',
    'Psicoterapeutas',
    'Conselheiros de Saúde Mental',
    'Especialistas em Gestão de Stress'
  ],
  
  'pillars.physical.title': 'Bem-estar Físico',
  'pillars.physical.description': 'Saúde física e nutrição',
  'pillars.physical.specialists.title': 'Especialistas Disponíveis',
  'pillars.physical.specialists.list': [
    'Nutricionistas',
    'Personal Trainers',
    'Fisioterapeutas',
    'Médicos de Desporto',
    'Especialistas em Sono'
  ],
  
  'pillars.financial.title': 'Assistência Financeira',
  'pillars.financial.description': 'Planeamento e gestão financeira',
  'pillars.financial.specialists.title': 'Especialistas Disponíveis',
  'pillars.financial.specialists.list': [
    'Consultores Financeiros',
    'Gestores de Investimentos',
    'Especialistas em Orçamento',
    'Planeadores de Reforma',
    'Consultores de Dívida'
  ],
  
  'pillars.legal.title': 'Assistência Jurídica',
  'pillars.legal.description': 'Apoio legal e consultoria',
  'pillars.legal.specialists.title': 'Especialistas Disponíveis',
  'pillars.legal.specialists.list': [
    'Advogados de Família',
    'Advogados Laborais',
    'Consultores Jurídicos',
    'Notários',
    'Mediadores'
  ],
  'pillars.psychological.specialists.sectionTitle': 'Profissionais Disponíveis',
  'pillars.psychological.specialists.availability': 'disponíveis 24/7',
  'pillars.physical.specialists.sectionTitle': 'Profissionais Disponíveis',
  'pillars.physical.specialists.availability': 'disponíveis 24/7',
  'pillars.financial.specialists.sectionTitle': 'Profissionais Disponíveis',
  'pillars.financial.specialists.availability': 'disponíveis 24/7',
  'pillars.legal.specialists.sectionTitle': 'Profissionais Disponíveis',
  'pillars.legal.specialists.availability': 'disponíveis 24/7',
  
  // Company
  'company.deactivate.confirm': 'Confirmar Desativação',
  'company.deactivate.warning': 'Tem a certeza que deseja desativar este colaborador?',
  'company.deactivate.employeeLabel': 'Colaborador:',
  'company.deactivate.consequence': 'Esta ação irá desativar o acesso do colaborador à plataforma.',
  'company.deactivate.action': 'Desativar',
  'company.employees.actions.cancel': 'Cancelar',
  
  'company.revokeAccess.title': 'Revogar Acesso',
  'company.revokeAccess.warning': 'ATENÇÃO: Esta ação é irreversível!',
  'company.revokeAccess.confirm': 'Tem a certeza que deseja revogar permanentemente o acesso deste colaborador?',
  'company.revokeAccess.employeeLabel': 'Colaborador:',
  'company.revokeAccess.action': 'Revogar Acesso',
  
  // Errors
  'errors.fetchFailed': 'Erro ao carregar dados',
  'errors.invalidEmail': 'Email inválido',
  'errors.passwordTooShort': 'Senha muito curta',
  'errors.title': 'Erro',
  'errors.operationFailed': 'Operação falhou',
  'errors.unknown': 'Erro desconhecido',
  'errors.sessionBookingFailed': 'Erro ao agendar sessão',
  
  // Toasts
  'toasts.success': 'Sucesso',
  'toasts.error': 'Erro',
  'toasts.warning': 'Aviso',
  'toasts.info': 'Informação',
  'toasts.sessionBooked': 'Sessão agendada com sucesso',
  'toasts.providerAssigned': 'Prestador atribuído',
  'toasts.operationComplete': 'Operação concluída',
  'toasts.dataSaved': 'Dados guardados',
};

export const useTranslation = (namespace?: string) => {
  return {
    t: (key: string, options?: any) => {
      const value = translations[key];
      
      // Handle interpolation like {{name}}
      if (typeof value === 'string' && options) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, key) => options[key] || '');
      }
      
      // Return value (could be string or array)
      return value || key;
    },
    i18n: {
      language: 'pt',
      changeLanguage: () => Promise.resolve(),
      services: { resourceStore: { data: {} } },
      exists: (key: string) => key in translations
    }
  };
};
