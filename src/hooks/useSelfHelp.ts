import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SelfHelpContent, PsychologicalTest, TestResult, ContentAnalytics } from '@/types/selfHelp';

export const useSelfHelpContent = (category?: string | null) => {
  const [content, setContent] = useState<SelfHelpContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('self_help_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setContent((data || []) as SelfHelpContent[]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar conteúdo';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const incrementViewCount = async (contentId: string, userId?: string) => {
    try {
      // Track view in content_views table
      await supabase.from('content_views').insert({
        content_id: contentId,
        user_id: userId || null
      });

      // Increment counter using RPC function
      await supabase.rpc('increment_content_views', { content_id: contentId });

      // Update local state optimistically
      setContent(prev => prev.map(item => 
        item.id === contentId 
          ? { ...item, view_count: item.view_count + 1 }
          : item
      ));
    } catch (error) {
      // Silent fail for view tracking
    }
  };

  return { content, loading, error, refetch: fetchContent, incrementViewCount };
};

export const usePsychologicalTests = () => {
  const [tests, setTests] = useState<PsychologicalTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('psychological_tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTests((data || []) as unknown as PsychologicalTest[]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar testes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return { tests, loading, error, refetch: fetchTests };
};

export const useTestResults = () => {
  const [submitting, setSubmitting] = useState(false);

  const submitTestResult = async (
    testId: string,
    answers: Record<string, number>,
    userId?: string,
    isAnonymous: boolean = false
  ): Promise<TestResult> => {
    setSubmitting(true);
    try {
      // Get test details for scoring
      const { data: test, error: testError } = await supabase
        .from('psychological_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (testError) throw testError;
      if (!test) throw new Error('Test not found');

      // Calculate score based on test scoring rules
      const score = Object.values(answers).reduce((sum, val) => sum + val, 0);

      // Get interpretation based on score ranges
      const interpretationGuide = test.interpretation_guide as Record<string, unknown>;
      const ranges = interpretationGuide?.ranges as Array<{min: number; max: number; description: string}>;
      const interpretation = ranges?.find(
        (range) => score >= range.min && score <= range.max
      )?.description || 'Score recorded';

      // Save result to database
      const { data: result, error: saveError } = await supabase
        .from('test_results')
        .insert({
          test_id: testId,
          user_id: userId || null,
          answers,
          score,
          interpretation,
          is_anonymous: isAnonymous,
          consent_given: true,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) throw saveError;
      return result as TestResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao submeter teste';
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getUserTestResults = async (userId: string): Promise<TestResult[]> => {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as TestResult[];
    } catch (error) {
      // Silent fail for results fetching
      return [];
    }
  };

  return { submitTestResult, getUserTestResults, submitting };
};

export const useContentAnalytics = () => {
  const [analytics, setAnalytics] = useState<ContentAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Get content with view counts
      const { data: contentData, error: contentError } = await supabase
        .from('self_help_content')
        .select('id, title, category, view_count')
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(10);

      if (contentError) throw contentError;

      // Get time-based analytics for each content
      const analyticsPromises = (contentData || []).map(async (content) => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [daily, weekly, monthly] = await Promise.all([
          supabase.from('content_views').select('id', { count: 'exact', head: true })
            .eq('content_id', content.id).gte('viewed_at', oneDayAgo.toISOString()),
          supabase.from('content_views').select('id', { count: 'exact', head: true })
            .eq('content_id', content.id).gte('viewed_at', oneWeekAgo.toISOString()),
          supabase.from('content_views').select('id', { count: 'exact', head: true })
            .eq('content_id', content.id).gte('viewed_at', oneMonthAgo.toISOString())
        ]);

        return {
          content_id: content.id,
          title: content.title,
          category: content.category || 'Geral',
          total_views: content.view_count,
          daily_views: daily.count || 0,
          weekly_views: weekly.count || 0,
          monthly_views: monthly.count || 0
        };
      });

      const analyticsData = await Promise.all(analyticsPromises);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar analytics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};
