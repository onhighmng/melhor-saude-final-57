// Centralized toast messages for Normal User role
import i18n from '@/i18n/config';

export const userToastMessages = {
  success: {
    sessionBooked: i18n.t('toasts.user.sessionBooked', { ns: 'toasts' }),
    sessionCancelled: i18n.t('toasts.user.sessionCancelled', { ns: 'toasts' }),
    sessionRescheduled: i18n.t('toasts.user.sessionRescheduled', { ns: 'toasts' }),
    feedbackSubmitted: i18n.t('toasts.user.feedbackSubmitted', { ns: 'toasts' }),
    settingsSaved: i18n.t('toasts.user.settingsSaved', { ns: 'toasts' }),
    calendarAdded: i18n.t('toasts.user.calendarAdded', { ns: 'toasts' }),
    preDiagnosisComplete: i18n.t('toasts.user.preDiagnosisComplete', { ns: 'toasts' }),
  },
  
  error: {
    sessionBookingFailed: i18n.t('toasts.user.sessionBookingFailed', { ns: 'toasts' }),
    sessionCancelFailed: i18n.t('toasts.user.sessionCancelFailed', { ns: 'toasts' }),
    feedbackFailed: i18n.t('toasts.user.feedbackFailed', { ns: 'toasts' }),
    settingsFailed: i18n.t('toasts.user.settingsFailed', { ns: 'toasts' }),
    loadFailed: i18n.t('toasts.user.loadFailed', { ns: 'toasts' }),
    noQuotaAvailable: i18n.t('toasts.user.noQuotaAvailable', { ns: 'toasts' }),
  },
  
  warning: {
    lowQuota: i18n.t('toasts.user.lowQuota', { ns: 'toasts' }),
    quotaExpiring: i18n.t('toasts.user.quotaExpiring', { ns: 'toasts' }),
    sessionStartingSoon: i18n.t('toasts.user.sessionStartingSoon', { ns: 'toasts' }),
    unsavedChanges: i18n.t('toasts.user.unsavedChanges', { ns: 'toasts' }),
  },
  
  info: {
    sessionReminder: (time: string) => i18n.t('toasts.user.sessionReminder', { ns: 'toasts', time }),
    quotaReset: i18n.t('toasts.user.quotaReset', { ns: 'toasts' }),
    newResourceAvailable: i18n.t('toasts.user.newResourceAvailable', { ns: 'toasts' }),
    feedbackRequest: i18n.t('toasts.user.feedbackRequest', { ns: 'toasts' }),
  },
};
