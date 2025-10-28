export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'hr';
  isActive: boolean;
  joinedAt: string;
  lastLogin?: string;
  companyQuota: number;
  usedQuota: number;
}

export interface Company {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string;
  planType: 'basic' | 'premium' | 'enterprise';
  seatLimit: number;
  seatUsed: number;
  seatAvailable: number;
  isAtSeatLimit: boolean;
  createdAt: string;
  updatedAt: string;
  users: CompanyUser[];
}

// Mock company data
export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'TechCorp Solutions',
    contactEmail: 'hr@techcorp.com',
    contactPhone: '+351 912 345 678',
    planType: 'premium',
    seatLimit: 50,
    seatUsed: 47,
    seatAvailable: 3,
    isAtSeatLimit: false,
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    users: [
      {
        id: 'user-1',
        name: 'Ana Silva',
        email: 'ana.silva@techcorp.com',
        role: 'hr',
        isActive: true,
        joinedAt: '2023-06-20T09:00:00Z',
        lastLogin: '2024-01-15T08:30:00Z',
        companyQuota: 12,
        usedQuota: 3
      },
      {
        id: 'user-2',
        name: 'João Santos',
        email: 'joao.santos@techcorp.com',
        role: 'user',
        isActive: true,
        joinedAt: '2023-07-01T10:00:00Z',
        lastLogin: '2024-01-14T16:45:00Z',
        companyQuota: 12,
        usedQuota: 8
      },
      {
        id: 'user-3',
        name: 'Maria Oliveira',
        email: 'maria.oliveira@techcorp.com',
        role: 'user',
        isActive: false,
        joinedAt: '2023-08-15T11:00:00Z',
        lastLogin: '2023-12-20T14:20:00Z',
        companyQuota: 12,
        usedQuota: 2
      }
    ]
  },
  {
    id: 'company-2',
    name: 'Health Innovations Ltd',
    contactEmail: 'contact@healthinnovations.com',
    contactPhone: '+351 933 456 789',
    planType: 'basic',
    seatLimit: 10,
    seatUsed: 10,
    seatAvailable: 0,
    isAtSeatLimit: true,
    createdAt: '2023-09-10T11:00:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
    users: [
      {
        id: 'user-4',
        name: 'Pedro Costa',
        email: 'pedro.costa@healthinnovations.com',
        role: 'hr',
        isActive: true,
        joinedAt: '2023-09-12T10:00:00Z',
        lastLogin: '2024-01-15T07:20:00Z',
        companyQuota: 6,
        usedQuota: 1
      },
      {
        id: 'user-5',
        name: 'Carla Fernandes',
        email: 'carla.fernandes@healthinnovations.com',
        role: 'user',
        isActive: true,
        joinedAt: '2023-10-01T09:30:00Z',
        lastLogin: '2024-01-13T15:10:00Z',
        companyQuota: 6,
        usedQuota: 4
      }
    ]
  },
  {
    id: 'company-3',
    name: 'Global Finance Group',
    contactEmail: 'hr@globalfinance.com',
    contactPhone: '+351 944 567 890',
    planType: 'enterprise',
    seatLimit: 200,
    seatUsed: 145,
    seatAvailable: 55,
    isAtSeatLimit: false,
    createdAt: '2023-03-20T14:00:00Z',
    updatedAt: '2024-01-12T11:45:00Z',
    users: []
  }
];

// Helper functions
export const getSeatUsagePercentage = (company: Company): number => {
  return (company.seatUsed / company.seatLimit) * 100;
};

export const getSeatUsageBadgeVariant = (company: Company): 'default' | 'secondary' | 'destructive' => {
  const percentage = getSeatUsagePercentage(company);
  if (percentage >= 100) return 'destructive';
  if (percentage >= 90) return 'secondary';
  return 'default';
};

export const canInviteEmployee = (company: Company): boolean => {
  return !company.isAtSeatLimit && company.seatAvailable > 0;
};

export const getActiveUsers = (company: Company): CompanyUser[] => {
  return company.users.filter(user => user.isActive);
};

export const getInactiveUsers = (company: Company): CompanyUser[] => {
  return company.users.filter(user => !user.isActive);
};

export const deactivateUser = (company: Company, userId: string): Company => {
  const updatedUsers = company.users.map(user => 
    user.id === userId ? { ...user, isActive: false } : user
  );
  
  const activeUsersCount = updatedUsers.filter(user => user.isActive).length;
  
  return {
    ...company,
    users: updatedUsers,
    seatUsed: activeUsersCount,
    seatAvailable: company.seatLimit - activeUsersCount,
    isAtSeatLimit: activeUsersCount >= company.seatLimit,
    updatedAt: new Date().toISOString()
  };
};

export const activateUser = (company: Company, userId: string): Company => {
  const updatedUsers = company.users.map(user => 
    user.id === userId ? { ...user, isActive: true } : user
  );
  
  const activeUsersCount = updatedUsers.filter(user => user.isActive).length;
  
  // Don't allow activation if it would exceed seat limit
  if (activeUsersCount > company.seatLimit) {
    return company;
  }
  
  return {
    ...company,
    users: updatedUsers,
    seatUsed: activeUsersCount,
    seatAvailable: company.seatLimit - activeUsersCount,
    isAtSeatLimit: activeUsersCount >= company.seatLimit,
    updatedAt: new Date().toISOString()
  };
};

export const updateSeatLimit = (company: Company, newLimit: number): Company => {
  const activeUsersCount = getActiveUsers(company).length;
  
  return {
    ...company,
    seatLimit: newLimit,
    seatAvailable: newLimit - activeUsersCount,
    isAtSeatLimit: activeUsersCount >= newLimit,
    updatedAt: new Date().toISOString()
  };
};