import { Provider } from '@/types/provider';

export type { Provider };

// For now, keep the static export for backward compatibility
// Components can be gradually migrated to use the async hooks
export const providersData: Record<string, Provider> = {};