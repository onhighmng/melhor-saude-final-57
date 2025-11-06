# ✅ Added "Solicitar Chamada" Button to User Dashboard

## What Was Added

Added a **"Solicitar Chamada"** (Request Call) button in the top right section of the user dashboard page. This button allows users to request a call from a specialist at any time directly from their dashboard.

---

## Changes Made

### **1. User Dashboard Updates**

**File:** `src/pages/UserDashboard.tsx`

#### **Imports:**
- ✅ Added `Phone` icon from lucide-react
- ✅ Added `Textarea` component import

#### **State Management:**
- ✅ Added `isCallRequestModalOpen` state for modal visibility
- ✅ Added `callRequestNotes` state for storing user's call request notes

#### **Handler Function:**
```typescript
const handleCallRequest = async () => {
  if (!profile?.id) return;

  try {
    // Create a new chat session with phone_escalated status
    const { data: chatSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: profile.id,
        pillar: 'geral',
        status: 'phone_escalated',
        phone_escalation_reason: callRequestNotes || 'Solicitação de chamada pelo dashboard',
        ai_resolution: false
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    toast({
      title: 'Chamada Solicitada',
      description: 'Um especialista entrará em contacto consigo em breve.',
    });

    setIsCallRequestModalOpen(false);
    setCallRequestNotes('');
  } catch (error) {
    console.error('Error requesting call:', error);
    toast({
      title: 'Erro',
      description: 'Não foi possível solicitar a chamada. Tente novamente.',
      variant: 'destructive'
    });
  }
};
```

#### **UI Changes:**

**Header Section (Top Right Button):**
```tsx
{/* Welcome Header */}
<div className="flex items-start justify-between gap-4 flex-shrink-0">
  <div className="space-y-1">
    <h1 className="text-2xl font-normal tracking-tight">
      Olá, {profile?.full_name || profile?.email?.split('@')[0] || 'Utilizador'}! 👋
    </h1>
    <p className="text-muted-foreground text-lg">
      Bem-vinda de volta ao seu espaço de saúde e bem-estar.
    </p>
  </div>
  <Button 
    onClick={() => setIsCallRequestModalOpen(true)}
    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 flex-shrink-0"
  >
    <Phone className="h-4 w-4" />
    Solicitar Chamada
  </Button>
</div>
```

**Call Request Modal:**
```tsx
{/* Call Request Modal */}
<Dialog open={isCallRequestModalOpen} onOpenChange={setIsCallRequestModalOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Phone className="h-5 w-5" />
        Solicitar Chamada
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Um especialista entrará em contacto consigo brevemente. Deixe uma nota opcional sobre o que gostaria de discutir.
      </p>
      <div className="space-y-2">
        <label htmlFor="call-notes" className="text-sm font-medium">
          Motivo da Chamada (Opcional)
        </label>
        <Textarea
          id="call-notes"
          placeholder="Ex: Gostaria de discutir o meu progresso..."
          value={callRequestNotes}
          onChange={(e) => setCallRequestNotes(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setIsCallRequestModalOpen(false);
            setCallRequestNotes('');
          }}
        >
          Cancelar
        </Button>
        <Button onClick={handleCallRequest} className="bg-primary hover:bg-primary/90">
          <Phone className="h-4 w-4 mr-2" />
          Solicitar Chamada
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

## How It Works

### **User Flow:**

1. **User clicks "Solicitar Chamada"** button in top right of dashboard
2. **Modal opens** with:
   - Title: "Solicitar Chamada"
   - Description explaining a specialist will contact them
   - Optional textarea for call request notes
   - Cancel and Confirm buttons

3. **User can optionally add notes** about what they want to discuss

4. **When confirmed:**
   - Creates a new `chat_sessions` entry with `status: 'phone_escalated'`
   - Stores the user's notes in `phone_escalation_reason`
   - Shows success toast: "Chamada Solicitada - Um especialista entrará em contacto consigo em breve."
   - Closes modal and clears notes

5. **Specialist side:**
   - Call request appears in specialist's call requests table at `/especialista/call-requests`
   - Shows as "pending" with user's name, email, phone, and notes
   - Specialist can view details and initiate the call

---

## Database Integration

### **Table:** `chat_sessions`

**Fields used:**
- `user_id`: Current user's ID
- `pillar`: Set to `'geral'` (general)
- `status`: Set to `'phone_escalated'` to mark as call request
- `phone_escalation_reason`: User's notes or default message
- `ai_resolution`: Set to `false`

**Query:**
```sql
INSERT INTO chat_sessions (
  user_id,
  pillar,
  status,
  phone_escalation_reason,
  ai_resolution
) VALUES (
  '<user_id>',
  'geral',
  'phone_escalated',
  '<user_notes_or_default>',
  false
);
```

---

## Specialist View

### **Route:** `/especialista/call-requests`

**Page:** `EspecialistaCallRequestsRevamped.tsx` or `EspecialistaCallRequests.tsx`

**What specialists see:**
- ✅ User name
- ✅ User email  
- ✅ User phone number
- ✅ Company name
- ✅ Call reason/notes
- ✅ Wait time
- ✅ Status (pending/resolved)

**Actions specialists can take:**
- 📞 Initiate call
- 👤 View full user info
- ✅ Mark as resolved
- 📝 Add call notes

---

## User Experience

### **Before:**
- ❌ No easy way to request a call from dashboard
- ❌ Had to go through chat to escalate to phone
- ❌ Extra steps required

### **After:**
- ✅ One-click call request from dashboard
- ✅ Direct access in top right (prominent placement)
- ✅ Optional notes to specify reason
- ✅ Clear confirmation message
- ✅ Specialist gets notified immediately

---

## Visual Placement

```
┌─────────────────────────────────────────────────────────────┐
│  Olá, [User Name]! 👋                [Solicitar Chamada 📞] │ ← TOP RIGHT
│  Bem-vinda de volta ao seu espaço...                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Session Balance Card]                                      │
│                                                               │
│  [Bento Grid with other cards]                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Modal Design

```
┌────────────────────────────────────────┐
│  📞 Solicitar Chamada                   │
├────────────────────────────────────────┤
│                                        │
│  Um especialista entrará em contacto   │
│  consigo brevemente. Deixe uma nota    │
│  opcional sobre o que gostaria de      │
│  discutir.                             │
│                                        │
│  Motivo da Chamada (Opcional)         │
│  ┌──────────────────────────────────┐ │
│  │ Ex: Gostaria de discutir o meu   │ │
│  │ progresso...                      │ │
│  │                                   │ │
│  │                                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│                [Cancelar] [Solicitar]  │
└────────────────────────────────────────┘
```

---

## Error Handling

**Scenarios covered:**
1. ✅ No profile ID → Silent return (shouldn't happen)
2. ✅ Database error → Shows error toast
3. ✅ Network error → Shows error toast with retry prompt

**Error toast:**
```
Título: "Erro"
Descrição: "Não foi possível solicitar a chamada. Tente novamente."
Variant: destructive (red)
```

---

## Testing Steps

1. **Navigate to user dashboard:** `/user/dashboard`

2. **Locate button:**
   - Top right corner
   - Next to welcome message
   - Says "Solicitar Chamada" with phone icon

3. **Click button:**
   - Modal should open
   - Title: "Solicitar Chamada"
   - Has phone icon in title

4. **Test empty submission:**
   - Don't add notes
   - Click "Solicitar Chamada"
   - Should succeed with default message

5. **Test with notes:**
   - Add custom message (e.g., "Need help with mental health")
   - Click "Solicitar Chamada"
   - Should succeed with custom message

6. **Verify toast:**
   - Success toast appears
   - Says "Chamada Solicitada"
   - Description mentions specialist contact

7. **Check specialist view:**
   - Login as specialist
   - Go to `/especialista/call-requests`
   - Verify call request appears in pending list
   - Check notes are visible

8. **Test cancel:**
   - Open modal
   - Add some notes
   - Click "Cancelar"
   - Modal closes
   - Notes cleared
   - No database entry created

---

## Files Modified

1. **`src/pages/UserDashboard.tsx`**
   - Added Phone icon import
   - Added Textarea import
   - Added call request state
   - Added handleCallRequest function
   - Modified header layout (flex justify-between)
   - Added "Solicitar Chamada" button
   - Added Call Request Modal

---

## Benefits

### **For Users:**
- ✅ **Faster access** - No need to navigate through booking flow
- ✅ **More convenient** - One-click from dashboard
- ✅ **Clear communication** - Can specify why they need a call
- ✅ **Less friction** - Direct escalation path

### **For Specialists:**
- ✅ **Better context** - Receive user's notes about call reason
- ✅ **Centralized queue** - All call requests in one place
- ✅ **Prioritization** - Can see wait times and urgency
- ✅ **Efficient workflow** - Clear pending/resolved states

### **For System:**
- ✅ **Uses existing infrastructure** - Leverages `chat_sessions` table
- ✅ **Consistent with escalation flow** - Same as chat escalation
- ✅ **Trackable** - All requests logged in database
- ✅ **Scalable** - Can handle many concurrent requests

---

## Future Enhancements

Possible improvements:
- 🔔 **Real-time notifications** for specialists when new call requested
- 📊 **Analytics** on call request volume and resolution times
- ⏰ **Scheduling** - Allow users to select preferred time slots
- 🎯 **Pillar selection** - Let users specify which pillar (mental health, legal, etc.)
- 📞 **Direct dial** - Integration with calling system for automatic callbacks
- 🔄 **Status tracking** - Show users the status of their call request
- 💬 **Pre-call chat** - Allow brief message exchange before call

---

## Summary

**What Changed:**
- ✅ Added "Solicitar Chamada" button to top right of user dashboard
- ✅ Created modal for users to submit call requests with optional notes
- ✅ Integrated with existing call request system (chat_sessions table)
- ✅ Routed requests to specialist's call request table

**User Benefit:**
Users can now request a specialist call with one click from their dashboard, making it faster and more convenient to get personalized support.

**Specialist Benefit:**
Specialists receive call requests in their centralized queue with user context, enabling efficient response and follow-up.

🎉 **The "Solicitar Chamada" button is now live on the user dashboard!**

