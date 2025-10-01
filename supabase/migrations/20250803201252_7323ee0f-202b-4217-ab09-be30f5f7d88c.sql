-- Add 'financeira' category to the self_help_content category enum
ALTER TYPE category ADD VALUE IF NOT EXISTS 'financeira';

-- Insert sample financial health content
INSERT INTO public.self_help_content (
  title, 
  category, 
  content_type, 
  author, 
  content_body, 
  summary, 
  tags, 
  is_published
) VALUES 
(
  'Como Criar um Orçamento Pessoal Eficaz',
  'financeira',
  'article',
  'Consultora Financeira Ana Silva',
  '<h2>Passos para um Orçamento Bem-Sucedido</h2>
   <p>Criar um orçamento pessoal é fundamental para alcançar estabilidade financeira. Comece por:</p>
   <ul>
     <li><strong>Registe todas as receitas:</strong> Inclua salário, rendimentos extras e outras fontes</li>
     <li><strong>Liste todas as despesas:</strong> Divida em fixas (renda, seguros) e variáveis (alimentação, lazer)</li>
     <li><strong>Aplique a regra 50-30-20:</strong> 50% necessidades, 30% desejos, 20% poupanças</li>
     <li><strong>Revise mensalmente:</strong> Ajuste conforme necessário para manter o equilíbrio</li>
   </ul>
   <h3>Ferramentas Úteis</h3>
   <p>Use aplicações como Excel, Google Sheets ou apps específicos para controlo financeiro.</p>',
  'Aprenda a criar um orçamento pessoal eficaz com dicas práticas e ferramentas úteis para gerir as suas finanças.',
  ARRAY['orçamento', 'finanças pessoais', 'poupança', 'gestão financeira'],
  true
),
(
  'Estratégias para Eliminar Dívidas',
  'financeira',
  'article',
  'Especialista Financeiro João Costa',
  '<h2>Métodos Comprovados para Quitar Dívidas</h2>
   <p>Eliminar dívidas requer estratégia e disciplina. Considere estas abordagens:</p>
   <h3>1. Método Bola de Neve</h3>
   <p>Pague primeiro as dívidas menores, criando momentum psicológico.</p>
   <h3>2. Método Avalanche</h3>
   <p>Foque nas dívidas com juros mais altos para economizar dinheiro a longo prazo.</p>
   <h3>3. Consolidação de Dívidas</h3>
   <p>Considere reunir várias dívidas numa só com taxa de juro mais baixa.</p>
   <h3>Dicas Importantes:</h3>
   <ul>
     <li>Corte gastos desnecessários</li>
     <li>Negocie com credores</li>
     <li>Procure renda extra</li>
     <li>Evite contrair novas dívidas</li>
   </ul>',
  'Descubra métodos eficazes para eliminar dívidas e recuperar a sua saúde financeira.',
  ARRAY['dívidas', 'gestão financeira', 'estratégias', 'liquidação'],
  true
),
(
  'Investimentos para Iniciantes',
  'financeira',
  'article',
  'Consultora de Investimentos Maria Santos',
  '<h2>Primeiros Passos no Mundo dos Investimentos</h2>
   <p>Investir pode parecer intimidante, mas com conhecimento básico pode começar de forma segura:</p>
   <h3>Antes de Investir:</h3>
   <ul>
     <li>Quite dívidas de alto juro</li>
     <li>Crie um fundo de emergência (3-6 meses de despesas)</li>
     <li>Defina os seus objetivos financeiros</li>
   </ul>
   <h3>Tipos de Investimentos para Iniciantes:</h3>
   <p><strong>Depósitos a Prazo:</strong> Seguros, baixo risco, rendimento garantido</p>
   <p><strong>Fundos de Investimento:</strong> Diversificação automática, gestão profissional</p>
   <p><strong>Certificados de Aforro:</strong> Produto do Estado, acessível e seguro</p>
   <h3>Princípios Fundamentais:</h3>
   <ul>
     <li>Diversifique os seus investimentos</li>
     <li>Invista regularmente (mesmo valores pequenos)</li>
     <li>Mantenha visão de longo prazo</li>
     <li>Continue a aprender</li>
   </ul>',
  'Guia completo para quem quer começar a investir de forma segura e consciente.',
  ARRAY['investimentos', 'iniciantes', 'fundos', 'poupança', 'rendimento'],
  true
),
(
  'Planeamento da Reforma',
  'financeira',
  'article',
  'Planeador Financeiro Certificado Pedro Oliveira',
  '<h2>Como Planear uma Reforma Confortável</h2>
   <p>Nunca é cedo demais para pensar na reforma. Quanto mais cedo começar, melhor:</p>
   <h3>Calcule as Suas Necessidades:</h3>
   <ul>
     <li>Estime os gastos mensais na reforma (70-80% do rendimento atual)</li>
     <li>Considere a inflação ao longo dos anos</li>
     <li>Avalie que reforma pode esperar da Segurança Social</li>
   </ul>
   <h3>Estratégias de Poupança:</h3>
   <p><strong>PPR (Plano Poupança Reforma):</strong> Benefícios fiscais e crescimento a longo prazo</p>
   <p><strong>Fundos de Pensões:</strong> Gestão profissional e diversificação</p>
   <p><strong>Investimentos Diversificados:</strong> Ações, obrigações, imobiliário</p>
   <h3>Regra dos 25x:</h3>
   <p>Para se reformar, precisa de 25 vezes os seus gastos anuais em investimentos.</p>
   <p>Exemplo: Se gasta 2.000€/mês, precisa de 600.000€ investidos.</p>',
  'Aprenda a planear a sua reforma de forma eficaz e garanta um futuro financeiro seguro.',
  ARRAY['reforma', 'planeamento', 'PPR', 'pensões', 'futuro'],
  true
),
(
  'Educação Financeira para Toda a Família',
  'financeira',
  'article',
  'Educadora Financeira Sofia Rodrigues',
  '<h2>Envolvendo Toda a Família na Gestão Financeira</h2>
   <p>A educação financeira deve começar cedo e envolver todos os membros da família:</p>
   <h3>Para Crianças (6-12 anos):</h3>
   <ul>
     <li>Ensine o valor do dinheiro através de mesadas</li>
     <li>Use jogos educativos sobre finanças</li>
     <li>Demonstre a diferença entre necessidades e desejos</li>
     <li>Incentive a poupança com objetivos pequenos</li>
   </ul>
   <h3>Para Adolescentes (13-18 anos):</h3>
   <ul>
     <li>Abra uma conta bancária em conjunto</li>
     <li>Ensine sobre cartões de débito e crédito</li>
     <li>Discuta custos universitários e financiamento</li>
     <li>Introduza conceitos de investimento</li>
   </ul>
   <h3>Conversas em Família:</h3>
   <p>Realize reuniões mensais para discutir:</p>
   <ul>
     <li>Orçamento familiar</li>
     <li>Objetivos financeiros</li>
     <li>Decisões de compras importantes</li>
     <li>Progresso das poupanças</li>
   </ul>',
  'Guia para educar financeiramente toda a família e criar hábitos saudáveis de gestão do dinheiro.',
  ARRAY['educação financeira', 'família', 'crianças', 'adolescentes', 'hábitos'],
  true
);