import { toast } from "@/components/ui/enhanced-toast";
import i18n from '@/i18n/config';

export const companyToasts = {
  // Employee management
  employeeInvited: () => toast.success(i18n.t('toasts.company.employeeInvited', { ns: 'toasts' })),
  employeeDeactivated: () => toast.success(i18n.t('toasts.company.employeeDeactivated', { ns: 'toasts' })),
  employeeActivated: () => toast.success(i18n.t('toasts.company.employeeActivated', { ns: 'toasts' })),
  employeeActivationBlocked: () => toast.error(i18n.t('toasts.company.employeeActivationBlocked', { ns: 'toasts' })),
  quotaUpdated: () => toast.success(i18n.t('toasts.company.quotaUpdated', { ns: 'toasts' })),
  
  // Invite codes
  codesCopied: (count: number) => toast.success(i18n.t('toasts.company.codesCopied', { ns: 'toasts', count })),
  codesGenerated: (count: number) => toast.success(i18n.t('toasts.company.codesGenerated', { ns: 'toasts', count })),
  linkCopied: () => toast.success(i18n.t('toasts.company.linkCopied', { ns: 'toasts' })),
  
  // Data export
  dataExported: () => toast.success(i18n.t('toasts.company.dataExported', { ns: 'toasts' })),
  reportScheduled: () => toast.success(i18n.t('toasts.company.reportScheduled', { ns: 'toasts' })),
  
  // Settings
  settingsSaved: () => toast.success(i18n.t('toasts.company.settingsSaved', { ns: 'toasts' })),
  policiesUpdated: () => toast.success(i18n.t('toasts.company.policiesUpdated', { ns: 'toasts' })),
  
  // Access management
  accessRevoked: () => toast.success(i18n.t('toasts.company.accessRevoked', { ns: 'toasts' })),
  
  // Errors
  actionFailed: (action: string) => toast.error(i18n.t('toasts.company.actionFailed', { ns: 'toasts', action })),
  networkError: () => toast.error(i18n.t('errors.network', { ns: 'errors' })),
  limitReached: () => toast.warning(i18n.t('toasts.company.limitReached', { ns: 'toasts' }))
};
