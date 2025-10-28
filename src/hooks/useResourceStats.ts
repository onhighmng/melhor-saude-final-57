import { useMemo } from 'react';
import { mockResources } from '@/data/userResourcesData';
import { getPillarLabel } from '@/utils/pillarColors';

interface PillarStats {
  pillar: string;
  count: number;
  percentage: number;
  label: string;
}

interface ResourceStats {
  total: number;
  distribution: PillarStats[];
  mostPopular: PillarStats | null;
}

export const useResourceStats = (): ResourceStats => {
  const stats = useMemo(() => {
    const total = mockResources.length;
    
    const pillarCounts = mockResources.reduce((acc, resource) => {
      acc[resource.pillar] = (acc[resource.pillar] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const distribution: PillarStats[] = Object.entries(pillarCounts).map(([pillar, count]) => ({
      pillar,
      count,
      percentage: Math.round((count / total) * 100),
      label: getPillarLabel(pillar)
    }));
    
    // Sort by count descending
    distribution.sort((a, b) => b.count - a.count);
    
    return {
      total,
      distribution,
      mostPopular: distribution[0] || null
    };
  }, []);
  
  return stats;
};
