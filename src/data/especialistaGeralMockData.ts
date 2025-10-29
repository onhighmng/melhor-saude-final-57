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
    wait_time: 45,
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
    wait_time: 120,
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
    status: 'pending',
    wait_time: 30,
    chat_session_id: 'chat-3',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    notes: 'Questão sobre contrato de trabalho'
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
    wait_time: 1500,
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
    wait_time: 300,
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
  },
  {
    id: 'call-11',
    user_id: 'user-11',
    user_name: 'Bruno Oliveira',
    user_email: 'bruno.oliveira@empresa.co.mz',
    user_phone: '+258 84 111 2222',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'psychological',
    status: 'pending',
    wait_time: 75,
    chat_session_id: 'chat-11',
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    notes: 'Burnout profissional, necessita apoio imediato'
  },
  {
    id: 'call-12',
    user_id: 'user-12',
    user_name: 'Fernanda Lima',
    user_email: 'fernanda.lima@tech.co.mz',
    user_phone: '+258 84 222 3333',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'legal',
    status: 'pending',
    wait_time: 105,
    chat_session_id: 'chat-12',
    created_at: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
    notes: 'Questões relacionadas a rescisão de contrato'
  },
  {
    id: 'call-13',
    user_id: 'user-13',
    user_name: 'Gabriel Pinto',
    user_email: 'gabriel.pinto@empresa.co.mz',
    user_phone: '+258 84 333 4444',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'physical',
    status: 'pending',
    wait_time: 50,
    chat_session_id: 'chat-13',
    created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    notes: 'Problemas de visão devido ao uso excessivo de computador'
  },
  {
    id: 'call-14',
    user_id: 'user-14',
    user_name: 'Helena Moura',
    user_email: 'helena.moura@tech.co.mz',
    user_phone: '+258 84 444 5555',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'financial',
    status: 'pending',
    wait_time: 200,
    chat_session_id: 'chat-14',
    created_at: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
    notes: 'Gestão de dívidas e planejamento de emergência'
  },
  {
    id: 'call-15',
    user_id: 'user-15',
    user_name: 'Igor Tavares',
    user_email: 'igor.tavares@empresa.co.mz',
    user_phone: '+258 84 555 6666',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'psychological',
    status: 'pending',
    wait_time: 35,
    chat_session_id: 'chat-15',
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    notes: 'Conflitos interpessoais no ambiente de trabalho'
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
  },
  {
    user_id: 'user-9',
    user_name: 'Luís Pereira',
    user_email: 'luis.pereira@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar_attended: 'legal',
    last_session_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    total_chats: 2,
    total_sessions: 1,
    average_rating: 8.3,
    internal_notes: [
      {
        id: 'note-9',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Questão sobre direitos laborais em regime de teletrabalho. Esclarecido e encaminhado documentação.',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Quais são os meus direitos em teletrabalho?', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Em regime de teletrabalho, mantém todos os direitos laborais. Vamos ver em detalhe.', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'E sobre o horário de trabalho?', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-10',
    user_name: 'Carla Fernandes',
    user_email: 'carla.fernandes@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar_attended: 'financial',
    last_session_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    total_chats: 3,
    total_sessions: 2,
    average_rating: 9.1,
    internal_notes: [
      {
        id: 'note-10',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Excelente caso de sucesso. Usuária reorganizou totalmente suas finanças e está a poupar consistentemente.',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note-10-2',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Follow-up: Atingiu meta de poupança para fundo de emergência.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Estou com dívidas acumuladas e não sei como sair', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Vamos criar um plano de ação para reorganizar suas finanças. Primeiro, vamos listar todas as dívidas.', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'Já consegui pagar duas dívidas!', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-11',
    user_name: 'Paulo Oliveira',
    user_email: 'paulo.oliveira@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar_attended: 'psychological',
    last_session_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    total_chats: 5,
    total_sessions: 4,
    average_rating: 9.7,
    internal_notes: [
      {
        id: 'note-11',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Síndrome do impostor severa. Trabalhando autoconfiança e reconhecimento de competências.',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note-11-2',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Progresso extraordinário. Usuário apresentou projeto importante e recebeu promoção.',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Sinto que não sou bom o suficiente no meu trabalho', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Isso pode ser síndrome do impostor. É muito comum em profissionais competentes. Vamos trabalhar isso.', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'As técnicas que me ensinou estão a ajudar muito!', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-12',
    user_name: 'Rita Santos',
    user_email: 'rita.santos@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar_attended: 'physical',
    last_session_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    total_chats: 2,
    total_sessions: 2,
    average_rating: 8.6,
    internal_notes: [
      {
        id: 'note-12',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'LER (Lesão por Esforço Repetitivo) em fase inicial. Recomendadas pausas e exercícios específicos.',
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Tenho dores nos pulsos de tanto usar o computador', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Pode ser início de LER. Vamos avaliar sua postura e criar um plano de prevenção.', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-13',
    user_name: 'Tiago Costa',
    user_email: 'tiago.costa@consultoria.co.mz',
    company_id: 'comp-3',
    company_name: 'Consultoria Financeira Ltda',
    pillar_attended: 'psychological',
    last_session_date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    total_chats: 2,
    total_sessions: 1,
    average_rating: 7.8,
    internal_notes: [
      {
        id: 'note-13',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Conflitos interpessoais no trabalho causando stress. Trabalhando habilidades de comunicação.',
        created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Não consigo trabalhar bem com a minha equipa', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Vamos trabalhar técnicas de comunicação assertiva e gestão de conflitos.', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-14',
    user_name: 'Beatriz Almeida',
    user_email: 'beatriz.almeida@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar_attended: 'financial',
    last_session_date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    total_chats: 1,
    total_sessions: 1,
    average_rating: 8.9,
    internal_notes: [
      {
        id: 'note-14',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Planeamento de investimentos de longo prazo. Usuária muito organizada e proativa.',
        created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Quero começar a investir mas tenho medo de perder dinheiro', timestamp: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Vamos discutir diferentes perfis de investimento e encontrar o adequado para si.', timestamp: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-15',
    user_name: 'Fernando Silva',
    user_email: 'fernando.silva@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar_attended: 'legal',
    last_session_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    total_chats: 3,
    total_sessions: 2,
    average_rating: 9.4,
    internal_notes: [
      {
        id: 'note-15',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Assédio moral no trabalho. Caso encaminhado para advogado trabalhista e RH da empresa.',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note-15-2',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Situação resolvida com sucesso. Usuário transferido de departamento e está satisfeito.',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Estou a sofrer assédio do meu superior', timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Isso é muito sério. Vou ajudá-lo com os procedimentos legais adequados.', timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'Muito obrigado. A situação foi resolvida!', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-16',
    user_name: 'Marta Rodrigues',
    user_email: 'marta.rodrigues@consultoria.co.mz',
    company_id: 'comp-3',
    company_name: 'Consultoria Financeira Ltda',
    pillar_attended: 'physical',
    last_session_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
    total_chats: 4,
    total_sessions: 3,
    average_rating: 9.0,
    internal_notes: [
      {
        id: 'note-16',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Programa de bem-estar físico completo. Usuária muito comprometida com os exercícios.',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Quero melhorar minha saúde física mas não tenho tempo para ginásio', timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Podemos criar uma rotina de exercícios em casa, adequada à sua agenda.', timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'Já perdi 5kg e sinto-me muito melhor!', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-17',
    user_name: 'Diogo Martins',
    user_email: 'diogo.martins@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar_attended: 'psychological',
    last_session_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    total_chats: 2,
    total_sessions: 2,
    average_rating: 8.4,
    internal_notes: [
      {
        id: 'note-17',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Dificuldades de adaptação a trabalho remoto. Trabalhando rotinas e limites trabalho-vida pessoal.',
        created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Desde que estou em casa, trabalho até muito tarde', timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'É importante estabelecer limites claros. Vamos criar uma rotina saudável.', timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    user_id: 'user-18',
    user_name: 'Cláudia Pereira',
    user_email: 'claudia.pereira@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar_attended: 'financial',
    last_session_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    total_chats: 3,
    total_sessions: 2,
    average_rating: 9.6,
    internal_notes: [
      {
        id: 'note-18',
        specialist_id: 'spec-1',
        specialist_name: 'Geral Especialista',
        content: 'Planeamento de reforma antecipada. Caso interessante com objetivos muito claros.',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    chat_history: [
      { role: 'user', content: 'Tenho 45 anos e quero reformar-me aos 55', timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Vamos criar um plano financeiro de 10 anos para atingir esse objetivo.', timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'Estou a seguir o plano religiosamente. Obrigada!', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
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
    provider_specialty: 'Psicóloga Clínica',
    status: 'scheduled',
    availability: 'available',
    notes: 'Encaminhamento para terapia especializada em ansiedade',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: '10:00',
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
    provider_specialty: 'Consultor Financeiro',
    status: 'completed',
    availability: 'available',
    notes: 'Orientação financeira especializada - concluída',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: '14:00',
    completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ref-3',
    user_id: 'user-3',
    user_name: 'Maria Costa',
    user_email: 'maria.costa@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'legal',
    provider_id: 'prest-3',
    provider_name: 'Dr. Paulo Rodrigues',
    provider_specialty: 'Advogado Trabalhista',
    status: 'pending',
    availability: 'busy',
    notes: 'Questão urgente sobre contrato de trabalho',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: null,
    scheduled_time: null,
  },
  {
    id: 'ref-4',
    user_id: 'user-4',
    user_name: 'João Ferreira',
    user_email: 'joao.ferreira@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'physical',
    provider_id: 'prest-4',
    provider_name: 'Dra. Isabel Martins',
    provider_specialty: 'Fisioterapeuta',
    status: 'scheduled',
    availability: 'available',
    notes: 'Sessão de fisioterapia para LER',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: '09:30',
  },
  {
    id: 'ref-5',
    user_id: 'user-5',
    user_name: 'Sofia Rodrigues',
    user_email: 'sofia.rodrigues@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'psychological',
    provider_id: 'prest-5',
    provider_name: 'Dr. Ricardo Almeida',
    provider_specialty: 'Psiquiatra',
    status: 'pending',
    availability: 'available',
    notes: 'Caso de burnout severo - requer avaliação psiquiátrica',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    scheduled_date: null,
    scheduled_time: null,
  },
  {
    id: 'ref-6',
    user_id: 'user-6',
    user_name: 'Pedro Mendes',
    user_email: 'pedro.mendes@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'financial',
    provider_id: 'prest-6',
    provider_name: 'Dra. Carla Fernandes',
    provider_specialty: 'Consultora de Investimentos',
    status: 'scheduled',
    availability: 'available',
    notes: 'Planeamento de investimentos de longo prazo',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: '15:00',
  },
  {
    id: 'ref-7',
    user_id: 'user-7',
    user_name: 'Ricardo Almeida',
    user_email: 'ricardo.almeida@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'physical',
    provider_id: 'prest-7',
    provider_name: 'Dr. Luís Pereira',
    provider_specialty: 'Médico Ortopedista',
    status: 'pending',
    availability: 'available',
    notes: 'Dores crônicas na coluna - necessita avaliação médica',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    scheduled_date: null,
    scheduled_time: null,
  },
  {
    id: 'ref-8',
    user_id: 'user-8',
    user_name: 'Isabel Martins',
    user_email: 'isabel.martins@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'legal',
    provider_id: 'prest-8',
    provider_name: 'Dra. Beatriz Almeida',
    provider_specialty: 'Advogada Familiar',
    status: 'scheduled',
    availability: 'busy',
    notes: 'Questões relacionadas com licença parental',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: '11:00',
  },
  {
    id: 'ref-9',
    user_id: 'user-9',
    user_name: 'Luís Pereira',
    user_email: 'luis.pereira@tech.co.mz',
    company_id: 'comp-2',
    company_name: 'Tech Solutions MZ',
    pillar: 'psychological',
    provider_id: 'prest-9',
    provider_name: 'Dra. Marta Rodrigues',
    provider_specialty: 'Terapeuta Cognitivo-Comportamental',
    status: 'pending',
    availability: 'available',
    notes: 'Síndrome do impostor - terapia TCC recomendada',
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    scheduled_date: null,
    scheduled_time: null,
  },
  {
    id: 'ref-10',
    user_id: 'user-10',
    user_name: 'Carla Fernandes',
    user_email: 'carla.fernandes@empresa.co.mz',
    company_id: 'comp-1',
    company_name: 'Empresa Exemplo Lda',
    pillar: 'financial',
    provider_id: 'prest-10',
    provider_name: 'Dr. Fernando Silva',
    provider_specialty: 'Assessor de Crédito',
    status: 'scheduled',
    availability: 'available',
    notes: 'Renegociação de dívidas e planejamento de pagamento',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_time: '16:30',
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
