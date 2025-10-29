import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceMetrics } from '@/types/resources';

export const useCompanyResourceAnalytics = (companyId?: string) => {
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResourceAnalytics = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        // Get employee IDs for this company
        const { data: employees, error: employeesError } = await supabase
          .from('company_employees')
          .select('user_id')
          .eq('company_id', companyId);

        if (employeesError) throw employeesError;
        if (!employees || employees.length === 0) {
          setMetrics({
            totalViews: 0,
            totalUniqueUsers: 0,
            viewsByPillar: {},
            viewsByDate: [],
            popularResources: []
          });
          setIsLoading(false);
          return;
        }

        const userIds = employees.map(e => e.user_id);

        // Get resource views
        const { data: views, error: viewsError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('action_type', 'resource_viewed')
          .in('user_id', userIds);

        if (viewsError) throw viewsError;

        // Aggregate metrics
        const totalViews = views?.length || 0;
        const uniqueUsers = new Set(views?.map(v => v.user_id)).size;
        
        const viewsByPillar: Record<string, number> = {};
        const viewsByDate: { date: string; views: number }[] = [];
        const popularResources: { id: string; title: string; views: number }[] = [];

        // Aggregate by pillar if metadata contains pillar info
        views?.forEach(view => {
          const metadata = view.metadata as any;
          const pillar = metadata?.pillar || 'unknown';
          viewsByPillar[pillar] = (viewsByPillar[pillar] || 0) + 1;
        });

        // Get resource details for popular resources
        if (views && views.length > 0) {
          const resourceIds = new Set(views.map(v => v.resource_id).filter(Boolean));
          
          if (resourceIds.size > 0) {
            const { data: resources } = await supabase
              .from('resources')
              .select('id, title')
              .in('id', Array.from(resourceIds));

            const resourceMap = new Map(resources?.map(r => [r.id, r.title]) || []);
            
            const resourceViewCount: Record<string, number> = {};
            views.forEach(view => {
              if (view.resource_id) {
                resourceViewCount[view.resource_id] = (resourceViewCount[view.resource_id] || 0) + 1;
              }
            });

            popularResources.push(...Array.from(resourceMap.entries())
              .map(([id, title]) => ({
                id,
                title,
                views: resourceViewCount[id] || 0
              }))
              .sort((a, b) => b.views - a.views)
              .slice(0, 5));
          }
        }

        setMetrics({
          totalViews,
          totalUniqueUsers: uniqueUsers,
          viewsByPillar,
          viewsByDate,
          popularResources
        });
      } catch (err) {
        console.error('Error fetching resource analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResourceAnalytics();
  }, [companyId]);

  return { metrics, isLoading, error };
};
