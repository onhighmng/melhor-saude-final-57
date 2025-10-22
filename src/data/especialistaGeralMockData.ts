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
  },
  {
    id: 'call-7',
    user_id: 'user-7',
    user_name: 'Ricardo Almeida',
    user_email: 'ricardo.almeida@tech.co.mz',
    user_phone: '+258 84 789 0123',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'physical',
    status: 'pending',
    wait_time: 1500, // 25 hours - SLA breach
    chat_session_id: 'chat-7',
    created_at: new Date(Date.now() - 1500 * 60 * 1000).toISOString(),
    notes: 'URGENTE: Dores severas que impedem trabalho'
  },
  {
    id: 'call-8',
    user_id: 'user-8',
    user_name: 'Isabel Martins',
    user_email: 'isabel.martins@empresa.co.mz',
    user_phone: '+258 84 890 1234',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'psychological',
    status: 'pending',
    wait_time: 300, // 5 hours
    chat_session_id: 'chat-8',
    created_at: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    notes: 'Situação de crise emocional, necessita atenção'
  },
  {
    id: 'call-9',
    user_id: 'user-9',
    user_name: 'Luís Pereira',
    user_email: 'luis.pereira@tech.co.mz',
    user_phone: '+258 84 901 2345',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'legal',
    status: 'pending',
    wait_time: 60,
    chat_session_id: 'chat-9',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    notes: 'Dúvida sobre direitos laborais'
  },
  {
    id: 'call-10',
    user_id: 'user-10',
    user_name: 'Carla Fernandes',
    user_email: 'carla.fernandes@empresa.co.mz',
    user_phone: '+258 84 012 3456',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'financial',
    status: 'pending',
    wait_time: 15,
    chat_session_id: 'chat-10',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    notes: 'Pedido de aconselhamento financeiro para investimentos'
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
  // Today's sessions
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
    time: '09:00',
    status: 'scheduled',
    session_type: 'video',
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
    date: new Date().toISOString().split('T')[0],
    time: '11:30',
    status: 'scheduled',
    session_type: 'call',
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
    time: '14:00',
    status: 'scheduled',
    session_type: 'video',
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
    date: new Date().toISOString().split('T')[0],
    time: '16:30',
    status: 'scheduled',
    session_type: 'video',
    type: 'individual',
    notes: 'Acompanhamento de problemas financeiros'
  },
  // Future sessions - Tomorrow
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
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00',
    status: 'scheduled',
    session_type: 'call',
    type: 'individual',
    notes: 'Planejamento financeiro pós-aumento'
  },
  {
    id: 'session-6',
    user_id: 'user-8',
    user_name: 'Ricardo Almeida',
    user_email: 'ricardo.almeida@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'physical',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:00',
    status: 'scheduled',
    session_type: 'video',
    type: 'individual',
    notes: 'Orientação sobre ergonomia no trabalho'
  },
  // Future sessions - 2 days
  {
    id: 'session-7',
    user_id: 'user-9',
    user_name: 'Isabel Martins',
    user_email: 'isabel.martins@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'legal',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:30',
    status: 'scheduled',
    session_type: 'video',
    type: 'individual',
    notes: 'Questões sobre direitos laborais'
  },
  {
    id: 'session-8',
    user_id: 'user-10',
    user_name: 'Luís Pereira',
    user_email: 'luis.pereira@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'psychological',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    status: 'scheduled',
    session_type: 'call',
    type: 'individual',
    notes: 'Gestão de stress e burnout'
  },
  // Future sessions - 3 days
  {
    id: 'session-9',
    user_id: 'user-11',
    user_name: 'Carla Fernandes',
    user_email: 'carla.fernandes@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'physical',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '11:00',
    status: 'scheduled',
    session_type: 'video',
    type: 'individual',
    notes: 'Avaliação de postura e exercícios'
  },
  // Past sessions - completed
  {
    id: 'session-10',
    user_id: 'user-7',
    user_name: 'Maria Costa',
    user_email: 'maria.costa@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'legal',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00',
    status: 'completed',
    session_type: 'video',
    type: 'individual',
    notes: 'Consulta jurídica sobre contrato de trabalho - resolvida com sucesso'
  },
  {
    id: 'session-11',
    user_id: 'user-12',
    user_name: 'Paulo Silva',
    user_email: 'paulo.silva@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'psychological',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:30',
    status: 'completed',
    session_type: 'call',
    type: 'individual',
    notes: 'Técnicas de relaxamento ensinadas'
  },
  {
    id: 'session-12',
    user_id: 'user-13',
    user_name: 'Rita Santos',
    user_email: 'rita.santos@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'financial',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:00',
    status: 'completed',
    session_type: 'video',
    type: 'individual',
    notes: 'Plano de poupança criado e acordado'
  },
  {
    id: 'session-13',
    user_id: 'user-14',
    user_name: 'Fernando Costa',
    user_email: 'fernando.costa@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'physical',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    status: 'completed',
    session_type: 'call',
    type: 'individual',
    notes: 'Exercícios posturais recomendados'
  },
  // Past sessions - cancelled
  {
    id: 'session-14',
    user_id: 'user-15',
    user_name: 'Teresa Rodrigues',
    user_email: 'teresa.rodrigues@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'psychological',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '11:00',
    status: 'cancelled',
    session_type: 'video',
    type: 'individual',
    notes: 'Cancelada pelo colaborador - reagendar'
  },
  {
    id: 'session-15',
    user_id: 'user-16',
    user_name: 'Miguel Alves',
    user_email: 'miguel.alves@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'legal',
    specialist_type: 'Especialista Geral',
    specialist_name: 'Geral Especialista',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '16:00',
    status: 'cancelled',
    session_type: 'call',
    type: 'individual',
    notes: 'Cancelada - problema resolvido antes da sessão'
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
    pillar_attended: 'psychological',
    last_session_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
      },
      {
        id: 'note-1-2',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Progresso notável desde a última sessão. Técnicas de respiração estão ajudando.',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Estou muito stressada com o trabalho', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Entendo. Pode me contar mais sobre o que especificamente está causando esse stress?', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'São muitas responsabilidades e prazos apertados', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-2',
    user_name: 'Carlos Santos',
    user_email: 'carlos.santos@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar_attended: 'financial',
    last_session_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
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
    ],
    chat_history: [
      { role: 'user', content: 'Preciso de ajuda para gerir melhor o meu dinheiro', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Claro, posso ajudá-lo com isso. Vamos começar por entender a sua situação atual.', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-3',
    user_name: 'Maria Costa',
    user_email: 'maria.costa@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar_attended: 'legal',
    last_session_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
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
    ],
    chat_history: [
      { role: 'user', content: 'Tenho dúvidas sobre o meu contrato de trabalho', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Posso ajudá-la com essas questões legais. Que tipo de dúvidas tem?', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-4',
    user_name: 'João Ferreira',
    user_email: 'joao.ferreira@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar_attended: 'physical',
    last_session_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    ],
    chat_history: [
      { role: 'user', content: 'Tenho dores nas costas do trabalho em casa', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Entendo. Vamos avaliar a sua postura e ergonomia no trabalho remoto.', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-5',
    user_name: 'Sofia Rodrigues',
    user_email: 'sofia.rodrigues@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar_attended: 'psychological',
    last_session_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    total_chats: 4,
    total_sessions: 3,
    average_rating: 9.5,
    internal_notes: [
      {
        id: 'note-5',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Caso de burnout em recuperação. Excelente progresso nas últimas semanas.',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Sinto-me esgotada e sem energia para trabalhar', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Parece que pode estar experienciando sintomas de burnout. Vamos conversar sobre isso.', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-6',
    user_name: 'Pedro Mendes',
    user_email: 'pedro.mendes@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar_attended: 'financial',
    last_session_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    total_chats: 3,
    total_sessions: 2,
    average_rating: 7.5,
    internal_notes: [
      {
        id: 'note-6',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Usuário implementou plano de poupança. Acompanhar progresso mensalmente.',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Quero começar a poupar mas não sei como', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Ótimo! Vamos criar um plano de poupança adequado para si.', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-7',
    user_name: 'Ricardo Almeida',
    user_email: 'ricardo.almeida@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar_attended: 'physical',
    last_session_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    total_chats: 2,
    total_sessions: 2,
    average_rating: 8.8,
    internal_notes: [
      {
        id: 'note-7',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Melhorias significativas na postura e redução de dores. Continuar exercícios recomendados.',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'As dores no pescoço pioraram', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Vamos avaliar sua estação de trabalho e ajustar a ergonomia.', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-8',
    user_name: 'Isabel Martins',
    user_email: 'isabel.martins@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar_attended: 'legal',
    last_session_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    total_chats: 1,
    total_sessions: 1,
    average_rating: 9.2,
    internal_notes: [
      {
        id: 'note-8',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Questão de direitos laborais esclarecida. Encaminhada para advogado se necessário.',
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Tenho dúvidas sobre férias e licenças', timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Vou esclarecer seus direitos sobre férias e licenças.', timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() }
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

// Available users for referrals (from assigned companies)
export const mockAvailableUsers = [
  { id: 'user-1', name: 'Ana Silva', email: 'ana.silva@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' },
  { id: 'user-2', name: 'Carlos Santos', email: 'carlos.santos@tech.co.mz', company_id: 'comp-2', company: 'Tech Solutions MZ' },
  { id: 'user-3', name: 'Maria Costa', email: 'maria.costa@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' },
  { id: 'user-4', name: 'João Ferreira', email: 'joao.ferreira@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' },
  { id: 'user-5', name: 'Sofia Rodrigues', email: 'sofia.rodrigues@tech.co.mz', company_id: 'comp-2', company: 'Tech Solutions MZ' },
  { id: 'user-6', name: 'Pedro Mendes', email: 'pedro.mendes@empresa.co.mz', company_id: 'comp-1', company: 'Empresa Exemplo Lda' }
];

// Mock admin alerts data
export const mockAdminAlerts = {
  pending_calls: mockCallRequests.filter(req => req.status === 'pending').length,
  scheduled_sessions: mockEspecialistaSessions.filter(s => s.status === 'scheduled' && s.date === new Date().toISOString().split('T')[0]).length,
  negative_feedback: mockNegativeFeedback.length,
  inactive_users: mockInactiveUsers.length
};

// Estatísticas pessoais do Especialista Geral
export const mockSpecialistPersonalStats = {
  monthly_cases: 45,
  weekly_cases: 12,
  avg_response_time_minutes: 35,
  avg_rating: 8.7,
  internal_resolution_rate: 68,
  referral_rate: 32,
  satisfaction_rate: 91,
  top_pillars: [
    { pillar: 'psychological', count: 18, label: 'Saúde Mental' },
    { pillar: 'financial', count: 14, label: 'Assistência Financeira' },
    { pillar: 'legal', count: 8, label: 'Assistência Jurídica' },
    { pillar: 'physical', count: 5, label: 'Bem-Estar Físico' }
  ],
  evolution_data: [
    { month: 'Jan', cases: 38 },
    { month: 'Fev', cases: 42 },
    { month: 'Mar', cases: 45 },
    { month: 'Abr', cases: 48 }
  ]
};

// Resultados possíveis de chamadas
export const mockCallOutcomes = [
  { value: 'resolved_by_phone', label: 'Resolvido por Telefone', icon: 'CheckCircle', color: 'green' },
  { value: 'session_booked', label: 'Sessão Agendada', icon: 'Calendar', color: 'blue' },
  { value: 'escalated_to_specialist', label: 'Encaminhado para Prestador', icon: 'ArrowRight', color: 'purple' },
  { value: 'follow_up_needed', label: 'Requer Follow-up', icon: 'Clock', color: 'orange' }
];

// Alertas urgentes (SLA ultrapassado)
export const mockUrgentAlerts = [
  {
    id: 'alert-1',
    type: 'sla_breach',
    user_name: 'Ana Silva',
    company_name: 'Empresa Exemplo Lda',
    wait_time_hours: 26,
    priority: 'critical',
    pillar: 'psychological'
  },
  {
    id: 'alert-2',
    type: 'high_priority',
    user_name: 'Pedro Mendes',
    company_name: 'Empresa Exemplo Lda',
    wait_time_hours: 3,
    priority: 'high',
    pillar: 'financial'
  }
];

// Notas internas expandidas
export const mockInternalNotes = [
  {
    id: 'note-1',
    user_id: 'user-1',
    specialist_id: 'spec-1',
    specialist_name: 'Geral Especialista',
    content: 'Utilizador demonstra sinais de burnout severo. Recomendo encaminhamento para psicólogo especializado em gestão de stress laboral.',
    pillar: 'psychological',
    action_taken: 'Encaminhado para Dra. Maria Costa',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-2',
    user_id: 'user-2',
    specialist_id: 'spec-1',
    specialist_name: 'Geral Especialista',
    content: 'Situação financeira complexa. Utilizador precisa de apoio especializado para reestruturação de dívidas.',
    pillar: 'financial',
    action_taken: 'Encaminhado para consultor financeiro',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-3',
    user_id: 'user-3',
    specialist_id: 'spec-1',
    specialist_name: 'Geral Especialista',
    content: 'Questão legal resolvida por telefone. Utilizador estava preocupado com direitos laborais mas situação esclarecida.',
    pillar: 'legal',
    action_taken: 'Resolvido internamente',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-4',
    user_id: 'user-4',
    specialist_id: 'spec-1',
    specialist_name: 'Geral Especialista',
    content: 'Problema ergonómico relacionado com trabalho remoto. Recomendadas sessões de fisioterapia.',
    pillar: 'physical',
    action_taken: 'Encaminhado para fisioterapeuta',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'note-5',
    user_id: 'user-5',
    specialist_id: 'spec-1',
    specialist_name: 'Geral Especialista',
    content: 'Utilizadora reporta ansiedade relacionada com prazos. Orientação básica fornecida, follow-up agendado.',
    pillar: 'psychological',
    action_taken: 'Sessão de follow-up marcada',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
