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

const legalChatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  assessment: assessmentSchema,
  mode: z.enum(['prediagnostic', 'general']).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate and parse input
    const body = await req.json();
    const { messages, assessment, mode } = legalChatSchema.parse(body);
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt: string;

    if (mode === 'prediagnostic') {
      // Pre-diagnostic mode: Act as a diagnostician to help prepare for human consultation
      systemPrompt = `Você é um assistente de pré-diagnóstico jurídico especializado. Sua função é ajudar o utilizador a organizar e entender sua situação jurídica ANTES da consulta com um especialista humano.

Seu objetivo é:
1. Fazer perguntas diagnósticas relevantes para entender a situação completa
2. Identificar as áreas jurídicas envolvidas
3. Ajudar o utilizador a organizar os fatos e documentos relevantes
4. Criar um resumo estruturado que será útil para o especialista humano
5. Preparar uma lista de questões que o utilizador deve fazer ao advogado

IMPORTANTE:
- Faça perguntas específicas e direcionadas
- Seja empático e profissional
- Ajude o utilizador a identificar informações e documentos importantes
- Não forneça aconselhamento jurídico específico - seu papel é preparatório
- Ao final, resuma os principais pontos discutidos
- Mantenha um tom profissional mas acessível`;
    } else {
      // Full assessment mode: Provide legal guidance based on assessment
      const topicContext = assessment?.selectedTopics?.join(', ') || '';
      const symptomContext = assessment?.selectedSymptoms?.join(', ') || '';
      const notesContext = assessment?.additionalNotes || 'Nenhuma informação adicional';

      systemPrompt = `Você é um assistente jurídico especializado em fornecer orientações gerais sobre questões legais em Portugal. 
    
O utilizador forneceu as seguintes informações sobre sua situação:

Áreas jurídicas de interesse: ${topicContext}
Sintomas/Problemas identificados: ${symptomContext}
Informações adicionais: ${notesContext}

Sua função é:
1. Fornecer orientações gerais sobre questões jurídicas
2. Explicar direitos e procedimentos de forma clara
3. Sugerir próximos passos que o utilizador pode tomar
4. Recomendar quando procurar um advogado especializado
5. Usar linguagem acessível e evitar jargão jurídico complexo

IMPORTANTE: 
- Sempre deixe claro que você fornece orientações gerais, não aconselhamento jurídico específico
- Recomende consultar um advogado para casos específicos
- Seja empático e compreensivo
- Adapte suas respostas ao contexto fornecido pelo utilizador
- Mantenha respostas concisas mas informativas`;
    }

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
    console.error('Error in legal-chat function:', error);

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
