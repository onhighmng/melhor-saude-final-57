import { MenuItem, MobileMenuItem } from './types';
import i18n from '@/i18n/config';

export const createAdminMenuItems = (
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: i18n.t('navigation:admin.dashboard'),
    key: 'dashboard',
    hasDropdown: false,
    onClick: () => handleNavigation('/admin')
  },
  {
    title: i18n.t('navigation:admin.management'),
    key: 'gestao',
    hasDropdown: true,
    items: [
      { 
        title: i18n.t('navigation:admin.providers'),
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="providers"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: i18n.t('navigation:admin.users'), 
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="accounts"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: i18n.t('navigation:admin.requests'),
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
    title: i18n.t('navigation:admin.reports'),
    key: 'relatorios',
    hasDropdown: true,
    items: [
      { 
        title: i18n.t('navigation:admin.emailAlerts'),
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="notifications"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: i18n.t('navigation:admin.feedback'), 
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="feedback"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: i18n.t('navigation:admin.inactiveAccounts'),
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
  handleSobreNosClick: () => void,
  handlePillarClick: (pillarIndex: number) => void,
  handleNavigation: (path: string) => void,
  isAuthenticated: boolean,
  handleAuthRedirect: (section: string) => void
): MenuItem[] => [
  {
    title: i18n.t('navigation:main.aboutUs'),
    key: 'sobre',
    hasDropdown: false,
    onClick: handleSobreNosClick
  },
  {
    title: i18n.t('navigation:main.pillars'),
    key: 'pilares',
    hasDropdown: true,
    items: [
      { title: i18n.t('navigation:pillars.mentalHealth'), onClick: () => handlePillarClick(0) },
      { title: i18n.t('navigation:pillars.physicalWellness'), onClick: () => handlePillarClick(1) },
      { title: i18n.t('navigation:pillars.financialAssistance'), onClick: () => handlePillarClick(2) },
      { title: i18n.t('navigation:pillars.legalAssistance'), onClick: () => handlePillarClick(3) }
    ]
  },
  {
    title: i18n.t('navigation:main.booking'),
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
    title: i18n.t('navigation:main.myHealth'),
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
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: i18n.t('navigation:company.dashboard'),
    key: 'dashboard-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/dashboard')
  },
  {
    title: i18n.t('navigation:company.reports'),
    key: 'relatorios-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/dashboard')
  }
];

export const createHRMobileMenuItems = (): MobileMenuItem[] => [
  {
    title: i18n.t('navigation:company.dashboard'),
    key: 'dashboard-rh',
    hasDropdown: false,
    path: '/company/dashboard'
  },
  {
    title: i18n.t('navigation:company.reports'),
    key: 'relatorios-rh',
    hasDropdown: false,
    path: '/company/dashboard'
  }
];

export const createAdminMobileMenuItems = (): MobileMenuItem[] => [
  {
    title: i18n.t('navigation:admin.dashboard'),
    key: 'dashboard',
    hasDropdown: false,
    path: '/admin'
  },
  {
    title: i18n.t('navigation:admin.providers'),
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
    title: i18n.t('navigation:admin.users'),
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
    title: i18n.t('navigation:admin.requests'),
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
    title: i18n.t('navigation:admin.emailAlerts'),
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
    title: i18n.t('navigation:admin.feedback'),
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
  isAuthenticated: boolean,
  handleAuthRedirect: (section: string) => void,
  handleSobreNosClick?: () => void,
  handlePillarClick?: (pillarIndex: number) => void
): MobileMenuItem[] => [
  {
    title: i18n.t('navigation:main.aboutUs'),
    key: 'sobre',
    hasDropdown: false,
    onClick: handleSobreNosClick
  },
  {
    title: i18n.t('navigation:main.pillars'),
    key: 'pilares',
    hasDropdown: true,
    items: [
      { title: i18n.t('navigation:pillars.mentalHealth'), onClick: () => handlePillarClick?.(0) },
      { title: i18n.t('navigation:pillars.physicalWellness'), onClick: () => handlePillarClick?.(1) },
      { title: i18n.t('navigation:pillars.financialAssistance'), onClick: () => handlePillarClick?.(2) },
      { title: i18n.t('navigation:pillars.legalAssistance'), onClick: () => handlePillarClick?.(3) }
    ]
  },
  {
    title: i18n.t('navigation:main.booking'),
    key: 'agendamento',
    hasDropdown: false,
    requiresAuth: true,
    path: isAuthenticated ? '/user/book' : undefined,
    onClick: !isAuthenticated ? () => handleAuthRedirect('agendamento') : undefined
  },
  {
    title: i18n.t('navigation:main.myHealth'),
    key: 'minha-saude',
    hasDropdown: false,
    requiresAuth: true,
    path: isAuthenticated ? '/user/dashboard' : undefined,
    onClick: !isAuthenticated ? () => handleAuthRedirect('minha-saude') : undefined
  }
];
