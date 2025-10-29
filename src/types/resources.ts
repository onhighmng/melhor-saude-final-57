// Resource types moved from deleted mock data files

export interface ResourceMetrics {
  totalViews: number;
  totalUniqueUsers: number;
  viewsByPillar: Record<string, number>;
  viewsByDate: { date: string; views: number }[];
  popularResources: { id: string; title: string; views: number }[];
}

export interface UserResource {
  id: string;
  title: string;
  description: string;
  pillar: 'saude_mental' | 'bem_estar_fisico' | 'assistencia_financeira' | 'assistencia_juridica';
  type: 'pdf' | 'video' | 'article';
  fileUrl?: string;
  videoUrl?: string;
  duration?: string;
  thumbnail?: string;
  createdAt: string;
  category?: string;
  viewCount?: number;
  rating?: number;
  isPremium?: boolean;
}

export const pillarNames = {
  saude_mental: 'Saúde Mental',
  bem_estar_fisico: 'Bem-Estar Físico',
  assistencia_financeira: 'Assistência Financeira',
  assistencia_juridica: 'Assistência Jurídica',
};

export const resourceTypeNames = {
  pdf: 'PDF',
  video: 'Vídeo',
  article: 'Artigo',
};
