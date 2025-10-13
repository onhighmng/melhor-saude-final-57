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
  
  // Admin Company Detail
  'admin-company-detail:header.title': 'Detalhes da Empresa',
  'admin-company-detail:header.nuit': 'NUIT',
  'admin-company-detail:header.employees': 'Nº de colaboradores',
  'admin-company-detail:header.plan': 'Plano atual',
  'admin-company-detail:header.sessionsPerMonth': 'sessões/mês',
  'admin-company-detail:header.sessionsUsed': 'Sessões usadas',
  'admin-company-detail:header.sessionsRemaining': 'sessões restantes',
  'admin-company-detail:header.status.active': 'Ativa',
  'admin-company-detail:header.status.onboarding': 'Em Onboarding',
  'admin-company-detail:header.status.inactive': 'Inativa',
  
  'admin-company-detail:actions.editCompany': 'Editar Empresa',
  'admin-company-detail:actions.viewReport': 'Ver Relatório Mensal',
  'admin-company-detail:actions.deactivateCompany': 'Desativar Empresa',
  'admin-company-detail:actions.importEmployees': 'Importar Colaboradores',
  'admin-company-detail:actions.generateCodes': 'Gerar Códigos de Acesso',
  'admin-company-detail:actions.sendEmails': 'Enviar Códigos por Email',
  'admin-company-detail:actions.exportCSV': 'Exportar CSV com Códigos',
  
  'admin-company-detail:tooltips.importCSV': 'Faça upload de um ficheiro .csv com nome e email dos colaboradores.',
  'admin-company-detail:tooltips.downloadTemplate': 'Descarregar modelo CSV',
  'admin-company-detail:tooltips.generateCodes': 'Cria códigos únicos para todos os colaboradores importados.',
  'admin-company-detail:tooltips.sendEmails': 'Envia automaticamente os códigos para o email de cada colaborador.',
  'admin-company-detail:tooltips.exportCSV': 'Descarregue um ficheiro com nomes e códigos para enviar à empresa.',
  'admin-company-detail:tooltips.resendCode': 'Reenviar código',
  'admin-company-detail:tooltips.removeEmployee': 'Remover colaborador',
  
  'admin-company-detail:table.name': 'Nome',
  'admin-company-detail:table.email': 'Email',
  'admin-company-detail:table.code': 'Código',
  'admin-company-detail:table.sentDate': 'Data de Envio',
  'admin-company-detail:table.status': 'Estado',
  'admin-company-detail:table.actions': 'Ações',
  'admin-company-detail:table.noEmployees': 'Nenhum colaborador importado ainda.',
  'admin-company-detail:table.importFirst': 'Faça upload de um ficheiro CSV para começar.',
  
  'admin-company-detail:employeeStatus.noCode': 'Sem Código',
  'admin-company-detail:employeeStatus.codeGenerated': 'Código Gerado',
  'admin-company-detail:employeeStatus.codeSent': 'Enviado',
  'admin-company-detail:employeeStatus.sendError': 'Erro no Envio',
  'admin-company-detail:employeeStatus.active': 'Ativo',
  'admin-company-detail:employeeStatus.inactive': 'Inativo',
  
  'admin-company-detail:statistics.title': 'Estatísticas Rápidas',
  'admin-company-detail:statistics.totalEmployees': 'Total de colaboradores',
  'admin-company-detail:statistics.codesSent': 'Com código enviado',
  'admin-company-detail:statistics.pending': 'Por enviar',
  'admin-company-detail:statistics.adhesionRate': 'Taxa de adesão atual',
  'admin-company-detail:statistics.lastSent': 'Último envio',
  'admin-company-detail:statistics.never': 'Nunca',
  
  'admin-company-detail:dialogs.editCompany.title': 'Editar Empresa',
  'admin-company-detail:dialogs.editCompany.description': 'Atualize as informações da empresa',
  'admin-company-detail:dialogs.editCompany.companyName': 'Nome da Empresa',
  'admin-company-detail:dialogs.editCompany.nuit': 'NUIT',
  'admin-company-detail:dialogs.editCompany.contactEmail': 'Email de Contacto',
  'admin-company-detail:dialogs.editCompany.contactPhone': 'Telefone de Contacto',
  'admin-company-detail:dialogs.editCompany.planType': 'Tipo de Plano',
  'admin-company-detail:dialogs.editCompany.sessionsAllocated': 'Sessões Alocadas',
  'admin-company-detail:dialogs.editCompany.finalNotes': 'Notas Finais',
  'admin-company-detail:dialogs.editCompany.cancel': 'Cancelar',
  'admin-company-detail:dialogs.editCompany.save': 'Guardar Alterações',
  
  'admin-company-detail:dialogs.deactivateCompany.title': 'Desativar Empresa',
  'admin-company-detail:dialogs.deactivateCompany.description': 'Tem a certeza que deseja desativar esta empresa? Todos os colaboradores perderão acesso à plataforma.',
  'admin-company-detail:dialogs.deactivateCompany.confirm': 'Sim, Desativar',
  'admin-company-detail:dialogs.deactivateCompany.cancel': 'Cancelar',
  
  'admin-company-detail:dialogs.removeEmployee.title': 'Remover Colaborador',
  'admin-company-detail:dialogs.removeEmployee.description': 'Tem a certeza que deseja remover este colaborador?',
  'admin-company-detail:dialogs.removeEmployee.confirm': 'Sim, Remover',
  'admin-company-detail:dialogs.removeEmployee.cancel': 'Cancelar',
  
  'admin-company-detail:dialogs.resendCode.title': 'Reenviar Código',
  'admin-company-detail:dialogs.resendCode.description': 'Deseja reenviar o código de acesso para este colaborador?',
  'admin-company-detail:dialogs.resendCode.confirm': 'Sim, Reenviar',
  'admin-company-detail:dialogs.resendCode.cancel': 'Cancelar',
  
  'admin-company-detail:validation.csvRequired': 'Por favor selecione um ficheiro CSV.',
  'admin-company-detail:validation.invalidFormat': 'Formato de ficheiro inválido. Use apenas .csv',
  'admin-company-detail:validation.noCodesGenerated': 'Por favor gere códigos antes de enviar emails.',
  'admin-company-detail:validation.noEmployees': 'Nenhum colaborador para processar.',
  'admin-company-detail:validation.duplicateEmail': 'Email duplicado encontrado na linha {{line}}: {{email}}',
  'admin-company-detail:validation.invalidEmail': 'Email inválido na linha {{line}}: {{email}}',
  'admin-company-detail:validation.missingFields': 'Campos obrigatórios em falta na linha {{line}}',
  'admin-company-detail:validation.processingError': 'Erro ao processar CSV. Verifique o formato.',
  
  'admin-company-detail:progress.uploadingCSV': 'A processar CSV...',
  'admin-company-detail:progress.generatingCodes': 'A gerar códigos...',
  'admin-company-detail:progress.sendingEmails': 'A enviar emails...',
  'admin-company-detail:progress.exportingCSV': 'A exportar ficheiro...',
  'admin-company-detail:progress.processing': 'A processar {{current}} de {{total}}...',
  
  'admin-company-detail:toasts.csvImportSuccess.title': 'Colaboradores Importados',
  'admin-company-detail:toasts.csvImportSuccess.description': '{{count}} colaboradores importados com sucesso.',
  'admin-company-detail:toasts.csvImportError.title': 'Erro na Importação',
  'admin-company-detail:toasts.codesGenerated.title': 'Códigos Gerados',
  'admin-company-detail:toasts.codesGenerated.description': '{{count}} códigos de acesso criados com sucesso.',
  'admin-company-detail:toasts.emailsSent.title': 'Emails Enviados',
  'admin-company-detail:toasts.emailsSent.description': '{{count}} códigos enviados por email com sucesso.',
  'admin-company-detail:toasts.emailsError.title': 'Erro no Envio',
  'admin-company-detail:toasts.emailsError.description': 'Ocorreu um erro ao enviar alguns emails. Tente novamente.',
  'admin-company-detail:toasts.exportSuccess.title': 'Ficheiro Exportado',
  'admin-company-detail:toasts.exportSuccess.description': 'CSV com códigos descarregado com sucesso.',
  'admin-company-detail:toasts.employeeRemoved.title': 'Colaborador Removido',
  'admin-company-detail:toasts.employeeRemoved.description': '{{name}} foi removido da lista.',
  'admin-company-detail:toasts.companyUpdated.title': 'Empresa Atualizada',
  'admin-company-detail:toasts.companyUpdated.description': 'As informações da empresa foram guardadas.',
  'admin-company-detail:toasts.companyDeactivated.title': 'Empresa Desativada',
  'admin-company-detail:toasts.companyDeactivated.description': 'A empresa foi desativada com sucesso.',
  'admin-company-detail:toasts.codeResent.title': 'Código Reenviado',
  'admin-company-detail:toasts.codeResent.description': 'Código de acesso enviado para {{email}}.',
  
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
