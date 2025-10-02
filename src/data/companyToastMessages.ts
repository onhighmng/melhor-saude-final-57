import { toast } from "@/components/ui/enhanced-toast";

export const companyToasts = {
  // Employee management
  employeeInvited: () => toast.success("Colaborador convidado com sucesso – Credenciais copiadas"),
  employeeDeactivated: () => toast.success("Colaborador desativado – 1 vaga libertada"),
  employeeActivated: () => toast.success("Colaborador ativado com sucesso"),
  employeeActivationBlocked: () => toast.error("Não é possível ativar – Sem vagas disponíveis"),
  quotaUpdated: () => toast.success("Sessões atualizadas com sucesso"),
  
  // Invite codes
  codesCopied: (count: number) => toast.success(`${count} código${count > 1 ? 's' : ''} copiado${count > 1 ? 's' : ''} para a área de transferência`),
  codesGenerated: (count: number) => toast.success(`${count} novo${count > 1 ? 's' : ''} código${count > 1 ? 's' : ''} gerado${count > 1 ? 's' : ''}`),
  linkCopied: () => toast.success("Link de convite copiado para a área de transferência"),
  
  // Data export
  dataExported: () => toast.success("Dados exportados com sucesso"),
  reportScheduled: () => toast.success("Relatório agendado para envio por email"),
  
  // Settings
  settingsSaved: () => toast.success("Alterações guardadas com sucesso"),
  policiesUpdated: () => toast.success("Políticas de sessões atualizadas"),
  
  // Access management
  accessRevoked: () => toast.success("Acesso revogado com sucesso"),
  
  // Errors
  actionFailed: (action: string) => toast.error(`Erro ao ${action}. Tente novamente.`),
  networkError: () => toast.error("Erro de conexão. Verifique sua internet."),
  limitReached: () => toast.warning("Limite de vagas atingido. Desative contas ou contacte suporte.")
};
