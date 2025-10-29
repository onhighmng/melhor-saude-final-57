export interface PrestadorCalendarEvent {
  id: string;
  date: string;
  time: string;
  type: 'available' | 'session' | 'blocked';
  clientName?: string;
  company?: string;
  pillar?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

// Mock data for development - will be replaced with real backend data
export const mockCalendarEvents: PrestadorCalendarEvent[] = [
  {
    id: '1',
    date: '2024-01-15',
    time: '09:00',
    type: 'session',
    clientName: 'Ana Silva',
    company: 'TechCorp',
    pillar: 'psychological',
    status: 'confirmed'
  },
  {
    id: '2',
    date: '2024-01-15',
    time: '10:00',
    type: 'available'
  },
  {
    id: '3',
    date: '2024-01-15',
    time: '11:00',
    type: 'session',
    clientName: 'João Santos',
    company: 'InnovaCorp',
    pillar: 'physical',
    status: 'confirmed'
  },
  {
    id: '4',
    date: '2024-01-15',
    time: '14:00',
    type: 'blocked'
  },
  {
    id: '5',
    date: '2024-01-15',
    time: '15:00',
    type: 'session',
    clientName: 'Maria Costa',
    company: 'TechCorp',
    pillar: 'financial',
    status: 'pending'
  },
  {
    id: '6',
    date: '2024-01-16',
    time: '09:00',
    type: 'available'
  },
  {
    id: '7',
    date: '2024-01-16',
    time: '10:00',
    type: 'session',
    clientName: 'Pedro Alves',
    company: 'InnovaCorp',
    pillar: 'legal',
    status: 'confirmed'
  },
  {
    id: '8',
    date: '2024-01-16',
    time: '11:00',
    type: 'available'
  },
  {
    id: '9',
    date: '2024-01-16',
    time: '14:00',
    type: 'session',
    clientName: 'Sofia Martins',
    company: 'TechCorp',
    pillar: 'psychological',
    status: 'confirmed'
  },
  {
    id: '10',
    date: '2024-01-16',
    time: '15:00',
    type: 'available'
  },
  {
    id: '11',
    date: '2024-01-17',
    time: '09:00',
    type: 'blocked'
  },
  {
    id: '12',
    date: '2024-01-17',
    time: '10:00',
    type: 'session',
    clientName: 'Carlos Lima',
    company: 'InnovaCorp',
    pillar: 'physical',
    status: 'confirmed'
  },
  {
    id: '13',
    date: '2024-01-17',
    time: '11:00',
    type: 'available'
  },
  {
    id: '14',
    date: '2024-01-17',
    time: '14:00',
    type: 'session',
    clientName: 'Rita Oliveira',
    company: 'TechCorp',
    pillar: 'financial',
    status: 'pending'
  },
  {
    id: '15',
    date: '2024-01-17',
    time: '15:00',
    type: 'available'
  }
];
