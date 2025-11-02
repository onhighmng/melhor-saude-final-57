import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { corsHeaders } from "../_shared/auth.ts";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "../_shared/rateLimit.ts";
import {
  withErrorHandling,
  handleRateLimitError,
  successResponse
} from "../_shared/errors.ts";

// Input validation schema
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(10000)
});

const prediagnosticChatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  pillar: z.string().min(1).max(100),
  topic: z.string().min(1).max(200),
  context: z.string().max(2000).optional()
});

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // IP-based rate limiting (since this endpoint is public/pre-auth)
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(
    `prediagnostic-chat:${clientIP}`,
    RATE_LIMITS.MODERATE // 20 requests per minute per IP
  );

  if (!rateLimitResult.allowed) {
    return handleRateLimitError(rateLimitResult.resetAt);
  }

  // Also add hourly limit to prevent sustained abuse
  const hourlyRateLimitResult = checkRateLimit(
    `prediagnostic-chat:hourly:${clientIP}`,
    RATE_LIMITS.HOURLY_STRICT // 50 per hour
  );

  if (!hourlyRateLimitResult.allowed) {
    return handleRateLimitError(hourlyRateLimitResult.resetAt);
  }

  // Validate and parse input
  const body = await req.json();
  const { messages, pillar, topic, context } = prediagnosticChatSchema.parse(body);

  // Get Lovable AI key from environment
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  // Build system prompt with topic context and user selections
  const contextSection = context ? `\n\nUser's Context:\n${context}` : '';

  const systemPrompt = `You are a compassionate and professional wellness assistant specializing in ${pillar}.
The user has selected "${topic}" as their area of concern.${contextSection}

Your role is to:
1. Listen empathetically to the user's situation
2. Ask clarifying questions to better understand their needs
3. Provide supportive and constructive guidance
4. Help them articulate their concerns clearly
5. Keep responses concise and focused (2-3 paragraphs maximum)

Remember:
- You are NOT providing therapy or medical advice
- You are helping them prepare for their session with a human specialist
- Keep the conversation focused on understanding their situation
- Be warm, professional, and non-judgmental`;

  // Call Lovable AI Gateway
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash", // Using free Gemini model
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    // Handle rate limiting from AI provider
    if (response.status === 429) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          code: 'AI_RATE_LIMIT'
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({
          error: 'Service temporarily unavailable. Please contact support.',
          code: 'AI_PAYMENT_REQUIRED'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway returned ${response.status}`);
  }

  const data = await response.json();
  const aiMessage = data.choices?.[0]?.message?.content;

  if (!aiMessage) {
    throw new Error("No response from AI");
  }

  return successResponse({
    message: aiMessage,
    rateLimitRemaining: rateLimitResult.remaining,
    timestamp: new Date().toISOString()
  });
}

serve(withErrorHandling(handler));
