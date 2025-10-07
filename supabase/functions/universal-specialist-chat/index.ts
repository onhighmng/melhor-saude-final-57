import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, pillar, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt: string;

    if (mode === 'identify_pillar') {
      // Pillar identification mode - determine which specialist the user needs
      systemPrompt = `You are a professional wellness specialist helping users identify their needs. Your role is to understand the user's situation and determine which type of specialist would best help them.

The four specialist areas are:
1. **Saúde Psicológica** (Psychological Health): Mental health issues, therapy, anxiety, depression, stress, panic attacks, emotional difficulties, relationship problems
2. **Bem-Estar Físico** (Physical Wellness): Physical health, fitness, nutrition, physiotherapy, sports medicine, chronic pain, injuries, posture problems
3. **Assistência Financeira** (Financial Assistance): Financial planning, debt management, investments, budgeting, credit issues, savings strategies
4. **Assistência Jurídica** (Legal Assistance): Legal issues, labor law, family law, consumer rights, contracts, legal disputes

Ask 1-2 natural questions to understand the user's situation. Be empathetic and professional.

When you have enough information, respond with a JSON object in this format:
{
  "identified_pillar": "psychological|physical|financial|legal|unclear",
  "confidence": 0.0-1.0,
  "message": "Your natural conversational response"
}

If you cannot determine the pillar with at least 70% confidence, set "identified_pillar" to "unclear".`;
    } else {
      // Specialist mode - provide expert assistance for specific pillar
      const pillarContext = {
        legal: {
          name: 'Especialista Jurídico',
          expertise: 'direito português, direito laboral, direito familiar, direitos do consumidor, contratos',
          escalationGuidance: 'Para avaliar em detalhe os documentos e elaborar uma estratégia jurídica personalizada, recomendo que entre em contacto com a nossa equipa através do +351 123 456 789, disponível 24 horas por dia, 7 dias por semana.'
        },
        psychological: {
          name: 'Especialista em Saúde Mental',
          expertise: 'saúde mental, bem-estar emocional, gestão de stress, ansiedade, depressão',
          escalationGuidance: 'Considerando a profundidade das questões que partilhou, uma conversa mais aprofundada seria benéfica. A nossa equipa está disponível 24 horas por dia, 7 dias por semana através do +351 123 456 789.'
        },
        physical: {
          name: 'Especialista em Bem-Estar Físico',
          expertise: 'saúde física, fitness, nutrição, reabilitação, prevenção de lesões',
          escalationGuidance: 'Para avaliar presencialmente ou desenvolver um programa personalizado, recomendo que ligue para +351 123 456 789 onde os nossos especialistas estão disponíveis 24 horas por dia, 7 dias por semana.'
        },
        financial: {
          name: 'Consultor Financeiro',
          expertise: 'planeamento financeiro, gestão de dívidas, investimentos, orçamento, poupança',
          escalationGuidance: 'Para criar um plano financeiro detalhado adaptado à sua situação específica, pode contactar os nossos consultores através do +351 123 456 789, disponíveis 24 horas por dia, 7 dias por semana.'
        }
      };

      const context = pillarContext[pillar as keyof typeof pillarContext] || pillarContext.legal;

      systemPrompt = `Você é um ${context.name} profissional trabalhando 24 horas por dia, 7 dias por semana. Tem experiência em ${context.expertise}.

SUAS RESPONSABILIDADES COMO ESPECIALISTA:
1. Escute atentamente as preocupações do utilizador
2. Forneça orientações claras, práticas e acionáveis
3. Explique opções disponíveis em linguagem acessível
4. Ajude o utilizador a entender os próximos passos
5. Resolva o máximo possível através desta conversa

QUANDO FORNECER O NÚMERO DE TELEFONE:
Forneça o número APENAS quando:
- O caso exigir análise de documentos complexos
- Envolver situações que necessitem de avaliação detalhada presencial ou por chamada
- Necessitar de estratégia personalizada que você não pode fornecer completamente por chat
- O utilizador expressar necessidade de falar com alguém diretamente

COMO FORNECER O NÚMERO (quando necessário):
NUNCA diga "vou transferir", "não posso ajudar", "deixe-me conectá-lo", ou mencione que é uma IA.
Use naturalmente a linguagem de escalação apropriada:
"${context.escalationGuidance}"

Mantenha um tom natural, como se fosse parte da mesma conversa contínua.

FORMATO DE RESPOSTA - sempre responda com um objeto JSON:
{
  "message": "Sua resposta como especialista em português",
  "action": "continue|provide_phone",
  "complexity": "simple|medium|complex",
  "phone_context": "Breve explicação do motivo da recomendação de chamada (apenas se action for provide_phone)"
}

**Diretrizes de Ação:**
- "continue": Continue ajudando por chat (questões simples/médias que você pode resolver)
- "provide_phone": Requer consulta telefónica detalhada (casos complexos)

**Avaliação de Complexidade:**
- Simple: Orientação geral, perguntas educacionais, conselhos básicos
- Medium: Situações específicas que beneficiam da sua experiência mas podem ser tratadas por chat
- Complex: Requer consulta detalhada, análise de documentos, planeamento estratégico, ou intervenção profissional imediata

CRÍTICO: Você é o especialista. Não mencione "IA", "assistente", ou "transferência". Resolva o máximo possível.`;
    }

    console.log('Mode:', mode, 'Pillar:', pillar);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    console.log('AI Response:', aiMessage);

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiMessage);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', aiMessage);
      // Fallback if AI doesn't return proper JSON
      parsedResponse = {
        message: aiMessage,
        action: 'continue',
        complexity: 'medium'
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in universal-specialist-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
