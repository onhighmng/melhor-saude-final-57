export interface SelfHelpContent {
  id: string;
  title: string;
  category: 'psicologica' | 'juridica' | 'medica';
  content_type: 'article';
  author: string;
  content_body?: string;
  thumbnail_url?: string;
  summary?: string;
  tags?: string[];
  view_count: number;
  is_published: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface PsychologicalTest {
  id: string;
  name: string;
  description: string;
  test_type: string;
  questions: TestQuestion[];
  scoring_rules: ScoringRules;
  interpretation_guide: InterpretationGuide;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestQuestion {
  id: number;
  question: string;
  options: TestOption[];
}

export interface TestOption {
  value: number;
  text: string;
}

export interface ScoringRules {
  total_possible: number;
  calculation: string;
}

export interface InterpretationGuide {
  ranges: InterpretationRange[];
  recommendation: string;
}

export interface InterpretationRange {
  min: number;
  max: number;
  level: string;
  description: string;
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
  category: string;
  total_views: number;
  daily_views: number;
  weekly_views: number;
  monthly_views: number;
}