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
  
  // Admin Company Detail
  'admin-company-detail.header.title': 'Detalhes da Empresa',
  'admin-company-detail.header.subtitle': 'Gestão de colaboradores e códigos de acesso',
  'admin-company-detail.actions.editCompany': 'Editar Empresa',
  'admin-company-detail.actions.viewReport': 'Ver Relatório Mensal',
  'admin-company-detail.actions.deactivateCompany': 'Desativar Empresa',
  'admin-company-detail.actions.importEmployees': 'Importar Colaboradores',
  'admin-company-detail.actions.generateCodes': 'Gerar Códigos',
  'admin-company-detail.actions.sendEmails': 'Enviar por Email',
  'admin-company-detail.actions.exportCSV': 'Exportar CSV',
  'admin-company-detail.actions.downloadTemplate': 'Descarregar modelo CSV',
  'admin-company-detail.actions.resend': 'Reenviar',
  'admin-company-detail.actions.remove': 'Remover',
  
  'admin-company-detail.tooltips.importCSV': 'Faça upload de um ficheiro .csv com nome e email dos colaboradores',
  'admin-company-detail.tooltips.generateCodes': 'Cria códigos únicos para todos os colaboradores importados',
  'admin-company-detail.tooltips.sendEmails': 'Envia automaticamente os códigos para o email de cada colaborador',
  'admin-company-detail.tooltips.exportCSV': 'Descarregue um ficheiro com nomes e códigos para enviar à empresa',
  'admin-company-detail.tooltips.resendCode': 'Reenviar código por email',
  'admin-company-detail.tooltips.removeEmployee': 'Remover colaborador',
  
  'admin-company-detail.company.nuit': 'NUIT',
  'admin-company-detail.company.employees': 'Colaboradores',
  'admin-company-detail.company.plan': 'Plano',
  'admin-company-detail.company.sessionsPerMonth': 'sessões/mês',
  'admin-company-detail.company.status': 'Estado',
  'admin-company-detail.company.statusActive': 'Ativa',
  'admin-company-detail.company.statusOnboarding': 'Em Onboarding',
  'admin-company-detail.company.statusInactive': 'Inativa',
  
  'admin-company-detail.sessions.title': 'Sessões',
  'admin-company-detail.sessions.used': 'Usadas',
  'admin-company-detail.sessions.remaining': 'Restantes',
  'admin-company-detail.sessions.of': 'de',
  
  'admin-company-detail.management.title': 'Gestão de Colaboradores',
  'admin-company-detail.management.subtitle': 'Importe, gere e distribua códigos de acesso',
  
  'admin-company-detail.table.name': 'Nome',
  'admin-company-detail.table.email': 'Email',
  'admin-company-detail.table.code': 'Código',
  'admin-company-detail.table.sentDate': 'Data de Envio',
  'admin-company-detail.table.status': 'Estado',
  'admin-company-detail.table.actions': 'Ações',
  'admin-company-detail.table.noEmployees': 'Nenhum colaborador importado',
  'admin-company-detail.table.importFirst': 'Comece por importar colaboradores através de um ficheiro CSV',
  
  'admin-company-detail.status.semCodigo': 'Sem Código',
  'admin-company-detail.status.codigoGerado': 'Código Gerado',
  'admin-company-detail.status.enviado': 'Enviado',
  'admin-company-detail.status.erro': 'Erro no Envio',
  
  'admin-company-detail.statistics.title': 'Estatísticas Rápidas',
  'admin-company-detail.statistics.totalEmployees': 'Total de colaboradores',
  'admin-company-detail.statistics.codeSent': 'Com código enviado',
  'admin-company-detail.statistics.pending': 'Por enviar',
  'admin-company-detail.statistics.adoptionRate': 'Taxa de adesão',
  'admin-company-detail.statistics.lastSent': 'Último envio',
  'admin-company-detail.statistics.at': 'às',
  
  'admin-company-detail.progress.uploading': 'A carregar ficheiro...',
  'admin-company-detail.progress.generatingCodes': 'A gerar códigos...',
  'admin-company-detail.progress.sendingEmails': 'A enviar emails',
  'admin-company-detail.progress.processing': 'A processar...',
  
  'admin-company-detail.dialogs.csvPreview.title': 'Pré-visualização do CSV',
  'admin-company-detail.dialogs.csvPreview.description': '{{count}} colaborador(es) encontrado(s). Verifique os dados antes de importar.',
  'admin-company-detail.dialogs.csvPreview.confirm': 'Importar Colaboradores',
  
  'admin-company-detail.dialogs.deactivateCompany.title': 'Desativar Empresa',
  'admin-company-detail.dialogs.deactivateCompany.description': 'Esta ação irá desativar todos os colaboradores e suspender o acesso da empresa. Tem a certeza?',
  'admin-company-detail.dialogs.deactivateCompany.cancel': 'Cancelar',
  'admin-company-detail.dialogs.deactivateCompany.confirm': 'Desativar',
  
  'admin-company-detail.dialogs.removeEmployee.title': 'Remover Colaborador',
  'admin-company-detail.dialogs.removeEmployee.description': 'Tem a certeza que deseja remover este colaborador? Esta ação não pode ser desfeita.',
  'admin-company-detail.dialogs.removeEmployee.cancel': 'Cancelar',
  'admin-company-detail.dialogs.removeEmployee.confirm': 'Remover',
  
  'admin-company-detail.dialogs.resendCode.title': 'Reenviar Código',
  'admin-company-detail.dialogs.resendCode.description': 'Deseja reenviar o código de acesso para o email deste colaborador?',
  'admin-company-detail.dialogs.resendCode.cancel': 'Cancelar',
  'admin-company-detail.dialogs.resendCode.confirm': 'Reenviar',
  
  'admin-company-detail.dialogs.editCompany.title': 'Editar Empresa',
  'admin-company-detail.dialogs.editCompany.description': 'Atualize os dados da empresa',
  'admin-company-detail.dialogs.editCompany.companyName': 'Nome da Empresa',
  'admin-company-detail.dialogs.editCompany.nuit': 'NUIT',
  'admin-company-detail.dialogs.editCompany.contactEmail': 'Email de Contacto',
  'admin-company-detail.dialogs.editCompany.contactPhone': 'Telefone de Contacto',
  'admin-company-detail.dialogs.editCompany.planType': 'Tipo de Plano',
  'admin-company-detail.dialogs.editCompany.sessionsAllocated': 'Sessões Alocadas',
  'admin-company-detail.dialogs.editCompany.finalNotes': 'Notas Finais',
  'admin-company-detail.dialogs.editCompany.cancel': 'Cancelar',
  'admin-company-detail.dialogs.editCompany.save': 'Guardar Alterações',
  
  'admin-company-detail.validation.errors': 'Erros de Validação',
  'admin-company-detail.validation.lineError': 'Linha {{line}}: {{field}} - {{message}}',
  'admin-company-detail.validation.processingError': 'Erro ao processar ficheiro CSV',
  
  'admin-company-detail.toasts.csvImportSuccess.title': 'CSV Importado',
  'admin-company-detail.toasts.csvImportSuccess.description': '{{count}} colaborador(es) importado(s) com sucesso',
  'admin-company-detail.toasts.csvImportError.title': 'Erro na Importação',
  'admin-company-detail.toasts.codesGenerated.title': 'Códigos Gerados',
  'admin-company-detail.toasts.codesGenerated.description': '{{count}} código(s) gerado(s) com sucesso',
  'admin-company-detail.toasts.emailsSent.title': 'Emails Enviados',
  'admin-company-detail.toasts.emailsSent.description': '{{count}} email(s) enviado(s) com sucesso',
  'admin-company-detail.toasts.exportSuccess.title': 'CSV Exportado',
  'admin-company-detail.toasts.exportSuccess.description': 'Ficheiro descarregado com sucesso',
  'admin-company-detail.toasts.employeeRemoved.title': 'Colaborador Removido',
  'admin-company-detail.toasts.employeeRemoved.description': '{{name}} foi removido da lista',
  'admin-company-detail.toasts.codeResent.title': 'Código Reenviado',
  'admin-company-detail.toasts.codeResent.description': 'Código enviado para {{email}}',
  'admin-company-detail.toasts.companyUpdated.title': 'Empresa Atualizada',
  'admin-company-detail.toasts.companyUpdated.description': 'Dados atualizados com sucesso',
  'admin-company-detail.toasts.companyDeactivated.title': 'Empresa Desativada',
  'admin-company-detail.toasts.companyDeactivated.description': 'A empresa foi desativada com sucesso',
  'admin-company-detail.toasts.noCodesNeeded.title': 'Nenhum Código Necessário',
  'admin-company-detail.toasts.noCodesNeeded.description': 'Todos os colaboradores já têm códigos gerados',
  'admin-company-detail.toasts.noEmailsToSend.title': 'Nenhum Email para Enviar',
  'admin-company-detail.toasts.noEmailsToSend.description': 'Todos os colaboradores já receberam os códigos',
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
