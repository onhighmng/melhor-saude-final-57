# Replace Failing Mental Health Chat with N8N Integration

## Problem
Your `mental-health-chat` Edge Function is returning a 500 error because:
- The `LOVABLE_API_KEY` is missing or expired
- This requires a paid API key from Lovable AI Gateway
- The function is failing and blocking users from getting help

## Solution
Use your N8N chatbot integration instead! You control it, and it's already configured.

## Quick Fix: Update MentalHealthChatInterface

Replace the failing Supabase function call with the N8N service:

### Option 1: Update the Component to Use N8N (Recommended)

```typescript
// src/components/mental-health-assessment/MentalHealthChatInterface.tsx

// Replace this import:
// import { supabase } from '@/integrations/supabase/client';

// Add this import:
import { useN8NChat } from '@/hooks/useN8NChat';

// Then in your component, replace the sendMessage function:

export function MentalHealthChatInterface({ assessment, onBack, onComplete }) {
  // Remove: const [messages, setMessages] = useState<Message[]>([]);
  // Remove: const [isLoading, setIsLoading] = useState(false);
  
  // Add this instead:
  const { 
    messages, 
    isLoading, 
    sendMessage: sendN8NMessage,
    sessionId 
  } = useN8NChat({
    onMessageSent: (msg) => console.log('[N8N] Sent:', msg),
    onResponseReceived: (res) => console.log('[N8N] Received:', res),
  });

  // Update your sendMessage function:
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');

    // Send to N8N instead of Supabase function
    await sendN8NMessage(userMessage, {
      assessment: {
        selectedTopics: assessment?.selectedTopics,
        selectedSymptoms: assessment?.selectedSymptoms,
        additionalNotes: assessment?.additionalNotes,
      },
      pillar: 'mental_health',
      context: 'mental_health_assessment',
    });
  };

  // Rest of your component stays the same
}
```

### Option 2: Create a New N8N-Based Mental Health Chat (Cleaner)

Create a new file: `src/components/mental-health-assessment/N8NMentalHealthChat.tsx`

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useN8NChat } from '@/hooks/useN8NChat';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, ArrowLeft } from 'lucide-react';

interface Assessment {
  selectedTopics?: string[];
  selectedSymptoms?: string[];
  additionalNotes?: string;
}

interface N8NMentalHealthChatProps {
  assessment: Assessment;
  onBack: () => void;
  onComplete: (sessionId: string) => void;
}

export function N8NMentalHealthChat({
  assessment,
  onBack,
  onComplete,
}: N8NMentalHealthChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, sessionId } = useN8NChat({
    onResponseReceived: (response) => {
      // Save to chat_messages table if needed
      console.log('[Mental Health Chat] Response:', response);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input;
    setInput('');

    await sendMessage(messageText, {
      assessment: {
        selectedTopics: assessment?.selectedTopics,
        selectedSymptoms: assessment?.selectedSymptoms,
        additionalNotes: assessment?.additionalNotes,
      },
      pillar: 'saude_mental',
      type: 'mental_health_assessment',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleComplete = () => {
    onComplete(sessionId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-lg font-semibold">Apoio de Saúde Mental</h2>
        <Button onClick={handleComplete}>Concluir</Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.content}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="resize-none"
            rows={2}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}
```

Then update your flow to use this new component:

```typescript
// src/components/mental-health-assessment/MentalHealthAssessmentFlow.tsx

import { N8NMentalHealthChat } from './N8NMentalHealthChat';

// Replace MentalHealthChatInterface with N8NMentalHealthChat
<N8NMentalHealthChat
  assessment={assessment}
  onBack={handleBack}
  onComplete={handleComplete}
/>
```

## Benefits of Using N8N

1. ✅ **No API key costs** - You control the backend
2. ✅ **Already configured** - Webhook is ready to use
3. ✅ **More reliable** - Not dependent on third-party AI services
4. ✅ **Customizable** - You can modify the N8N workflow as needed
5. ✅ **Consistent** - Same backend for all your chats

## Testing

1. Update the component as shown above
2. Navigate to the mental health assessment
3. Try sending a message
4. Check browser console for `[N8N]` logs
5. Verify the message reaches your N8N webhook

## Rollback Plan

If you need to revert:
1. The original code is still in place
2. Just add the `LOVABLE_API_KEY` to Supabase Edge Function secrets
3. The component will work with either approach

## Next Steps

1. Apply one of the options above
2. Test the mental health chat
3. Apply the same pattern to other failing chat components:
   - Physical wellness chat
   - Financial assistance chat
   - Legal chat
   - Universal specialist chat

All of these can use the same N8N backend with different context!

