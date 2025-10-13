import { toast } from "@/hooks/use-toast";
import { TFunction } from 'i18next';

export const showCSVImportSuccess = (t: TFunction, count: number) => {
  toast({
    title: t('admin-company-detail:toasts.csvImportSuccess.title'),
    description: t('admin-company-detail:toasts.csvImportSuccess.description', { count }),
  });
};

export const showCSVImportError = (t: TFunction, error: string) => {
  toast({
    title: t('admin-company-detail:toasts.csvImportError.title'),
    description: error,
    variant: "destructive",
  });
};

export const showCodesGeneratedSuccess = (t: TFunction, count: number) => {
  toast({
    title: t('admin-company-detail:toasts.codesGenerated.title'),
    description: t('admin-company-detail:toasts.codesGenerated.description', { count }),
  });
};

export const showEmailsSentSuccess = (t: TFunction, count: number) => {
  toast({
    title: t('admin-company-detail:toasts.emailsSent.title'),
    description: t('admin-company-detail:toasts.emailsSent.description', { count }),
  });
};

export const showEmailsSentError = (t: TFunction) => {
  toast({
    title: t('admin-company-detail:toasts.emailsError.title'),
    description: t('admin-company-detail:toasts.emailsError.description'),
    variant: "destructive",
  });
};

export const showExportSuccess = (t: TFunction) => {
  toast({
    title: t('admin-company-detail:toasts.exportSuccess.title'),
    description: t('admin-company-detail:toasts.exportSuccess.description'),
  });
};

export const showEmployeeRemovedSuccess = (t: TFunction, name: string) => {
  toast({
    title: t('admin-company-detail:toasts.employeeRemoved.title'),
    description: t('admin-company-detail:toasts.employeeRemoved.description', { name }),
  });
};

export const showCompanyUpdatedSuccess = (t: TFunction) => {
  toast({
    title: t('admin-company-detail:toasts.companyUpdated.title'),
    description: t('admin-company-detail:toasts.companyUpdated.description'),
  });
};

export const showCompanyDeactivatedSuccess = (t: TFunction) => {
  toast({
    title: t('admin-company-detail:toasts.companyDeactivated.title'),
    description: t('admin-company-detail:toasts.companyDeactivated.description'),
  });
};

export const showCodeResentSuccess = (t: TFunction, email: string) => {
  toast({
    title: t('admin-company-detail:toasts.codeResent.title'),
    description: t('admin-company-detail:toasts.codeResent.description', { email }),
  });
};