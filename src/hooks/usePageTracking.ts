
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { navigationService } from '@/services/navigationService';

// Map of routes to their display names
const pageNames: Record<string, string> = {
  '/': 'Início',
  '/login': 'Login',
  '/reset-password': 'Recuperar Password',
  '/register/company': 'Registar Empresa',
  '/register/employee': 'Registar Colaborador',
  '/dashboard': 'Dashboard',
  '/book': 'Marcar Sessão',
  '/user/session/:id': 'Detalhe da Sessão',
  '/user/sessions': 'Minhas Sessões',
  '/user/help': 'Centro de Ajuda',
  '/user/settings': 'Definições de Conta',
  '/prestador/dashboard': 'Dashboard do Prestador',
  '/prestador/availability': 'Disponibilidade do Prestador',
  '/prestador/sessoes': 'Sessões do Prestador',
  '/prestador/sessoes/:id': 'Detalhe da Sessão',
  '/prestador/profile': 'Perfil do Prestador',
  '/admin/dashboard': 'Dashboard Admin',
  '/admin/companies': 'Empresas Admin',
  '/admin/usuarios': 'Utilizadores Admin',
  '/admin/usuarios/:id': 'Detalhe do Utilizador',
  '/admin/prestadores': 'Prestadores Admin',
  '/admin/prestadores/novo': 'Novo Prestador',
  '/admin/matching': 'Regras de Distribuição',
  '/admin/provider-change-requests': 'Pedidos de Troca',
  '/admin/agendamentos': 'Calendário da Plataforma',
  '/admin/sessoes': 'Gestão de Sessões',
  '/admin/emails': 'Gestão de Emails',
  '/admin/logs': 'Logs & Auditoria',
  '/admin/configuracoes': 'Configurações da Plataforma',
  '/company/dashboard': 'Dashboard HR',
  '/company/employees': 'Colaboradores',
  '/company/employees/:id': 'Detalhe do Colaborador',
  '/company/reports': 'Relatórios HR',
  '/company/settings': 'Configurações da Empresa',
  '/user/dashboard': 'Minha Saúde',
  '/user/book': 'Agendar Sessão',
  '/ver-sessao': 'Ver Sessão',
  '/ver-historico': 'Histórico de Sessões',
  
  '/servicos-extras': 'Serviços Extras',
  
  '/confirmacao': 'Confirmação'
};

const getPageName = (pathname: string): string => {
  // Check for dynamic routes
  if (pathname.startsWith('/admin/prestadores/') && pathname !== '/admin/prestadores') {
    return 'Perfil do Prestador';
  }
  
  if (pathname.startsWith('/prestador/dashboard/')) {
    return 'Dashboard do Prestador';
  }

  // Return mapped name or fallback
  return pageNames[pathname] || 'Página';
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const pageName = getPageName(location.pathname);
    navigationService.setCurrentPage(location.pathname, pageName);
  }, [location.pathname]);
};
