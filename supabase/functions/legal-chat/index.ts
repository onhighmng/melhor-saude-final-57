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
    const { messages, assessment } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from assessment
    const topicContext = assessment.selectedTopics.join(', ');
    const symptomContext = assessment.selectedSymptoms.join(', ');
    const notesContext = assessment.additionalNotes || 'Nenhuma informação adicional';

    const systemPrompt = `Você é um assistente jurídico especializado em fornecer orientações gerais sobre questões legais em Portugal. 
    
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
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in legal-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
