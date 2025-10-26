import SpecialistLayout from './SpecialistLayout';

// Mock data
const mockCases = [
  {
    id: '1',
    collaborator: 'Ana Silva',
    pillar: 'Saúde Mental',
    status: 'resolved' as const,
    responseTime: '1.5h',
    resolution: 'Sessão agendada',
    date: '2025-10-12',
    email: 'ana.silva@company.com',
    phone: '+258 82 123 4567',
    priority: 'Alta',
    company: 'Tech Corp',
    notes: 'Cliente relatou ansiedade no trabalho. Agendada sessão de terapia para próxima semana. Medicação prescrita conforme protocolo.',
  },
  {
    id: '2',
    collaborator: 'Carlos Santos',
    pillar: 'Bem-Estar Físico',
    status: 'in_progress' as const,
    responseTime: '-',
    resolution: 'Em acompanhamento',
    date: '2025-10-13',
    email: 'carlos.santos@company.com',
    phone: '+258 84 987 6543',
    priority: 'Média',
    company: 'Innovation Labs',
    notes: 'Cliente com dores nas costas relacionadas ao trabalho remoto. Agendada consulta com fisioterapeuta. Acompanhamento semanal.',
  },
  {
    id: '3',
    collaborator: 'Beatriz Ferreira',
    pillar: 'Assistência Financeira',
    status: 'forwarded' as const,
    responseTime: '3h',
    resolution: 'Encaminhado para especialista',
    date: '2025-10-11',
    email: 'beatriz.ferreira@company.com',
    phone: '+258 85 555 1234',
    priority: 'Alta',
    company: 'Global Solutions',
    notes: 'Solicitação de empréstimo consignado. Encaminhado para análise financeira. Documentação em análise.',
  },
  {
    id: '4',
    collaborator: 'Daniel Rocha',
    pillar: 'Assistência Jurídica',
    status: 'resolved' as const,
    responseTime: '2h',
    resolution: 'Resolvido por telefone',
    date: '2025-10-10',
    email: 'daniel.rocha@company.com',
    phone: '+258 83 777 8888',
    priority: 'Baixa',
    company: 'Digital Ventures',
    notes: 'Consulta sobre direitos trabalhistas. Orientação fornecida por telefone. Caso resolvido completamente.',
  },
];

export default function AdminSpecialistTab() {
  return (
    <div>
      <SpecialistLayout cases={mockCases} />
    </div>
  );
}
