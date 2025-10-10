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

    const topicContext = assessment?.selectedTopics?.join(', ') || '';
    const symptomContext = assessment?.selectedSymptoms?.join(', ') || '';
    const notesContext = assessment?.additionalNotes || 'Nenhuma informação adicional';

    const systemPrompt = `Você é um assistente de bem-estar físico especializado em fornecer orientações gerais sobre saúde física, exercício e hábitos saudáveis.

O utilizador forneceu as seguintes informações:

Tópicos de interesse: ${topicContext}
Sintomas/Objetivos: ${symptomContext}
Informações adicionais: ${notesContext}

Sua função é:
1. Fornecer orientações sobre saúde física e exercício
2. Sugerir hábitos saudáveis e melhores práticas de bem-estar
3. Explicar benefícios de atividade física e alimentação equilibrada
4. Recomendar quando procurar um especialista (educador físico, nutricionista, fisioterapeuta)
5. Usar linguagem motivadora e acessível

IMPORTANTE:
- Sempre deixe claro que você fornece orientações gerais, não prescrição médica
- Recomende consultar profissionais de saúde para avaliação específica
- Seja encorajador, motivador e positivo
- Adapte suas respostas ao nível de condicionamento e objetivos do utilizador
- Mantenha respostas práticas e motivadoras`;

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
    console.error('Error in physical-wellness-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
