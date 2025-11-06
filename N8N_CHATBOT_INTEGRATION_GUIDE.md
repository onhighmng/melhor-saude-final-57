# N8N Chatbot Integration Guide

## Overview

Your application is now integrated with the N8N chatbot webhook endpoint. The integration sends POST requests to the webhook with user messages and receives AI-powered responses.

## Webhook Endpoint

```
https://onhighpaula.app.n8n.cloud/webhook/b45c0bc9-9473-4711-a928-4e37907625d9
```

## Request Format

Each request sent to the webhook includes:

```json
{
  "chatInput": "User's message text",
  "message": "User's message text",
  "sessionId": "unique-uuid-per-session",
  "userId": "optional-user-id",
  "context": {
    "history": [
      {
        "role": "user",
        "content": "Previous message",
        "timestamp": 1699999999999
      }
    ]
  },
  "metadata": {
    "timestamp": "2025-11-05T12:00:00.000Z"
  }
}
```

### Required Fields

- **`chatInput`** or **`message`**: The user's message (string)
- **`sessionId`**: A unique UUID for the conversation session (string)

### Optional Fields

- **`userId`**: The authenticated user's ID
- **`context`**: Additional context including conversation history
- **`metadata`**: Additional metadata like timestamps

## Implementation Files

### 1. Configuration (`src/config/constants.ts`)

The webhook URL is stored as a constant:

```typescript
export const N8N_CHATBOT_WEBHOOK_URL = 'https://onhighpaula.app.n8n.cloud/webhook/b45c0bc9-9473-4711-a928-4e37907625d9';
```

### 2. Service (`src/services/n8nChatService.ts`)

The service handles communication with the N8N webhook:

```typescript
import { n8nChatService } from '@/services/n8nChatService';

// Send a simple message
const response = await n8nChatService.sendMessage({
  chatInput: 'Hello, how are you?',
  sessionId: 'your-session-id'
});

// Send a message with history
const response = await n8nChatService.sendMessageWithHistory(
  'What did I just ask?',
  conversationHistory,
  sessionId,
  userId,
  { additionalContext: 'value' }
);
```

### 3. React Hook (`src/hooks/useN8NChat.ts`)

A React hook that simplifies chatbot integration in components:

```typescript
import { useN8NChat } from '@/hooks/useN8NChat';

function MyChatComponent() {
  const { sessionId, messages, isLoading, sendMessage } = useN8NChat();

  const handleSend = async () => {
    await sendMessage('Hello chatbot!');
  };

  return (
    <div>
      <div>Session: {sessionId}</div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
      <button onClick={handleSend} disabled={isLoading}>
        Send
      </button>
    </div>
  );
}
```

### 4. Chat Interface Component (`src/components/chat/N8NChatInterface.tsx`)

A ready-to-use chat UI component:

```typescript
import { N8NChatInterface } from '@/components/chat/N8NChatInterface';

function MyPage() {
  return (
    <N8NChatInterface
      sessionId="optional-session-id"
      additionalContext={{ topic: 'health' }}
      onClose={() => console.log('Chat closed')}
    />
  );
}
```

## Usage Examples

### Example 1: Simple Chat

```typescript
import { useN8NChat } from '@/hooks/useN8NChat';

function SimpleChat() {
  const { messages, isLoading, sendMessage } = useN8NChat();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    await sendMessage(input);
    setInput('');
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSend} disabled={isLoading}>
        Send
      </button>
    </div>
  );
}
```

### Example 2: Chat with Custom Session ID

```typescript
import { useN8NChat } from '@/hooks/useN8NChat';

function ChatWithCustomSession() {
  const { messages, sendMessage } = useN8NChat({
    sessionId: 'my-custom-session-id',
    onMessageSent: (msg) => console.log('Sent:', msg),
    onResponseReceived: (res) => console.log('Received:', res),
    onError: (err) => console.error('Error:', err),
  });

  return <div>{/* Your chat UI */}</div>;
}
```

### Example 3: Using the Service Directly

```typescript
import { n8nChatService } from '@/services/n8nChatService';

async function sendDirectMessage() {
  const response = await n8nChatService.sendMessage({
    chatInput: 'Tell me about mental health',
    sessionId: crypto.randomUUID(),
    userId: 'user-123',
    context: {
      topic: 'mental_health',
      language: 'pt-PT',
    },
  });

  if (response.success) {
    console.log('Bot response:', response.message);
  } else {
    console.error('Error:', response.error);
  }
}
```

## Session Management

Sessions are automatically managed:

- **Auto-generated**: If no `sessionId` is provided, one is generated automatically using `crypto.randomUUID()`
- **Persistent**: The same `sessionId` is used throughout the lifetime of the hook instance
- **Custom**: You can provide your own `sessionId` for custom session management

```typescript
// Auto-generated session (new UUID each time component mounts)
const chat1 = useN8NChat();

// Custom session (persists across remounts if stored)
const chat2 = useN8NChat({ sessionId: 'my-custom-session' });
```

## Response Handling

The N8N webhook response is parsed flexibly:

```typescript
// The service looks for these response fields (in order):
// 1. data.message
// 2. data.response
// 3. data.output
// 4. data.text
// 5. Fallback: 'No response from chatbot'
```

## Error Handling

Errors are handled gracefully:

```typescript
const { error, sendMessage } = useN8NChat({
  onError: (err) => {
    // Custom error handling
    console.error('Chat error:', err);
  },
});

// Error state is also available
if (error) {
  console.log('Last error:', error.message);
}
```

## Testing

To test the integration:

1. Start your development server: `npm run dev`
2. Navigate to the chat interface
3. Send a test message
4. Check the browser console for logs:
   - `[N8NChatService] Sending to webhook:` - Request payload
   - `[N8NChatService] Received response:` - Response data

## Changing the Webhook URL

To update the webhook URL:

1. **Option A**: Update `src/config/constants.ts`:
   ```typescript
   export const N8N_CHATBOT_WEBHOOK_URL = 'https://your-new-webhook-url';
   ```

2. **Option B**: Update at runtime (for testing):
   ```typescript
   import { n8nChatService } from '@/services/n8nChatService';
   n8nChatService.setWebhookUrl('https://your-new-webhook-url');
   ```

## Debugging

Enable console logs to debug:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for logs prefixed with:
   - `[N8NChatService]` - Service-level logs
   - `[N8NChat]` - Component-level logs

## Integration with Existing Chats

To integrate with your existing chat components:

1. Import the hook: `import { useN8NChat } from '@/hooks/useN8NChat';`
2. Replace your existing chat logic with `useN8NChat`
3. Update the UI to use the returned `messages` and `sendMessage`

Example integration with `UniversalAIChat`:

```typescript
// Instead of the current Supabase function invoke
const { messages, sendMessage } = useN8NChat({
  sessionId: sessionId,
});

// Replace your handleSend function
const handleSend = async () => {
  await sendMessage(input);
  setInput('');
};
```

## Security Considerations

- The webhook URL is public (client-side)
- Implement rate limiting on the N8N side
- Consider adding authentication tokens if needed
- User IDs are sent but optional
- Session IDs help track conversations

## Next Steps

1. Test the integration using the provided components
2. Customize the UI to match your design system
3. Add additional context fields as needed
4. Monitor N8N webhook logs for debugging
5. Implement error tracking/monitoring

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify the webhook URL is accessible
3. Test the webhook directly using curl or Postman
4. Review N8N workflow logs

## Example Test Request (curl)

```bash
curl -X POST https://onhighpaula.app.n8n.cloud/webhook/b45c0bc9-9473-4711-a928-4e37907625d9 \
  -H "Content-Type: application/json" \
  -d '{
    "chatInput": "Hello, how can you help me?",
    "sessionId": "test-session-123",
    "userId": "test-user"
  }'
```

