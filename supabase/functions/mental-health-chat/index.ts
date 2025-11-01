import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// JWT parsing helper
function parseJWT(authHeader: string | null): { userId: string; role: string } | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  try {
    const token = authHeader.substring(7) // Remove 'Bearer '
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return {
      userId: payload.sub,
      role: payload.user_role || payload.role || 'user'
    }
  } catch {
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ Parse JWT properly
    const authHeader = req.headers.get('Authorization')
    const jwt = parseJWT(authHeader)

    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or missing JWT' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { messages, assessment } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const topicContext = assessment?.selectedTopics?.join(', ') || '';
    const symptomContext = assessment?.selectedSymptoms?.join(', ') || '';
    const notesContext = assessment?.additionalNotes || 'Nenhuma informação adicional';

    const systemPrompt = `Você é um assistente de saúde mental especializado em fornecer apoio emocional e orientações gerais sobre bem-estar psicológico.

O utilizador forneceu as seguintes informações:

Tópicos de interesse: ${topicContext}
Sintomas identificados: ${symptomContext}
Informações adicionais: ${notesContext}

Sua função é:
1. Ouvir com empatia e compreensão
2. Fornecer orientações sobre bem-estar emocional e mental
3. Sugerir técnicas de gestão emocional, stress e ansiedade
4. Recomendar quando procurar um psicólogo, terapeuta ou psiquiatra
5. Usar linguagem acolhedora e sem julgamentos

IMPORTANTE:
- Sempre deixe claro que você fornece apoio geral, não diagnóstico ou tratamento
- Recomende procurar profissionais para casos que necessitem acompanhamento
- Seja empático, compreensivo e acolhedor
- Adapte suas respostas ao contexto emocional do utilizador
- Mantenha respostas concisas mas reconfortantes`;

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
    console.error('Error in mental-health-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
