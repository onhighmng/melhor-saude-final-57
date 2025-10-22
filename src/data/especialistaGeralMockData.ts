import { CallRequest, EspecialistaGeral, EscalatedChat, ChatMessage } from '@/types/specialist';

// Mock companies for especialista geral
export const mockCompanies = [
  {
    id: 'comp-1',
    company_id: 'comp-1',
    name: 'Empresa Exemplo Lda',
    status: 'active' as const,
    total_employees: 150,
    registered_employees: 120,
    adoption_rate: 80
  },
  {
    id: 'comp-2',
    company_id: 'comp-2', 
    name: 'Tech Solutions MZ',
    status: 'active' as const,
    total_employees: 75,
    registered_employees: 45,
    adoption_rate: 60
  },
  {
    id: 'comp-3',
    company_id: 'comp-3',
    name: 'Consultoria Financeira Ltda',
    status: 'onboarding' as const,
    total_employees: 30,
    registered_employees: 15,
    adoption_rate: 50
  }
];

// Mock call requests
export const mockCallRequests: CallRequest[] = [
  {
    id: 'call-1',
    user_id: 'user-1',
    user_name: 'Ana Silva',
    user_email: 'ana.silva@empresa.co.mz',
    user_phone: '+258 84 123 4567',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'psychological',
    status: 'pending',
    wait_time: 45, // 45 minutes
    chat_session_id: 'chat-1',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    notes: 'Solicitação de ajuda com stress no trabalho'
  },
  {
    id: 'call-2',
    user_id: 'user-2',
    user_name: 'Carlos Santos',
    user_email: 'carlos.santos@tech.co.mz',
    user_phone: '+258 84 234 5678',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'financial',
    status: 'pending',
    wait_time: 120, // 2 hours
    chat_session_id: 'chat-2',
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    notes: 'Problemas financeiros pessoais, precisa de orientação'
  },
  {
    id: 'call-3',
    user_id: 'user-3',
    user_name: 'Maria Costa',
    user_email: 'maria.costa@empresa.co.mz',
    user_phone: '+258 84 345 6789',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'legal',
    status: 'resolved',
    wait_time: 30,
    chat_session_id: 'chat-3',
    assigned_specialist_id: 'spec-1',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    notes: 'Questão sobre contrato de trabalho - resolvida por telefone'
  },
  {
    id: 'call-4',
    user_id: 'user-4',
    user_name: 'João Ferreira',
    user_email: 'joao.ferreira@empresa.co.mz',
    user_phone: '+258 84 456 7890',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'physical',
    status: 'pending',
    wait_time: 90,
    chat_session_id: 'chat-4',
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    notes: 'Dores nas costas relacionadas ao trabalho remoto'
  },
  {
    id: 'call-5',
    user_id: 'user-5',
    user_name: 'Sofia Rodrigues',
    user_email: 'sofia.rodrigues@tech.co.mz',
    user_phone: '+258 84 567 8901',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'psychological',
    status: 'pending',
    wait_time: 25,
    chat_session_id: 'chat-5',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    notes: 'Ansiedade relacionada a prazos de projetos'
  },
  {
    id: 'call-6',
    user_id: 'user-6',
    user_name: 'Pedro Mendes',
    user_email: 'pedro.mendes@empresa.co.mz',
    user_phone: '+258 84 678 9012',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'financial',
    status: 'pending',
    wait_time: 180,
    chat_session_id: 'chat-6',
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    notes: 'Planejamento financeiro pós-aumento salarial'
  }
];

// Mock especialista geral user with assigned companies
export const mockEspecialistaGeral: EspecialistaGeral = {
  id: 'spec-1',
  name: 'Geral Especialista',
  email: 'geral@especialista.co.mz',
  assigned_companies: ['comp-1', 'comp-2', 'comp-3'],
  is_active: true
};

// Mock chat sessions with enhanced data
export const mockChatSessions: EscalatedChat[] = [
  {
    id: 'chat-1',
    user_id: 'user-1',
    pillar: 'psychological',
    status: 'escalated',
    ai_resolution: false,
    satisfaction_rating: null,
    phone_escalation_reason: 'Usuário solicitou ajuda humana',
    phone_contact_made: false,
    session_booked_by_specialist: null,
    type: 'triage',
    resolved: false,
    assigned_specialist_id: 'spec-1',
    company_id: 'comp-1',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    ended_at: null,
    user_name: 'Ana Silva',
    user_email: 'ana.silva@empresa.co.mz',
    user_phone: '+258 84 123 4567',
    company_name: 'Empresa Exemplo Lda',
    messages: [
      {
        id: 'msg-1',
        session_id: 'chat-1',
        role: 'user',
        content: 'Preciso de ajuda com stress no trabalho',
        metadata: {},
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-2',
        session_id: 'chat-1',
        role: 'assistant',
        content: 'Entendo que está passando por stress. Posso ajudá-lo com algumas técnicas.',
        metadata: {},
        created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-3',
        session_id: 'chat-1',
        role: 'user',
        content: 'Isso não está ajudando. Quero falar com alguém.',
        metadata: {},
        created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'chat-2',
    user_id: 'user-2',
    pillar: 'financial',
    status: 'escalated',
    ai_resolution: false,
    satisfaction_rating: null,
    phone_escalation_reason: 'Problema complexo que requer intervenção humana',
    phone_contact_made: false,
    session_booked_by_specialist: null,
    type: 'pre_diagnosis',
    resolved: false,
    assigned_specialist_id: 'spec-1',
    company_id: 'comp-2',
    created_at: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    ended_at: null,
    user_name: 'Carlos Santos',
    user_email: 'carlos.santos@tech.co.mz',
    user_phone: '+258 84 234 5678',
    company_name: 'Tech Solutions MZ',
    messages: [
      {
        id: 'msg-4',
        session_id: 'chat-2',
        role: 'user',
        content: 'Estou com muitas dívidas e não sei como resolver',
        metadata: {},
        created_at: new Date(Date.now() - 150 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-5',
        session_id: 'chat-2',
        role: 'assistant',
        content: 'Vou encaminhá-lo para um especialista financeiro que pode ajudar melhor.',
        metadata: {},
        created_at: new Date(Date.now() - 145 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Mock scheduled sessions with Especialista Geral
export const mockEspecialistaSessions = [
  {
    id: 'session-1',
    user_id: 'user-4',
    user_name: 'João Ferreira',
    user_email: 'joao.ferreira@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'psychological',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    status: 'scheduled',
    type: 'individual',
    notes: 'Sessão de acompanhamento - gestão de ansiedade'
  },
  {
    id: 'session-2',
    user_id: 'user-5',
    user_name: 'Sofia Rodrigues',
    user_email: 'sofia.rodrigues@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'financial',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00',
    status: 'scheduled',
    type: 'individual',
    notes: 'Orientação financeira básica'
  },
  {
    id: 'session-3',
    user_id: 'user-1',
    user_name: 'Ana Silva',
    user_email: 'ana.silva@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'psychological',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    status: 'scheduled',
    type: 'individual',
    notes: 'Follow-up após call request resolvido - stress no trabalho'
  },
  {
    id: 'session-4',
    user_id: 'user-2',
    user_name: 'Carlos Santos',
    user_email: 'carlos.santos@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'financial',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '11:30',
    status: 'scheduled',
    type: 'individual',
    notes: 'Acompanhamento de problemas financeiros - após escalação'
  },
  {
    id: 'session-5',
    user_id: 'user-6',
    user_name: 'Pedro Mendes',
    user_email: 'pedro.mendes@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'financial',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:00',
    status: 'scheduled',
    type: 'individual',
    notes: 'Planejamento financeiro pós-aumento - sessão agendada após call request'
  }
];

// Mock user history data
export const mockUserHistory = [
  {
    user_id: 'user-1',
    user_name: 'Ana Silva',
    user_email: 'ana.silva@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    total_chats: 3,
    total_sessions: 2,
    average_rating: 8.5,
    internal_notes: [
      {
        id: 'note-1',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Usuária demonstra alta ansiedade no trabalho. Recomendo acompanhamento regular.',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    user_id: 'user-2',
    user_name: 'Carlos Santos',
    user_email: 'carlos.santos@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    total_chats: 2,
    total_sessions: 1,
    average_rating: 7.0,
    internal_notes: [
      {
        id: 'note-2',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Usuário está passando por dificuldades financeiras sérias. Precisa de apoio contínuo.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    user_id: 'user-3',
    user_name: 'Maria Costa',
    user_email: 'maria.costa@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    total_chats: 1,
    total_sessions: 1,
    average_rating: 9.0,
    internal_notes: [
      {
        id: 'note-3',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Questão legal resolvida com sucesso. Usuária satisfeita com o atendimento.',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    user_id: 'user-4',
    user_name: 'João Ferreira',
    user_email: 'joao.ferreira@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    last_activity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    total_chats: 2,
    total_sessions: 1,
    average_rating: 8.0,
    internal_notes: [
      {
        id: 'note-4',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Problema físico relacionado ao trabalho remoto. Sessão de fisioterapia recomendada.',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Mock negative feedback data
export const mockNegativeFeedback = [
  {
    id: 'feedback-1',
    user_name: 'Ana Silva',
    user_email: 'ana.silva@empresa.co.mz',
    company_name: 'Empresa Exemplo Lda',
    company_id: 'comp-1',
    rating: 4,
    feedback: 'A sessão foi muito básica e não ajudou com o meu problema.',
    session_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    prestador_name: 'Dra. Maria Costa'
  },
  {
    id: 'feedback-2',
    user_name: 'João Santos',
    user_email: 'joao.santos@tech.co.mz',
    company_name: 'Tech Solutions MZ',
    company_id: 'comp-2',
    rating: 5,
    feedback: 'Esperava mais da consulta, não foi personalizado.',
    session_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    prestador_name: 'Dr. Carlos Silva'
  },
  {
    id: 'feedback-3',
    user_name: 'Pedro Mendes',
    user_email: 'pedro.mendes@empresa.co.mz',
    company_name: 'Empresa Exemplo Lda',
    company_id: 'comp-1',
    rating: 6,
    feedback: 'O especialista não estava preparado para minha situação específica.',
    session_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    prestador_name: 'Dra. Ana Ferreira'
  }
];

// Mock inactive users data
export const mockInactiveUsers = [
  {
    id: 'user-7',
    name: 'Carlos Rodrigues',
    email: 'carlos.rodrigues@empresa.co.mz',
    company_name: 'Empresa Exemplo Lda',
    company_id: 'comp-1',
    last_activity: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    days_inactive: 45,
    pillar: 'Saúde Mental'
  },
  {
    id: 'user-8',
    name: 'Sofia Ferreira',
    email: 'sofia.ferreira@tech.co.mz',
    company_name: 'Tech Solutions MZ',
    company_id: 'comp-2',
    last_activity: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    days_inactive: 35,
    pillar: 'Bem-Estar Físico'
  },
  {
    id: 'user-9',
    name: 'Miguel Costa',
    email: 'miguel.costa@consultoria.co.mz',
    company_name: 'Consultoria Financeira Ltda',
    company_id: 'comp-3',
    last_activity: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    days_inactive: 65,
    pillar: 'Assistência Financeira'
  }
];

// Mock referral data  
export const mockReferrals = [
  {
    id: 'ref-1',
    user_id: 'user-1',
    user_name: 'Ana Silva',
    user_email: 'ana.silva@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'psychological',
    provider_id: 'prest-1',
    provider_name: 'Dra. Maria Costa',
    status: 'scheduled',
    notes: 'Encaminhamento para terapia especializada em ansiedade',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ref-2', 
    user_id: 'user-2',
    user_name: 'Carlos Santos',
    user_email: 'carlos.santos@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'financial',
    provider_id: 'prest-2',
    provider_name: 'Dr. João Silva',
    status: 'completed',
    notes: 'Orientação financeira especializada - concluída',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Mock de estatísticas pessoais do especialista
export const mockSpecialistPersonalStats = {
  monthly_cases: 45,
  weekly_cases: 12,
  avg_response_time_minutes: 35,
  avg_rating: 8.7,
  internal_resolution_rate: 68,
  referral_rate: 32,
  satisfaction_rate: 91,
  top_pillars: [
    { pillar: 'psychological', label: 'Psicológico', count: 18, percentage: 40 },
    { pillar: 'financial', label: 'Financeiro', count: 14, percentage: 31 },
    { pillar: 'legal', label: 'Jurídico', count: 8, percentage: 18 },
    { pillar: 'physical', label: 'Físico', count: 5, percentage: 11 }
  ],
  monthly_evolution: [
    { month: 'Jan', cases: 38, rating: 8.5, resolved: 26, referred: 12 },
    { month: 'Fev', cases: 42, rating: 8.6, resolved: 29, referred: 13 },
    { month: 'Mar', cases: 45, rating: 8.7, resolved: 31, referred: 14 }
  ],
  recent_feedback: [
    { user: 'Ana Silva', rating: 9, comment: 'Muito atencioso e prestável. Ajudou bastante!', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { user: 'Carlos Santos', rating: 8, comment: 'Bom atendimento, resolveu a minha situação.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { user: 'Maria Costa', rating: 10, comment: 'Excelente! Super recomendo.', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
  ]
};

// Mock de resultados de chamadas
export const mockCallOutcomes = [
  { value: 'resolved_by_phone', label: 'Resolvido por Telefone' },
  { value: 'session_booked', label: 'Sessão Agendada' },
  { value: 'escalated_to_specialist', label: 'Encaminhado para Prestador' },
  { value: 'follow_up_needed', label: 'Requer Follow-up' }
];

// Mock de alertas urgentes
export const mockUrgentAlerts = [
  {
    id: 'alert-1',
    type: 'sla_breach',
    user_name: 'Ana Silva',
    user_id: 'user-1',
    user_phone: '+258 84 123 4567',
    company_name: 'Empresa Exemplo Lda',
    company_id: 'comp-1',
    wait_time: 1560,
    priority: 'critical',
    pillar: 'psychological' as const,
    notes: 'Utilizadora relatou crise de ansiedade aguda',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'alert-2',
    type: 'sla_breach',
    user_name: 'Carlos Mendes',
    user_id: 'user-2',
    user_phone: '+258 84 234 5678',
    company_name: 'Tech Solutions MZ',
    company_id: 'comp-2',
    wait_time: 1680,
    priority: 'critical',
    pillar: 'financial' as const,
    notes: 'Situação financeira urgente - risco de despejo',
    created_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString()
  }
];

// Mock de notas internas expandido
export const mockInternalNotes = [
  {
    id: 'note-1',
    user_id: 'user-1',
    user_name: 'Ana Silva',
    specialist_id: 'spec-1',
    specialist_name: 'Dr. João Costa',
    content: 'Utilizadora demonstra sinais de burnout severo. Relata insónia persistente há 3 semanas e dificuldade em concentração no trabalho. Situação agravada por pressão de prazos. Encaminhada para psicóloga especializada em saúde ocupacional com prioridade alta.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pillar: 'psychological' as const,
    action_taken: 'Encaminhado para prestador'
  },
  {
    id: 'note-2',
    user_id: 'user-3',
    user_name: 'Maria Costa',
    specialist_id: 'spec-1',
    specialist_name: 'Dr. João Costa',
    content: 'Situação financeira delicada devido a dívidas acumuladas de crédito pessoal e cartões. Fornecidas orientações iniciais sobre renegociação com credores e consolidação de dívidas. Utilizadora demonstrou interesse em sessão mais detalhada com consultor financeiro.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    pillar: 'financial' as const,
    action_taken: 'Resolvido na chamada'
  },
  {
    id: 'note-3',
    user_id: 'user-5',
    user_name: 'Pedro Alves',
    specialist_id: 'spec-1',
    specialist_name: 'Dr. João Costa',
    content: 'Questão legal sobre alegado despedimento sem justa causa. Caso requer análise jurídica especializada urgente. Utilizador demonstra ansiedade elevada e receio de perder direitos. Agendada sessão urgente com advogado trabalhista para análise detalhada do contrato e documentação.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    pillar: 'legal' as const,
    action_taken: 'Encaminhado para prestador'
  },
  {
    id: 'note-4',
    user_id: 'user-4',
    user_name: 'João Ferreira',
    specialist_id: 'spec-1',
    specialist_name: 'Dr. João Costa',
    content: 'Dores lombares crónicas relacionadas ao trabalho remoto. Postura inadequada durante longos períodos ao computador. Fornecidas dicas ergonómicas básicas. Recomendada avaliação com fisioterapeuta para plano de exercícios específicos.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    pillar: 'physical' as const,
    action_taken: 'Encaminhado para prestador'
  }
];

// Available users for referrals (from assigned companies)
export const mockAvailableUsers = [
  { id: 'user-1', name: 'Ana Silva', email: 'ana.silva@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' },
  { id: 'user-2', name: 'Carlos Santos', email: 'carlos.santos@tech.co.mz', company_id: 'comp-2', company: 'Tech Solutions MZ' },
  { id: 'user-3', name: 'Maria Costa', email: 'maria.costa@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' },
  { id: 'user-4', name: 'João Ferreira', email: 'joao.ferreira@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' },
  { id: 'user-5', name: 'Sofia Rodrigues', email: 'sofia.rodrigues@tech.co.mz', company_id: 'comp-2', company: 'Tech Solutions MZ' },
  { id: 'user-6', name: 'Pedro Mendes', email: 'pedro.mendes@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' },
  { id: 'user-7', name: 'Teresa Almeida', email: 'teresa.almeida@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' },
  { id: 'user-8', name: 'Ricardo Nunes', email: 'ricardo.nunes@tech.co.mz', company_id: 'comp-2', company: 'Tech Solutions MZ' }
];

// Mock admin alerts data
export const mockAdminAlerts = {
  pending_calls: mockCallRequests.filter(req => req.status === 'pending').length,
  scheduled_sessions: mockEspecialistaSessions.filter(s => s.status === 'scheduled' && s.date === new Date().toISOString().split('T')[0]).length,
  negative_feedback: mockNegativeFeedback.length,
  inactive_users: mockInactiveUsers.length
};
