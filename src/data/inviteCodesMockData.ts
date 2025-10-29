export interface InviteCode {
  id: string;
  companyId: string;
  code: string;
  status: 'active' | 'used' | 'revoked';
  issuedToUserId?: string;
  issuedToUserName?: string;
  issuedToUserEmail?: string;
  issuedAt?: string;
  redeemedAt?: string;
  revokedAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  seatsPurchased: number;
  seatsUsed: number;
  seatsAvailable: number;
  planType: string;
  isActive: boolean;
}

// Mock companies data
export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'Tech Solutions Lda',
    seatsPurchased: 10,
    seatsUsed: 7,
    seatsAvailable: 3,
    planType: 'Business',
    isActive: true
  },
  {
    id: 'company-2',
    name: 'Startup Innovation',
    seatsPurchased: 5,
    seatsUsed: 3,
    seatsAvailable: 2,
    planType: 'Startup',
    isActive: true
  }
];

// Mock invite codes data
export const mockInviteCodes: InviteCode[] = [
  {
    id: 'invite-1',
    companyId: 'company-1',
    code: 'TECH-2024-001',
    status: 'used',
    issuedToUserId: 'user-1',
    issuedToUserName: 'João Silva',
    issuedToUserEmail: 'joao@techsolutions.pt',
    issuedAt: '2024-01-15T10:00:00Z',
    redeemedAt: '2024-01-15T10:05:00Z',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T10:05:00Z'
  },
  {
    id: 'invite-2',
    companyId: 'company-1',
    code: 'TECH-2024-002',
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 'invite-3',
    companyId: 'company-1',
    code: 'TECH-2024-003',
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 'invite-4',
    companyId: 'company-1',
    code: 'TECH-2024-004',
    status: 'revoked',
    revokedAt: '2024-01-20T15:00:00Z',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-20T15:00:00Z'
  },
  {
    id: 'invite-5',
    companyId: 'company-2',
    code: 'STAR-2024-001',
    status: 'used',
    issuedToUserId: 'user-2',
    issuedToUserName: 'Maria Santos',
    issuedToUserEmail: 'maria@startup.pt',
    issuedAt: '2024-01-12T14:00:00Z',
    redeemedAt: '2024-01-12T14:02:00Z',
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-12T14:02:00Z'
  },
  {
    id: 'invite-6',
    companyId: 'company-2',
    code: 'STAR-2024-002',
    status: 'active',
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-08T11:00:00Z'
  }
];

// Utility functions
export function getCompanyById(id: string): Company | undefined {
  return mockCompanies.find(company => company.id === id);
}

export function getInviteCodesByCompany(companyId: string): InviteCode[] {
  return mockInviteCodes.filter(code => code.companyId === companyId);
}

export function getInviteCodeByCode(code: string): InviteCode | undefined {
  return mockInviteCodes.find(invite => invite.code === code);
}

export function generateInviteCode(companyId: string): string {
  const company = getCompanyById(companyId);
  if (!company) return '';
  
  const prefix = company.name.substring(0, 4).toUpperCase().replace(/\s/g, '');
  const year = new Date().getFullYear();
  const existingCodes = getInviteCodesByCompany(companyId);
  const nextNumber = String(existingCodes.length + 1).padStart(3, '0');
  
  return `${prefix}-${year}-${nextNumber}`;
}

export function canGenerateMoreCodes(companyId: string): boolean {
  const company = getCompanyById(companyId);
  if (!company) return false;
  
  const codes = getInviteCodesByCompany(companyId);
  const totalCodes = codes.filter(code => code.status === 'active' || code.status === 'used').length;
  
  return totalCodes < company.seatsPurchased;
}

export function getSeatsStats(companyId: string) {
  const company = getCompanyById(companyId);
  if (!company) return null;
  
  const codes = getInviteCodesByCompany(companyId);
  const activeCodes = codes.filter(code => code.status === 'active').length;
  const usedCodes = codes.filter(code => code.status === 'used').length;
  
  return {
    purchased: company.seatsPurchased,
    used: usedCodes,
    available: activeCodes,
    total: activeCodes + usedCodes
  };
}