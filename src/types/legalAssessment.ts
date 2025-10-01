export interface LegalTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface LegalSymptom {
  id: string;
  topicId: string;
  text: string;
}

export interface LegalAssessment {
  selectedTopics: string[];
  selectedSymptoms: string[];
  additionalNotes?: string;
}

export const legalTopics: LegalTopic[] = [
  {
    id: 'consumer',
    title: 'Direito do Consumidor',
    description: 'Problemas com produtos, serviços, contratos de consumo',
    icon: '🛒'
  },
  {
    id: 'labor',
    title: 'Direito do Trabalho',
    description: 'Questões trabalhistas, demissões, direitos laborais',
    icon: '💼'
  },
  {
    id: 'family',
    title: 'Direito de Família',
    description: 'Divórcio, pensão alimentícia, guarda de filhos',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 'property',
    title: 'Direito Imobiliário',
    description: 'Contratos de aluguel, compra e venda, vizinhança',
    icon: '🏠'
  },
  {
    id: 'criminal',
    title: 'Direito Criminal',
    description: 'Questões penais, processos criminais, defesa',
    icon: '⚖️'
  },
  {
    id: 'civil',
    title: 'Direito Civil',
    description: 'Contratos, danos morais, responsabilidade civil',
    icon: '📜'
  }
];

export const legalSymptoms: LegalSymptom[] = [
  // Consumer
  { id: 'consumer_1', topicId: 'consumer', text: 'Produto com defeito ou não funciona como prometido' },
  { id: 'consumer_2', topicId: 'consumer', text: 'Serviço mal prestado ou não entregue' },
  { id: 'consumer_3', topicId: 'consumer', text: 'Cobrança indevida ou valor diferente do acordado' },
  { id: 'consumer_4', topicId: 'consumer', text: 'Propaganda enganosa ou informações falsas' },
  { id: 'consumer_5', topicId: 'consumer', text: 'Dificuldade para cancelar serviço ou contrato' },
  
  // Labor
  { id: 'labor_1', topicId: 'labor', text: 'Demissão sem justa causa ou sem pagamento correto' },
  { id: 'labor_2', topicId: 'labor', text: 'Horas extras não pagas' },
  { id: 'labor_3', topicId: 'labor', text: 'Assédio moral ou sexual no trabalho' },
  { id: 'labor_4', topicId: 'labor', text: 'Acidente de trabalho ou doença ocupacional' },
  { id: 'labor_5', topicId: 'labor', text: 'Férias não concedidas ou não pagas' },
  
  // Family
  { id: 'family_1', topicId: 'family', text: 'Processo de divórcio ou separação' },
  { id: 'family_2', topicId: 'family', text: 'Questões sobre guarda de filhos' },
  { id: 'family_3', topicId: 'family', text: 'Pensão alimentícia não paga' },
  { id: 'family_4', topicId: 'family', text: 'Partilha de bens' },
  { id: 'family_5', topicId: 'family', text: 'Questões de herança' },
  
  // Property
  { id: 'property_1', topicId: 'property', text: 'Problemas com contrato de aluguel' },
  { id: 'property_2', topicId: 'property', text: 'Despejo ou ameaça de despejo' },
  { id: 'property_3', topicId: 'property', text: 'Problemas com vizinhos (barulho, invasão)' },
  { id: 'property_4', topicId: 'property', text: 'Compra ou venda de imóvel com problemas' },
  { id: 'property_5', topicId: 'property', text: 'Documentação irregular do imóvel' },
  
  // Criminal
  { id: 'criminal_1', topicId: 'criminal', text: 'Acusação de crime' },
  { id: 'criminal_2', topicId: 'criminal', text: 'Vítima de crime (furto, roubo, agressão)' },
  { id: 'criminal_3', topicId: 'criminal', text: 'Processo criminal em andamento' },
  { id: 'criminal_4', topicId: 'criminal', text: 'Necessidade de boletim de ocorrência' },
  { id: 'criminal_5', topicId: 'criminal', text: 'Questões sobre prisão ou liberdade provisória' },
  
  // Civil
  { id: 'civil_1', topicId: 'civil', text: 'Problemas com contratos em geral' },
  { id: 'civil_2', topicId: 'civil', text: 'Dano moral ou material sofrido' },
  { id: 'civil_3', topicId: 'civil', text: 'Dívidas ou cobrança judicial' },
  { id: 'civil_4', topicId: 'civil', text: 'Nome sujo ou negativado indevidamente' },
  { id: 'civil_5', topicId: 'civil', text: 'Questões de responsabilidade civil' }
];
