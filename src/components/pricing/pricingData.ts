
export const individualPlans = [
  {
    title: 'Mensal',
    price: '7599',
    period: '/ mês',
    description: 'MZN 7,599 pagos todos os meses.',
    buttonText: 'Começar mensal',
    href: '',
    transform: 'transform -rotate-3 translate-x-[-36px] translate-y-[18.78px]',
    decorativeImages: [
      {
        src: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66583654a49c400d4d10dd58_Fern%202.webp',
        alt: '',
        className: 'absolute w-24 h-40 bottom-[-2em] left-0 object-contain'
      },
      {
        src: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/6658a692db67728c0cedfa20_Leaves%202.webp',
        alt: '',
        className: 'absolute w-36 h-44 top-[-4em] right-[-0.3em] object-contain'
      }
    ]
  },
  {
    title: 'Trimestral',
    price: '6649',
    period: '/ mês',
    description: 'MZN 19,947 pagos a cada 3 meses.',
    buttonText: 'Começar trimestral',
    href: '',
    backgroundColor: 'bg-orange-100',
    badge: {
      text: 'Mais popular',
      color: 'bg-green-200 text-green-800'
    },
    decorativeLeaf: true,
    decorativeImages: [
      {
        src: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/6658365416b1a17d4b551283_Orange_Tree%202.webp',
        alt: '',
        className: 'absolute w-40 h-[416px] top-[-50%] left-[-15%] transform rotate-45 object-contain'
      }
    ]
  },
  {
    title: 'Anual',
    price: '6019',
    period: '/ mês',
    description: 'MZN 72,228 pagos anualmente.',
    buttonText: 'Começar anual',
    href: '',
    transform: 'transform rotate-3 translate-x-[36px] translate-y-[18.78px]',
    badge: {
      text: 'Melhor valor',
      color: 'bg-yellow-200 text-yellow-800'
    },
    decorativeImages: [
      {
        src: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/6658a692358226500778502e_Haning%20Tree%201.webp',
        alt: '',
        className: 'absolute w-24 h-80 top-[-9em] left-[-0.5em] object-contain'
      },
      {
        src: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/65a2bf8357bde59b25ddb36a_left_butterfly.png',
        alt: '',
        className: 'absolute w-12 h-10 top-12 right-12 object-contain'
      }
    ]
  }
];

export const enterprisePlans = [
  {
    title: 'Equipas Pequenas',
    priceText: 'A partir de MZN 6019',
    subtitle: '/ utilizador / mês',
    description: 'Descontos por volume para equipas pequenas. Inclui acesso completo para cada colaborador e relatórios mensais.',
    buttonText: 'Solicitar proposta',
    href: '',
    transform: 'transform -rotate-1 translate-x-[-18px] translate-y-[9px]',
    badge: {
      text: 'Para PME',
      color: 'bg-blue-200 text-blue-800'
    },
    decorativeImages: [
      {
        src: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/66583654a49c400d4d10dd58_Fern%202.webp',
        alt: '',
        className: 'absolute w-24 h-40 bottom-[-2em] left-0 object-contain opacity-30'
      }
    ]
  },
  {
    title: 'Empresas Grandes',
    priceText: 'Preço personalizado',
    description: 'Integração com RH, gestão centralizada, suporte dedicado e onboarding personalizado.',
    buttonText: 'Falar com equipa comercial',
    href: '',
    backgroundColor: 'bg-purple-100',
    transform: 'transform rotate-1 translate-x-[18px] translate-y-[9px]',
    badge: {
      text: 'Empresas grandes',
      color: 'bg-purple-200 text-purple-800'
    },
    decorativeImages: [
      {
        src: 'https://cdn.prod.website-files.com/659f15a242e58eb40c8cf14b/6658365416b1a17d4b551283_Orange_Tree%202.webp',
        alt: '',
        className: 'absolute w-32 h-[300px] top-[-30%] right-[-10%] transform rotate-15 object-contain opacity-30'
      }
    ]
  }
];
