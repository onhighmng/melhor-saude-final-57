import { toast } from "@/components/ui/enhanced-toast";

export const companyToasts = {
  // Employee management
  employeeInvited: () => toast.success("Colaborador convidado com sucesso"),
  employeeDeactivated: () => toast.success("Colaborador desativado"),
  employeeActivated: () => toast.success("Colaborador ativado"),
  employeeActivationBlocked: () => toast.error("Não é possível ativar: limite de lugares atingido"),
  quotaUpdated: () => toast.success("Quota atualizada"),
  
  // Invite codes
  codesCopied: (count: number) => toast.success(count === 1 ? "Código copiado" : `${count} códigos copiados`),
  codesGenerated: (count: number) => toast.success(count === 1 ? "Código gerado" : `${count} códigos gerados`),
  linkCopied: () => toast.success("Link copiado"),
  
  // Data export
  dataExported: () => toast.success("Dados exportados"),
  reportScheduled: () => toast.success("Relatório agendado"),
  
  // Settings
  settingsSaved: () => toast.success("Definições guardadas"),
  policiesUpdated: () => toast.success("Políticas atualizadas"),
  
  // Access management
  accessRevoked: () => toast.success("Acesso revogado"),
  
  // Errors
  actionFailed: (action: string) => toast.error(`Falha ao ${action}`),
  networkError: () => toast.error("Erro de conexão. Verifique a sua internet"),
  limitReached: () => toast.warning("Limite atingido")
};
