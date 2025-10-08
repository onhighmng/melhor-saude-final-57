import { MenuItem, MobileMenuItem } from './types';
import { TFunction } from 'i18next';

export const createAdminMenuItems = (
  t: TFunction,
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: t('admin.dashboard'),
    key: 'dashboard',
    hasDropdown: false,
    onClick: () => handleNavigation('/admin')
  },
  {
    title: t('admin.management'),
    key: 'gestao',
    hasDropdown: true,
    items: [
      { 
        title: t('admin.providers'),
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="providers"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: t('admin.users'),
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="accounts"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: t('admin.requests'),
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="requests"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      }
    ]
  },
  {
    title: t('admin.reports'),
    key: 'relatorios',
    hasDropdown: true,
    items: [
      { 
        title: t('admin.emailAlerts'),
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="notifications"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: t('admin.feedback'),
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="feedback"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: t('admin.inactiveAccounts'),
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="inactive"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      }
    ]
  }
];

export const createMenuItems = (
  t: TFunction,
  handleSobreNosClick: () => void,
  handlePillarClick: (pillarIndex: number) => void,
  handleNavigation: (path: string) => void,
  isAuthenticated: boolean,
  handleAuthRedirect: (section: string) => void
): MenuItem[] => [
  {
    title: t('main.aboutUs'),
    key: 'sobre',
    hasDropdown: false,
    onClick: handleSobreNosClick
  },
  {
    title: t('main.pillars'),
    key: 'pilares',
    hasDropdown: true,
    items: [
      { title: t('pillars.mentalHealth'), onClick: () => handlePillarClick(0) },
      { title: t('pillars.physicalWellness'), onClick: () => handlePillarClick(1) },
      { title: t('pillars.financialAssistance'), onClick: () => handlePillarClick(2) },
      { title: t('pillars.legalAssistance'), onClick: () => handlePillarClick(3) }
    ]
  },
  {
    title: t('main.booking'),
    key: 'agendamento',
    hasDropdown: false,
    requiresAuth: true,
    onClick: isAuthenticated ? () => {
      console.log('[Menu] Agendamento navigation');
      handleNavigation('/user/book');
    } : () => {
      console.log('[Auth] Agendamento auth redirect');
      handleAuthRedirect('agendamento');
    }
  },
  {
    title: t('main.myHealth'),
    key: 'minha-saude',
    hasDropdown: false,
    requiresAuth: true,
    onClick: isAuthenticated ? () => {
      console.log('[Menu] Minha Saúde navigation');
      handleNavigation('/user/dashboard');
    } : () => {
      console.log('[Auth] Minha Saúde auth redirect');
      handleAuthRedirect('minha-saude');
    }
  }
];

// HR Menu Items
export const createHRMenuItems = (
  t: TFunction,
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: t('company.dashboard'),
    key: 'dashboard-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/dashboard')
  },
  {
    title: t('company.reports'),
    key: 'relatorios-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/dashboard')
  }
];

export const createHRMobileMenuItems = (t: TFunction): MobileMenuItem[] => [
  {
    title: t('company.dashboard'),
    key: 'dashboard-rh',
    hasDropdown: false,
    path: '/company/dashboard'
  },
  {
    title: t('company.reports'),
    key: 'relatorios-rh',
    hasDropdown: false,
    path: '/company/dashboard'
  }
];

export const createAdminMobileMenuItems = (t: TFunction): MobileMenuItem[] => [
  {
    title: t('admin.dashboard'),
    key: 'dashboard',
    hasDropdown: false,
    path: '/admin'
  },
  {
    title: t('admin.providers'),
    key: 'prestadores',
    hasDropdown: false,
    path: '/admin',
    onClick: () => {
      setTimeout(() => {
        const element = document.querySelector('[data-value="providers"]') as HTMLElement;
        if (element) element.click();
      }, 100);
    }
  },
  {
    title: t('admin.users'),
    key: 'utilizadores',
    hasDropdown: false,
    path: '/admin',
    onClick: () => {
      setTimeout(() => {
        const element = document.querySelector('[data-value="accounts"]') as HTMLElement;
        if (element) element.click();
      }, 100);
    }
  },
  {
    title: t('admin.requests'),
    key: 'solicitacoes',
    hasDropdown: false,
    path: '/admin',
    onClick: () => {
      setTimeout(() => {
        const element = document.querySelector('[data-value="requests"]') as HTMLElement;
        if (element) element.click();
      }, 100);
    }
  },
  {
    title: t('admin.emailAlerts'),
    key: 'notifications',
    hasDropdown: false,
    path: '/admin',
    onClick: () => {
      setTimeout(() => {
        const element = document.querySelector('[data-value="notifications"]') as HTMLElement;
        if (element) element.click();
      }, 100);
    }
  },
  {
    title: t('admin.feedback'),
    key: 'feedback',
    hasDropdown: false,
    path: '/admin',
    onClick: () => {
      setTimeout(() => {
        const element = document.querySelector('[data-value="feedback"]') as HTMLElement;
        if (element) element.click();
      }, 100);
    }
  }
];

export const createMobileMenuItems = (
  t: TFunction,
  isAuthenticated: boolean,
  handleAuthRedirect: (section: string) => void,
  handleSobreNosClick?: () => void,
  handlePillarClick?: (pillarIndex: number) => void
): MobileMenuItem[] => [
  {
    title: t('main.aboutUs'),
    key: 'sobre',
    hasDropdown: false,
    onClick: handleSobreNosClick
  },
  {
    title: t('main.pillars'),
    key: 'pilares',
    hasDropdown: true,
    items: [
      { title: t('pillars.mentalHealth'), onClick: () => handlePillarClick?.(0) },
      { title: t('pillars.physicalWellness'), onClick: () => handlePillarClick?.(1) },
      { title: t('pillars.financialAssistance'), onClick: () => handlePillarClick?.(2) },
      { title: t('pillars.legalAssistance'), onClick: () => handlePillarClick?.(3) }
    ]
  },
  {
    title: t('main.booking'),
    key: 'agendamento',
    hasDropdown: false,
    requiresAuth: true,
    path: isAuthenticated ? '/user/book' : undefined,
    onClick: !isAuthenticated ? () => handleAuthRedirect('agendamento') : undefined
  },
  {
    title: t('main.myHealth'),
    key: 'minha-saude',
    hasDropdown: false,
    requiresAuth: true,
    path: isAuthenticated ? '/user/dashboard' : undefined,
    onClick: !isAuthenticated ? () => handleAuthRedirect('minha-saude') : undefined
  }
];
