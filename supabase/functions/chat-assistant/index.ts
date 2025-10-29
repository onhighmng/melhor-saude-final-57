// Supabase Edge Function for Support Chat Assistant
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sessionId, message, userId, pillar } = await req.json()

    console.log(`[CHAT ASSISTANT] Session: ${sessionId}, User: ${userId}, Pillar: ${pillar}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Save user message to database
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message
      })

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError)
    }

    // Generate response using rule-based logic
    const response = generateResponse(message, pillar)

    // Save bot response to database
    const { error: botMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: response.message,
        metadata: { confidence: response.confidence, pillar }
      })

    if (botMsgError) {
      console.error('Error saving bot message:', botMsgError)
    }

    // Update chat session if needed
    if (response.suggestEscalation) {
      await supabase
        .from('chat_sessions')
        .update({ status: 'needs_escalation' })
        .eq('id', sessionId)
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    console.error('Error in chat-assistant:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Desculpe, ocorreu um erro. Tente novamente.',
        confidence: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function generateResponse(message: string, pillar?: string) {
  const lowerMessage = message.toLowerCase()
  
  // Keywords for urgent escalation
  const urgentKeywords = ['urgente', 'emergência', 'ajuda imediata', 'crise', 'suicídio', 'perigo']
  const needsHumanKeywords = ['falar com alguém', 'atendente', 'pessoa real', 'humano', 'pessoa', 'especialista']
  
  if (urgentKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      message: "⚠️ Entendo que é urgente. Para situações de emergência, é importante falar com um especialista imediatamente. Posso conectá-lo com um profissional agora. Deseja continuar?",
      confidence: 0.2,
      suggestEscalation: true
    }
  }
  
  if (needsHumanKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      message: "Claro! Posso transferir você para um dos nossos especialistas que poderá ajudá-lo melhor. Deseja que eu faça isso?",
      confidence: 0.3,
      suggestEscalation: true
    }
  }

  // Pillar-specific responses
  if (pillar === 'saude_mental' || lowerMessage.includes('stress') || lowerMessage.includes('ansiedade') || lowerMessage.includes('depressão')) {
    if (lowerMessage.includes('agendar') || lowerMessage.includes('marcar')) {
      return {
        message: "Para agendar uma sessão com um psicólogo, aceda ao menu 'Marcar Sessão' no seu painel. Lá pode escolher o profissional e horário mais adequados. Posso ajudá-lo com mais alguma coisa?",
        confidence: 0.85,
        suggestEscalation: false
      }
    }
    
    return {
      message: "Compreendo a sua preocupação com saúde mental. Oferecemos apoio psicológico profissional. Pode marcar uma sessão através do menu ou explorar os nossos recursos de autoajuda. Como prefere prosseguir?",
      confidence: 0.75,
      suggestEscalation: false
    }
  }

  if (pillar === 'saude_fisica' || lowerMessage.includes('físic') || lowerMessage.includes('médic') || lowerMessage.includes('dor')) {
    return {
      message: "Para consultas de saúde física, pode agendar com os nossos profissionais de saúde através do menu 'Marcar Sessão'. Se for uma questão urgente, recomendo contactar um serviço médico de emergência.",
      confidence: 0.8,
      suggestEscalation: false
    }
  }

  if (pillar === 'apoio_juridico' || lowerMessage.includes('juríd') || lowerMessage.includes('legal') || lowerMessage.includes('direito')) {
    return {
      message: "Oferecemos apoio jurídico especializado. Pode marcar uma sessão com um dos nossos advogados através do menu 'Marcar Sessão'. Eles poderão orientá-lo sobre a sua questão legal.",
      confidence: 0.8,
      suggestEscalation: false
    }
  }

  if (pillar === 'apoio_financeiro' || lowerMessage.includes('financ') || lowerMessage.includes('dinheiro') || lowerMessage.includes('orçamento')) {
    return {
      message: "Temos consultores financeiros que podem ajudá-lo com planeamento financeiro, gestão de orçamento e outras questões relacionadas. Deseja marcar uma sessão?",
      confidence: 0.8,
      suggestEscalation: false
    }
  }

  // Login/Access issues
  if (lowerMessage.includes('login') || lowerMessage.includes('acesso') || lowerMessage.includes('senha') || lowerMessage.includes('password')) {
    return {
      message: "Para problemas de acesso:\n• Certifique-se que está a usar o email correto\n• Use a opção 'Esqueceu a palavra-passe?' se necessário\n• Verifique se o seu convite foi aceite\n\nSe o problema persistir, posso encaminhar para o suporte técnico.",
      confidence: 0.85,
      suggestEscalation: false
    }
  }

  // Booking questions
  if (lowerMessage.includes('agendar') || lowerMessage.includes('marcar') || lowerMessage.includes('sessão') || lowerMessage.includes('consulta')) {
    return {
      message: "Para marcar uma sessão:\n1. Aceda ao menu 'Marcar Sessão'\n2. Escolha o pilar de apoio (mental, físico, jurídico, financeiro)\n3. Selecione o profissional e horário\n4. Confirme a marcação\n\nTem alguma dúvida sobre este processo?",
      confidence: 0.9,
      suggestEscalation: false
    }
  }

  // General greeting
  if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde')) {
    return {
      message: "Olá! 👋 Sou o assistente virtual da plataforma OnHigh Management. Estou aqui para ajudá-lo com:\n• Marcação de sessões\n• Informações sobre os serviços\n• Questões sobre a plataforma\n\nComo posso ajudá-lo hoje?",
      confidence: 1,
      suggestEscalation: false
    }
  }

  // Default response - medium confidence
  return {
    message: "Obrigado pela sua mensagem. Posso ajudá-lo com:\n• Marcar sessões de apoio psicológico, médico, jurídico ou financeiro\n• Informações sobre os nossos serviços\n• Questões técnicas da plataforma\n\nPoderia ser mais específico sobre o que precisa?",
    confidence: 0.5,
    suggestEscalation: false
  }
}
