# N8N Chatbot Integration - Quick Summary

## ✅ Integration Complete!

Your N8N chatbot webhook has been successfully integrated into your application.

### 🔗 Webhook Endpoint
```
https://onhighpaula.app.n8n.cloud/webhook/b45c0bc9-9473-4711-a928-4e37907625d9
```

## 📁 Files Created/Modified

### New Files Created:
1. ✅ `src/config/constants.ts` - Updated with N8N webhook URL
2. ✅ `src/services/n8nChatService.ts` - Service to communicate with N8N webhook
3. ✅ `src/hooks/useN8NChat.ts` - React hook for easy chatbot integration
4. ✅ `src/components/chat/N8NChatInterface.tsx` - Ready-to-use chat UI component
5. ✅ `src/pages/N8NChatTest.tsx` - Test page for the chatbot
6. ✅ `N8N_CHATBOT_INTEGRATION_GUIDE.md` - Complete documentation
7. ✅ `src/App.tsx` - Updated with new test route

## 🚀 Quick Start

### Test the Integration (Easiest Way):
1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/n8n-chat-test`
3. Type a message and send it
4. Open browser console (F12) to see the request/response logs

### Use in Your Components:
```typescript
import { useN8NChat } from '@/hooks/useN8NChat';

function MyComponent() {
  const { messages, isLoading, sendMessage, sessionId } = useN8NChat();

  return (
    <div>
      <h2>Session: {sessionId}</h2>
      {messages.map((msg, i) => (
        <div key={i}>{msg.role}: {msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>
        Send
      </button>
    </div>
  );
}
```

### Use the Pre-built Chat Component:
```typescript
import { N8NChatInterface } from '@/components/chat/N8NChatInterface';

function MyPage() {
  return <N8NChatInterface />;
}
```

## 📤 Request Format

Every POST request to the webhook includes:

```json
{
  "chatInput": "User's message",
  "message": "User's message",
  "sessionId": "auto-generated-uuid",
  "userId": "authenticated-user-id",
  "context": {
    "history": [/* conversation history */]
  },
  "metadata": {
    "timestamp": "ISO-8601-timestamp"
  }
}
```

**Required fields:**
- ✅ `chatInput` or `message` (string)
- ✅ `sessionId` (UUID - auto-generated if not provided)

**Optional fields:**
- `userId` - Automatically included if user is authenticated
- `context` - Conversation history and custom context
- `metadata` - Timestamps and other metadata

## 🔍 How It Works

1. **User sends message** → Component calls `sendMessage()`
2. **Hook generates sessionId** → Uses `crypto.randomUUID()` if not provided
3. **Service sends POST request** → To N8N webhook with proper format
4. **N8N processes** → Your workflow handles the request
5. **Response received** → Displayed in the chat UI

## 🎨 Components Available

### 1. Service (Low-level)
```typescript
import { n8nChatService } from '@/services/n8nChatService';

await n8nChatService.sendMessage({
  chatInput: 'Hello',
  sessionId: 'my-session-id'
});
```

### 2. Hook (Recommended)
```typescript
import { useN8NChat } from '@/hooks/useN8NChat';

const { messages, sendMessage, isLoading, sessionId } = useN8NChat();
```

### 3. Component (Easiest)
```typescript
import { N8NChatInterface } from '@/components/chat/N8NChatInterface';

<N8NChatInterface />
```

## 🐛 Debugging

Check browser console for these logs:
- `[N8NChatService] Sending to webhook:` - Shows request payload
- `[N8NChatService] Received response:` - Shows N8N response
- `[N8NChat] Message sent:` - Confirms message sent
- `[N8NChat] Response received:` - Confirms response received

## 📚 Full Documentation

For complete documentation, examples, and advanced usage:
👉 See `N8N_CHATBOT_INTEGRATION_GUIDE.md`

## 🧪 Testing Checklist

- [ ] Navigate to `/n8n-chat-test`
- [ ] Send a test message
- [ ] Check console logs for request/response
- [ ] Verify sessionId is generated
- [ ] Verify message appears in chat
- [ ] Verify N8N response appears
- [ ] Test multiple messages in same session
- [ ] Check N8N webhook logs

## ⚙️ Configuration

To change the webhook URL, edit:
```typescript
// src/config/constants.ts
export const N8N_CHATBOT_WEBHOOK_URL = 'your-new-webhook-url';
```

## 🔐 Security Notes

- Webhook URL is public (client-side)
- Implement rate limiting on N8N side
- User authentication is handled by your auth context
- SessionId helps track individual conversations

## 💡 Integration Tips

### Add to Existing Chat:
Replace your current chat logic with:
```typescript
const { messages, sendMessage, isLoading } = useN8NChat({
  sessionId: yourExistingSessionId, // Optional
  onMessageSent: (msg) => console.log('Sent:', msg),
  onResponseReceived: (res) => console.log('Received:', res),
});
```

### Custom Context:
```typescript
await sendMessage('Hello', {
  pillar: 'mental_health',
  language: 'pt-PT',
  customField: 'value'
});
```

## ✨ Next Steps

1. **Test**: Visit `/n8n-chat-test` and try the chatbot
2. **Integrate**: Add `useN8NChat` to your existing components
3. **Customize**: Adjust the UI to match your design
4. **Monitor**: Check N8N logs to ensure everything works

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify webhook URL is accessible
3. Test webhook with curl (see full guide)
4. Check N8N workflow execution logs

---

**Status**: ✅ Ready to use!
**Test URL**: `/n8n-chat-test`
**Last Updated**: 2025-11-05

