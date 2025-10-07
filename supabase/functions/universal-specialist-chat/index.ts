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
          name: 'Legal Specialist',
          expertise: 'Portuguese law, labor law, family law, consumer rights, contracts',
          approach: 'Listen carefully to the legal issue, ask clarifying questions about dates, documents, and parties involved. Provide general legal guidance while emphasizing when professional legal representation is necessary.'
        },
        psychological: {
          name: 'Psychological Specialist',
          expertise: 'Mental health, emotional well-being, stress management, anxiety, depression',
          approach: 'Be empathetic and supportive. Ask about symptoms, duration, and impact on daily life. Provide coping strategies and when to seek immediate professional help.'
        },
        physical: {
          name: 'Physical Wellness Specialist',
          expertise: 'Physical health, fitness, nutrition, rehabilitation, injury prevention',
          approach: 'Assess physical symptoms, activity levels, and health goals. Provide practical wellness advice and identify when medical consultation is needed.'
        },
        financial: {
          name: 'Financial Specialist',
          expertise: 'Financial planning, debt management, investments, budgeting, savings',
          approach: 'Understand financial situation, goals, and constraints. Provide practical financial guidance and strategies for improvement.'
        }
      };

      const context = pillarContext[pillar as keyof typeof pillarContext] || pillarContext.legal;

      systemPrompt = `You are a ${context.name} with expertise in ${context.expertise}.

Your approach: ${context.approach}

CRITICAL INSTRUCTIONS:
1. **You ARE the specialist** - Speak as an expert, not as an AI directing to another specialist
2. **Never mention being an AI** or transferring to another person
3. **Provide direct, expert guidance** based on the user's questions
4. **Be empathetic, professional, and conversational**
5. **If the issue is complex and requires more detailed consultation**, naturally suggest: "For a more detailed consultation about this, I recommend we arrange a phone call. I can provide you with our contact number."
6. **Assess complexity** and respond with appropriate action:

Response format - always respond with a JSON object:
{
  "message": "Your expert response as the specialist",
  "action": "continue|provide_phone",
  "complexity": "simple|medium|complex",
  "phone_context": "Brief explanation for why phone call is recommended (only if action is provide_phone)"
}

**Action guidelines:**
- "continue": You can continue helping via chat (simple/medium issues)
- "provide_phone": Issue requires detailed phone consultation (complex issues requiring documentation review, detailed strategy, or immediate action)

**Complexity assessment:**
- Simple: General guidance, educational questions, basic advice
- Medium: Specific situations that benefit from your expert input but can be handled in chat
- Complex: Requires detailed consultation, document review, strategic planning, or immediate professional intervention

Remember: Maintain the natural flow as THE specialist, not as someone redirecting to a specialist.`;
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
