// Mock data for user resources

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

export const mockResources: UserResource[] = [
  // Saúde Mental
  {
    id: 'res-1',
    title: 'Guia de Gestão de Stress',
    description: 'Técnicas práticas para gerir o stress no dia a dia',
    pillar: 'saude_mental',
    type: 'pdf',
    fileUrl: '/resources/stress-guide.pdf',
    thumbnail: '/lovable-uploads/676d62ef-5d2a-46ab-9c4f-1c94521aabed.png',
    createdAt: '2024-01-15',
  },
  {
    id: 'res-2',
    title: 'Meditação Guiada - 10 minutos',
    description: 'Sessão de meditação para relaxamento',
    pillar: 'saude_mental',
    type: 'video',
    videoUrl: 'https://example.com/meditation-video',
    duration: '10 min',
    thumbnail: '/lovable-uploads/5d2071d4-8909-4e5f-b30d-cf52091ffba9.png',
    createdAt: '2024-01-20',
  },
  {
    id: 'res-3',
    title: 'Como Melhorar o Sono',
    description: 'Dicas e estratégias para uma boa noite de sono',
    pillar: 'saude_mental',
    type: 'article',
    fileUrl: '/resources/sleep-article.html',
    thumbnail: '/lovable-uploads/8e8fac57-f901-4bea-b185-7628c8f592be.png',
    createdAt: '2024-02-01',
  },
  
  // Bem-Estar Físico
  {
    id: 'res-4',
    title: 'Exercícios de Alongamento',
    description: 'Rotina diária de alongamentos para o escritório',
    pillar: 'bem_estar_fisico',
    type: 'video',
    videoUrl: 'https://example.com/stretching-video',
    duration: '15 min',
    thumbnail: '/lovable-uploads/0daa1ba3-5b7c-49db-950f-22ccfee40b86.png',
    createdAt: '2024-01-25',
  },
  {
    id: 'res-5',
    title: 'Guia de Nutrição Equilibrada',
    description: 'Plano alimentar saudável e prático',
    pillar: 'bem_estar_fisico',
    type: 'pdf',
    fileUrl: '/resources/nutrition-guide.pdf',
    thumbnail: '/lovable-uploads/5098d52a-638c-4f18-8bf0-36058ff94187.png',
    createdAt: '2024-02-05',
  },
  
  // Assistência Financeira
  {
    id: 'res-6',
    title: 'Orçamento Pessoal Simplificado',
    description: 'Como criar e gerir o seu orçamento mensal',
    pillar: 'assistencia_financeira',
    type: 'pdf',
    fileUrl: '/resources/budget-guide.pdf',
    thumbnail: '/lovable-uploads/8e051ede-f5b9-47a0-a9a1-53e8db6bf84f.png',
    createdAt: '2024-01-10',
  },
  {
    id: 'res-7',
    title: 'Planeamento Financeiro',
    description: 'Webinar sobre planeamento financeiro pessoal',
    pillar: 'assistencia_financeira',
    type: 'video',
    videoUrl: 'https://example.com/financial-planning',
    duration: '45 min',
    thumbnail: '/lovable-uploads/64839ced-48a0-4bc0-96d3-55b3c2d871a9.png',
    createdAt: '2024-02-10',
  },
  
  // Assistência Jurídica
  {
    id: 'res-8',
    title: 'Direitos do Trabalhador',
    description: 'Conheça os seus direitos no ambiente de trabalho',
    pillar: 'assistencia_juridica',
    type: 'pdf',
    fileUrl: '/resources/worker-rights.pdf',
    thumbnail: '/lovable-uploads/6f3eb5fe-a35b-4f90-afff-d0cc84a6cf3c.png',
    createdAt: '2024-01-30',
  },
  {
    id: 'res-9',
    title: 'Contratos de Trabalho',
    description: 'Guia prático sobre contratos e cláusulas',
    pillar: 'assistencia_juridica',
    type: 'article',
    fileUrl: '/resources/contracts-article.html',
    thumbnail: '/lovable-uploads/95a2cef7-45be-4018-af8e-4a5caea3205b.png',
    createdAt: '2024-02-15',
  },
];

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
