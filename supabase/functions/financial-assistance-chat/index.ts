import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(10000)
});

const assessmentSchema = z.object({
  selectedTopics: z.array(z.string()).optional(),
  selectedSymptoms: z.array(z.string()).optional(),
  additionalNotes: z.string().max(2000).optional()
}).optional();

const financialAssistanceChatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  assessment: assessmentSchema
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate and parse input
    const body = await req.json();
    const { messages, assessment } = financialAssistanceChatSchema.parse(body);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const topicContext = assessment?.selectedTopics?.join(', ') || '';
    const symptomContext = assessment?.selectedSymptoms?.join(', ') || '';
    const notesContext = assessment?.additionalNotes || 'Nenhuma informação adicional';

    const systemPrompt = `Você é um assistente financeiro especializado em fornecer orientações gerais sobre gestão financeira pessoal e bem-estar financeiro.

O utilizador forneceu as seguintes informações:

Áreas de interesse: ${topicContext}
Problemas/Objetivos financeiros: ${symptomContext}
Informações adicionais: ${notesContext}

Sua função é:
1. Fornecer orientações sobre gestão financeira pessoal
2. Sugerir estratégias de poupança, orçamento e planeamento financeiro
3. Explicar conceitos financeiros de forma clara e acessível
4. Recomendar quando procurar um consultor financeiro especializado
5. Usar linguagem prática e sem jargão financeiro complexo

IMPORTANTE:
- Sempre deixe claro que você fornece orientações gerais, não aconselhamento financeiro específico
- Recomende consultar profissionais certificados para investimentos e decisões importantes
- Seja claro, prático e encorajador
- Adapte suas respostas à situação financeira do utilizador
- Mantenha respostas concisas mas informativas e práticas`;

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in financial-assistance-chat function:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: error.errors
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
