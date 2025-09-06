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
        title: 'Email Alerts', 
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
    title: '4 Pilares',
    key: 'pilares',
    hasDropdown: true,
    items: [
      { title: 'Saúde mental', onClick: () => handlePillarClick(0) },
      { title: 'Bem estar físico', onClick: () => handlePillarClick(1) },
      { title: 'Assistência financeira', onClick: () => handlePillarClick(2) },
      { title: 'Assistência Jurídica', onClick: () => handlePillarClick(3) }
    ]
  },
  {
    title: 'Agendamento',
    key: 'agendamento',
    hasDropdown: false,
    requiresAuth: true,
    onClick: isAuthenticated ? () => {
      console.log('🎯 Agendamento navigation');
      handleNavigation('/user/book');
    } : () => {
      console.log('🔒 Agendamento auth redirect');
      handleAuthRedirect('agendamento');
    }
  },
  {
    title: 'Minha Saúde',
    key: 'minha-saude',
    hasDropdown: false,
    requiresAuth: true,
    onClick: isAuthenticated ? () => {
      console.log('🎯 Minha Saúde navigation');
      handleNavigation('/user/dashboard');
    } : () => {
      console.log('🔒 Minha Saúde auth redirect');
      handleAuthRedirect('minha-saude');
    }
  }
];

// HR Menu Items
export const createHRMenuItems = (
  handleNavigation: (path: string) => void
): MenuItem[] => [
  {
    title: 'Dashboard RH',
    key: 'dashboard-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/dashboard')
  },
  {
    title: 'Relatórios',
    key: 'relatorios-rh',
    hasDropdown: false,
    onClick: () => handleNavigation('/company/dashboard')
  }
];

export const createHRMobileMenuItems = (): MobileMenuItem[] => [
  {
    title: 'Dashboard RH',
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
    title: 'Email Alerts',
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

export const createMobileMenuItems = (
  isAuthenticated: boolean,
  handleAuthRedirect: (section: string) => void
): MobileMenuItem[] => [
  {
    title: 'Sobre Nós',
    key: 'sobre',
    hasDropdown: false,
    path: '/#sobre-nos'
  },
  {
    title: '4 Pilares',
    key: 'pilares',
    hasDropdown: true,
    items: [
      { title: 'Saúde mental', path: '/#pilar-0' },
      { title: 'Bem estar físico', path: '/#pilar-1' },
      { title: 'Assistência financeira', path: '/#pilar-2' },
      { title: 'Assistência Jurídica', path: '/#pilar-3' }
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
