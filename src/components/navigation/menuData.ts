import { MenuItem, MobileMenuItem } from './types';

export const createAdminMenuItems = (
  handleNavigation: (path: string) => void,
  handleSobreNosClick: () => void,
  handlePillarClick: (pillarIndex: number) => void
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
    title: 'Admin',
    key: 'admin-menu',
    hasDropdown: true,
    items: [
      { 
        title: 'Dashboard',
        onClick: () => handleNavigation('/admin')
      },
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
      }
    ]
  }
];

// Regular authenticated user menu items
export const createUserMenuItems = (
  handleNavigation: (path: string) => void,
  handleSobreNosClick: () => void,
  handlePillarClick: (pillarIndex: number) => void
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
    title: 'Minha Saúde',
    key: 'user-menu',
    hasDropdown: true,
    items: [
      { title: 'Dashboard', onClick: () => handleNavigation('/user/dashboard') },
      { title: 'Agendar Sessão', onClick: () => handleNavigation('/user/book') },
      { title: 'Meu Percurso', onClick: () => handleNavigation('/user/sessions') }
    ]
  }
];

// Unauthenticated user menu items
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
  handleNavigation: (path: string) => void,
  handleSobreNosClick: () => void,
  handlePillarClick: (pillarIndex: number) => void
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
    title: 'RH',
    key: 'rh-menu',
    hasDropdown: true,
    items: [
      { title: 'Dashboard', onClick: () => handleNavigation('/company/dashboard') },
      { title: 'Colaboradores', onClick: () => handleNavigation('/company/colaboradores') },
      { title: 'Relatórios', onClick: () => handleNavigation('/company/relatorios') }
    ]
  }
];

export const createHRMobileMenuItems = (
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
    title: 'Dashboard',
    key: 'dashboard-rh',
    hasDropdown: false,
    path: '/company/dashboard'
  },
  {
    title: 'Colaboradores',
    key: 'colaboradores-rh',
    hasDropdown: false,
    path: '/company/colaboradores'
  },
  {
    title: 'Relatórios',
    key: 'relatorios-rh',
    hasDropdown: false,
    path: '/company/relatorios'
  }
];

export const createAdminMobileMenuItems = (
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
  }
];

// Prestador Menu Items
export const createPrestadorMenuItems = (
  handleNavigation: (path: string) => void,
  handleSobreNosClick: () => void,
  handlePillarClick: (pillarIndex: number) => void
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
    title: 'Prestador',
    key: 'prestador-menu',
    hasDropdown: true,
    items: [
      { title: 'Dashboard', onClick: () => handleNavigation('/prestador/dashboard') },
      { title: 'Calendário', onClick: () => handleNavigation('/prestador/calendario') },
      { title: 'Sessões', onClick: () => handleNavigation('/prestador/sessoes') }
    ]
  }
];

export const createPrestadorMobileMenuItems = (
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
  handleNavigation: (path: string) => void,
  handleSobreNosClick: () => void,
  handlePillarClick: (pillarIndex: number) => void
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
    title: 'Especialista',
    key: 'especialista-menu',
    hasDropdown: true,
    items: [
      { title: 'Dashboard', onClick: () => handleNavigation('/especialista/dashboard') },
      { title: 'Sessões', onClick: () => handleNavigation('/especialista/sessoes') },
      { title: 'Pacientes', onClick: () => handleNavigation('/especialista/pacientes') }
    ]
  }
];

export const createEspecialistaMobileMenuItems = (
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
  },
  {
    title: 'Pacientes',
    key: 'pacientes-especialista',
    hasDropdown: false,
    path: '/especialista/pacientes'
  }
];

// Regular user mobile menu items
export const createUserMobileMenuItems = (
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
    title: 'Dashboard',
    key: 'dashboard-user',
    hasDropdown: false,
    path: '/user/dashboard'
  },
  {
    title: 'Agendar Sessão',
    key: 'book-user',
    hasDropdown: false,
    path: '/user/book'
  },
  {
    title: 'Meu Percurso',
    key: 'sessions-user',
    hasDropdown: false,
    path: '/user/sessions'
  }
];

// Unauthenticated mobile menu items
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