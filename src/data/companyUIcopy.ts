// Centralized UI copy for Company (HR) role
export const companyUIcopy = {
  dashboard: {
    inviteButton: {
      active: "Convidar Novo Colaborador",
      limitTooltip: "Limite atingido – Desative contas ou contacte suporte"
    },
    seatUsage: {
      manage: "Gerir Colaboradores",
      reviewAllocation: "Rever Alocação de Vagas"
    },
    quickActions: {
      viewReport: "Ver Relatório Mensal",
      exportData: "Exportar Dados",
      configureNotifications: "Configurar Notificações"
    }
  },
  employees: {
    addButton: "Adicionar Colaborador",
    filters: {
      viewActive: "Ver Apenas Ativos",
      viewInactive: "Ver Inativos",
      all: "Todos"
    },
    quotaTooltip: (used: number, total: number) => `${used} de ${total} sessões usadas`,
    actions: {
      viewDetails: "Ver Detalhes",
      deactivate: "Desativar Conta",
      activate: "Ativar Conta"
    },
    roles: {
      hr: "RH",
      employee: "Colaborador"
    }
  },
  invite: {
    modal: {
      title: "Convidar Colaborador",
      generatePassword: "Gerar Senha Segura",
      submit: "Convidar",
      cancel: "Cancelar"
    },
    success: "Colaborador convidado com sucesso – Credenciais copiadas"
  },
  employeeDetail: {
    quotaAdjust: {
      edit: "Editar Sessões",
      save: "Guardar Alterações"
    },
    providers: {
      reassign: "Reatribuir Prestador"
    },
    actions: {
      exportHistory: "Exportar Histórico",
      revokeAccess: "Revogar Acesso"
    },
    emptyHistory: "Este colaborador ainda não realizou sessões"
  },
  deactivate: {
    action: "Desativar Conta",
    confirm: "Confirmar Desativação",
    success: "Colaborador desativado – 1 vaga libertada",
    warning: "Tem a certeza que deseja desativar esta conta?"
  },
  activate: {
    action: "Ativar Conta",
    success: "Colaborador ativado com sucesso",
    blocked: "Não é possível ativar – Sem vagas disponíveis"
  },
  inviteCodes: {
    actions: {
      copyActive: "Copiar Códigos Ativos",
      generate: "Gerar Novos Códigos",
      export: "Exportar Lista",
      copyLink: "Copiar Link de Convite",
      qrCode: "QR Code – em breve"
    },
    banner: "Partilhe os códigos com os colaboradores para iniciar sessão",
    status: {
      active: "Ativo",
      used: "Utilizado",
      revoked: "Revogado"
    }
  },
  reports: {
    actions: {
      downloadCSV: "Download CSV",
      exportPDF: "Exportar PDF",
      scheduleEmail: "Agendar"
    },
    adoption: {
      excellent: "80% de adesão – Excelente",
      good: "60% de adesão – Bom",
      needsImprovement: "40% de adesão – Precisa melhorar"
    }
  },
  settings: {
    save: "Guardar Alterações",
    quotaPolicies: "Atualizar Políticas de Sessões",
    rolloverTooltip: "Permite que sessões não usadas passem para o próximo ciclo",
    customFields: {
      add: "Adicionar Campo",
      remove: "Remover"
    },
    notifications: {
      threshold: "Receber alerta a partir de X% de uso"
    },
    contacts: {
      add: "Adicionar RH de Suporte"
    },
    unsavedChanges: "⚠️ Alterações por guardar"
  },
  revokeAccess: {
    title: "Revogar Acesso",
    warning: "Revogar acesso – esta ação é permanente",
    confirm: "Tem a certeza? Esta ação não pode ser revertida.",
    success: "Acesso revogado com sucesso"
  }
};
