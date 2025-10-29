/**
 * Calculate seat usage percentage
 */
export const getSeatUsagePercentage = (allocated: number, used: number): number => {
  if (allocated === 0) return 0;
  return Math.round((used / allocated) * 100);
};

/**
 * Get badge variant based on seat usage percentage
 */
export const getSeatUsageBadgeVariant = (
  percentage: number
): 'default' | 'secondary' | 'destructive' => {
  if (percentage >= 90) return 'destructive';
  if (percentage >= 70) return 'secondary';
  return 'default';
};

/**
 * Check if company can invite more employees
 */
export const canInviteEmployee = (company: {
  sessions_allocated: number;
  sessions_used: number;
}): boolean => {
  return company.sessions_allocated > company.sessions_used;
};

/**
 * Calculate available seats
 */
export const getAvailableSeats = (allocated: number, used: number): number => {
  return Math.max(0, allocated - used);
};

/**
 * Format company plan type for display
 */
export const getPlanTypeLabel = (planType: string): string => {
  const labels: Record<string, string> = {
    basic: 'Básico',
    business: 'Business',
    enterprise: 'Enterprise',
    startup: 'Startup'
  };
  return labels[planType.toLowerCase()] || planType;
};
