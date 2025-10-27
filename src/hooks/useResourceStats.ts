import { useMemo, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*');

        if (error) throw error;
        setResources(data || []);
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const stats = useMemo(() => {
    const total = resources.length;
    
    const pillarCounts = resources.reduce((acc, resource) => {
      const pillar = resource.pillar || 'unknown';
      acc[pillar] = (acc[pillar] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const distribution: PillarStats[] = Object.entries(pillarCounts).map(([pillar, count]) => ({
      pillar,
      count: count as number,
      percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
      label: getPillarLabel(pillar)
    }));
    
    // Sort by count descending
    distribution.sort((a, b) => b.count - a.count);
    
    return {
      total,
      distribution,
      mostPopular: distribution[0] || null
    };
  }, [resources]);
  
  return stats;
};
