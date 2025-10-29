import { MenuItem, MobileMenuItem } from './types';

export const createAdminMenuItems = (
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: 'Dashboard',
    key: 'dashboard',
    hasDropdown: false,
    onClick: () => handleNavigation('/admin')
  },
  {
    title: 'Gestão',
    key: 'gestao',
    hasDropdown: true,
    items: [
      { 
        title: 'Prestadores',
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="providers"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: 'Utilizadores',
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="accounts"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: 'Solicitações',
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
    title: 'Relatórios',
    key: 'relatorios',
    hasDropdown: true,
    items: [
      { 
        title: 'Alertas Email',
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="notifications"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: 'Feedback',
        onClick: () => {
          handleNavigation('/admin');
          setTimeout(() => {
            const element = document.querySelector('[data-value="feedback"]') as HTMLElement;
            if (element) element.click();
          }, 100);
        }
      },
      { 
        title: 'Contas Inativas',
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
    title: 'Sobre Nós',
    key: 'sobre',
    hasDropdown: false,
    onClick: handleSobreNosClick
  },
  {
    title: 'Pilares',
    key: 'pilares',
    hasDropdown: true,
    items: [
      { title: 'Saúde Mental', onClick: () => handlePillarClick(0) },
      { title: 'Bem-estar Físico', onClick: () => handlePillarClick(1) },
      { title: 'Assistência Financeira', onClick: () => handlePillarClick(2) },
      { title: 'Assistência Jurídica', onClick: () => handlePillarClick(3) }
    ]
  },
  {
    title: 'Agendamento',
    key: 'agendamento',
    hasDropdown: false,
    requiresAuth: true,
    onClick: isAuthenticated ? () => {
      handleNavigation('/user/book');
    } : () => {
      handleAuthRedirect('agendamento');
    }
  },
  {
    title: 'Minha Saúde',
    key: 'minha-saude',
    hasDropdown: false,
    requiresAuth: true,
    onClick: isAuthenticated ? () => {
      handleNavigation('/user/dashboard');
    } : () => {
      handleAuthRedirect('minha-saude');
    }
  }
];

// HR Menu Items
export const createHRMenuItems = (
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: 'Dashboard',
    key: 'dashboard-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/dashboard')
  },
  {
    title: 'Colaboradores',
    key: 'colaboradores-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/colaboradores')
  },
  {
    title: 'Sessões',
    key: 'sessoes-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/sessions')
  },
  {
    title: 'Relatórios',
    key: 'relatorios-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/relatorios')
  },
  {
    title: 'Definições',
    key: 'definicoes-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/settings')
  }
];

export const createHRMobileMenuItems = (): MobileMenuItem[] => [
  {
    title: 'Dashboard',
    key: 'dashboard-rh',
    hasDropdown: false,
    path: '/company/dashboard'
  },
  {
    title: 'Relatórios',
    key: 'relatorios-rh',
    hasDropdown: false,
    path: '/company/dashboard'
  }
];

export const createAdminMobileMenuItems = (): MobileMenuItem[] => [
  {
    title: 'Dashboard',
    key: 'dashboard',
    hasDropdown: false,
    path: '/admin'
  },
  {
    title: 'Prestadores',
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
    title: 'Utilizadores',
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
    title: 'Solicitações',
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
    title: 'Alertas Email',
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
    title: 'Feedback',
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

// Prestador Menu Items
export const createPrestadorMenuItems = (
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: 'Dashboard',
    key: 'dashboard-prestador',
    hasDropdown: false,
    onClick: () => handleNavigation('/prestador/dashboard')
  },
  {
    title: 'Calendário',
    key: 'calendario-prestador',
    hasDropdown: false,
    onClick: () => handleNavigation('/prestador/calendario')
  },
  {
    title: 'Sessões',
    key: 'sessoes-prestador',
    hasDropdown: false,
    onClick: () => handleNavigation('/prestador/sessoes')
  },
  {
    title: 'Estatísticas',
    key: 'stats-prestador',
    hasDropdown: false,
    onClick: () => handleNavigation('/prestador/stats')
  }
];

export const createPrestadorMobileMenuItems = (): MobileMenuItem[] => [
  {
    title: 'Dashboard',
    key: 'dashboard-prestador',
    hasDropdown: false,
    path: '/prestador/dashboard'
  },
  {
    title: 'Calendário',
    key: 'calendario-prestador',
    hasDropdown: false,
    path: '/prestador/calendario'
  },
  {
    title: 'Sessões',
    key: 'sessoes-prestador',
    hasDropdown: false,
    path: '/prestador/sessoes'
  }
];

// Especialista Menu Items
export const createEspecialistaMenuItems = (
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: 'Dashboard',
    key: 'dashboard-especialista',
    hasDropdown: false,
    onClick: () => handleNavigation('/especialista/dashboard')
  },
  {
    title: 'Sessões',
    key: 'sessoes-especialista',
    hasDropdown: false,
    onClick: () => handleNavigation('/especialista/sessoes')
  },
  {
    title: 'Pacientes',
    key: 'pacientes-especialista',
    hasDropdown: false,
    onClick: () => handleNavigation('/especialista/pacientes')
  }
];

export const createEspecialistaMobileMenuItems = (): MobileMenuItem[] => [
  {
    title: 'Dashboard',
    key: 'dashboard-especialista',
    hasDropdown: false,
    path: '/especialista/dashboard'
  },
  {
    title: 'Sessões',
    key: 'sessoes-especialista',
    hasDropdown: false,
    path: '/especialista/sessoes'
  }
];

export const createMobileMenuItems = (
  isAuthenticated: boolean,
  handleAuthRedirect: (section: string) => void,
  handleSobreNosClick?: () => void,
  handlePillarClick?: (pillarIndex: number) => void
): MobileMenuItem[] => [
  {
    title: 'Sobre Nós',
    key: 'sobre',
    hasDropdown: false,
    onClick: handleSobreNosClick
  },
  {
    title: 'Pilares',
    key: 'pilares',
    hasDropdown: true,
    items: [
      { title: 'Saúde Mental', onClick: () => handlePillarClick?.(0) },
      { title: 'Bem-estar Físico', onClick: () => handlePillarClick?.(1) },
      { title: 'Assistência Financeira', onClick: () => handlePillarClick?.(2) },
      { title: 'Assistência Jurídica', onClick: () => handlePillarClick?.(3) }
    ]
  },
  {
    title: 'Agendamento',
    key: 'agendamento',
    hasDropdown: false,
    requiresAuth: true,
    path: isAuthenticated ? '/user/book' : undefined,
    onClick: !isAuthenticated ? () => handleAuthRedirect('agendamento') : undefined
  },
  {
    title: 'Minha Saúde',
    key: 'minha-saude',
    hasDropdown: false,
    requiresAuth: true,
    path: isAuthenticated ? '/user/dashboard' : undefined,
    onClick: !isAuthenticated ? () => handleAuthRedirect('minha-saude') : undefined
  }
];