// Stub implementation - prestadores table schema doesn't match required fields

interface AssignmentResult {
  provider_id: string;
  match_score: number;
  reasons: string[];
  estimated_response_time: number;
}

export class CaseAssignmentService {
  private static instance: CaseAssignmentService;

  static getInstance(): CaseAssignmentService {
    if (!CaseAssignmentService.instance) {
      CaseAssignmentService.instance = new CaseAssignmentService();
    }
    return CaseAssignmentService.instance;
  }

  async assignCase(...args: any[]): Promise<AssignmentResult | null> {
    console.warn('[CaseAssignmentService] assignCase not implemented - prestadores table schema mismatch');
    return null;
  }

  async getProviderStats(...args: any[]): Promise<any> {
    console.warn('[CaseAssignmentService] getProviderStats not implemented');
    return {
      total_assignments: 0,
      accepted_assignments: 0,
      average_response_time: 0,
      assignment_rate: 0
    };
  }

  async getAssignmentHistory(...args: any[]): Promise<any[]> {
    console.warn('[CaseAssignmentService] getAssignmentHistory not implemented');
    return [];
  }

  async reassignCase(...args: any[]): Promise<AssignmentResult | null> {
    console.warn('[CaseAssignmentService] reassignCase not implemented');
    return null;
  }
}

export const caseAssignmentService = CaseAssignmentService.getInstance();
