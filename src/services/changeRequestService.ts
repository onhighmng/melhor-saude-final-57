import { adminAccountService } from './adminAccountService';

export interface CreateChangeRequestData {
  prestadorId: string;
  prestadorName: string;
  field: string;
  fieldLabel: string;
  currentValue: string;
  requestedValue: string;
  reason?: string;
}

export const changeRequestService = {
  async createChangeRequest(data: CreateChangeRequestData) {
    return await adminAccountService.createChangeRequest(data);
  }
};