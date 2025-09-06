// Mock useSelfHelp hooks to replace Supabase calls
import { useState } from 'react';
import { mockSelfHelpContent } from '@/data/mockData';

// Mock interface matching existing types exactly
export interface SelfHelpContent {
  id: string;
  title: string;
  description: string;
  summary?: string;
  category: 'psicologica' | 'medica' | 'juridica';
  pillar: string;
  type: string;
  content_type: 'article';
  thumbnail: string;
  views: number;
  likes: number;
  view_count: number;
  duration: string;
  author: string;
  tags?: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PsychologicalTest {
  id: string;
  name: string;
  description: string;
  test_type: string;
  questions: any[];
  scoring_method: string;
  scoring_rules: any;
  interpretation_guide: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  test_id: string;
  user_id?: string;
  answers: Record<string, number>;
  score: number;
  interpretation: string;
  is_anonymous: boolean;
  consent_given: boolean;
  completed_at: string;
}

export interface ContentAnalytics {
  content_id: string;
  title: string;
  views: number;
  likes: number;
  total_views: number;
  category: string;
}

const mockTests: PsychologicalTest[] = [
  {
    id: 'test-1',
    name: 'Teste de Stress Laboral',
    description: 'Avalie o seu nível de stress no trabalho',
    test_type: 'stress_assessment',
    questions: [],
    scoring_method: 'sum',
    scoring_rules: { low: 20, medium: 50, high: 80 },
    interpretation_guide: { low: 'Baixo stress', medium: 'Stress moderado', high: 'Stress elevado' },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'test-2',
    name: 'Questionário de Bem-Estar',
    description: 'Avalie o seu bem-estar geral',
    test_type: 'wellbeing_assessment',
    questions: [],
    scoring_method: 'average',
    scoring_rules: { low: 2, medium: 3.5, high: 4.5 },
    interpretation_guide: { low: 'Baixo bem-estar', medium: 'Bem-estar moderado', high: 'Bom bem-estar' },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const useSelfHelpContent = (category?: string | null) => {
  const [content] = useState<SelfHelpContent[]>(
    category 
      ? mockSelfHelpContent.filter(item => item.category === category)
      : mockSelfHelpContent
  );
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchContent = () => {
    // Mock fetch - do nothing since it's static data
  };

  const incrementViewCount = async (contentId: string) => {
    // Mock increment - do nothing since it's static data
    console.log('Mock: Incrementing view for content', contentId);
  };

  return { content, loading, error, refetch: fetchContent, incrementViewCount };
};

export const usePsychologicalTests = () => {
  const [tests] = useState<PsychologicalTest[]>(mockTests);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchTests = () => {
    // Mock fetch - do nothing since it's static data
  };

  return { tests, loading, error, refetch: fetchTests };
};

export const useTestResults = () => {
  const [submitting] = useState(false);

  const submitTestResult = async (
    testId: string,
    answers: Record<string, number>,
    score: number,
    interpretation: string,
    isAnonymous: boolean = true,
    consentGiven: boolean = false
  ): Promise<TestResult | null> => {
    // Mock submission - return mock result
    const mockResult: TestResult = {
      id: 'result-' + Date.now(),
      test_id: testId,
      answers,
      score,
      interpretation,
      is_anonymous: isAnonymous,
      consent_given: consentGiven,
      completed_at: new Date().toISOString()
    };

    console.log('Mock: Test result submitted', mockResult);
    return mockResult;
  };

  const getUserTestResults = async (): Promise<TestResult[]> => {
    // Mock user results - return empty array or mock data
    return [];
  };

  return { submitTestResult, getUserTestResults, submitting };
};

export const useContentAnalytics = () => {
  const [analytics] = useState<ContentAnalytics[]>([
    {
      content_id: 'content-1',
      title: 'Como Gerir o Stress no Trabalho',
      views: 1250,
      likes: 89,
      total_views: 1250,
      category: 'Saúde Mental'
    },
    {
      content_id: 'content-2',
      title: 'Exercícios Simples para o Escritório',
      views: 890,
      likes: 67,
      total_views: 890,
      category: 'Bem-Estar Físico'
    }
  ]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchAnalytics = () => {
    // Mock fetch - do nothing since it's static data
  };

  return { analytics, loading, error, refetch: fetchAnalytics };
};