# Call Request Flow: User → Database → Especialista Geral

## 📱 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER SIDE                                   │
└─────────────────────────────────────────────────────────────────────┘

1. USER CLICKS "Ligar Agora" (Call Now)
   📍 Location: src/components/booking/SpecialistContactCard.tsx
   
   ┌─────────────────────────────────────────────────────────┐
   │  SpecialistContactCard Component                        │
   │  ┌───────────────────────────────────────────────┐     │
   │  │  [Consulta Telefónica Detalhada]              │     │
   │  │                                                │     │
   │  │  Context: "User needs urgent help..."         │     │
   │  │                                                │     │
   │  │  ┌─────────────────────────────────┐          │     │
   │  │  │ 📞 +351 123 456 789             │          │     │
   │  │  │ [🔵 Ligar Agora] ← USER CLICKS  │          │     │
   │  │  └─────────────────────────────────┘          │     │
   │  └───────────────────────────────────────────────┘     │
   └─────────────────────────────────────────────────────────┘

   ↓↓↓ WHAT HAPPENS IN THE CODE ↓↓↓

```typescript
// Lines 18-31 in SpecialistContactCard.tsx
const handleCallClick = async () => {
  // 1. Update chat_sessions table
  await supabase.from('chat_sessions').update({
    status: 'phone_escalated',              // ← Changes status
    phone_escalation_reason: context        // ← Saves reason
  }).eq('id', sessionId);

  // 2. Create specialist_call_logs entry
  await supabase.from('specialist_call_logs').insert({
    chat_session_id: sessionId,
    user_id: user.id,
    call_status: 'pending'                  // ← Creates pending call
  });

  // 3. Open phone dialer
  window.location.href = `tel:${phoneNumber}`;
};
```

┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE TABLES                               │
└─────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║                      chat_sessions TABLE                           ║
╚═══════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│ BEFORE User Clicks:                                             │
│ ────────────────────────────────────────────────────────────    │
│ id: "abc-123"                                                   │
│ user_id: "user-456"                                             │
│ pillar: "saude_mental"                                          │
│ status: "active"                ← Normal active chat            │
│ phone_escalation_reason: NULL   ← No escalation yet            │
│ phone_contact_made: false       ← No call yet                  │
│ session_booked_by_specialist: NULL                             │
└─────────────────────────────────────────────────────────────────┘

                              ↓↓↓
                       USER CLICKS BUTTON
                              ↓↓↓

┌─────────────────────────────────────────────────────────────────┐
│ AFTER User Clicks:                                              │
│ ────────────────────────────────────────────────────────────    │
│ id: "abc-123"                                                   │
│ user_id: "user-456"                                             │
│ pillar: "saude_mental"                                          │
│ status: "phone_escalated"       ← ✅ CHANGED!                  │
│ phone_escalation_reason: "User needs urgent help..."  ← ✅ SET!│
│ phone_contact_made: false       ← Still false until specialist │
│ session_booked_by_specialist: NULL                             │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║                  specialist_call_logs TABLE                        ║
╚═══════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│ NEW RECORD CREATED:                                             │
│ ────────────────────────────────────────────────────────────    │
│ id: "log-789"                                                   │
│ chat_session_id: "abc-123"      ← Links to chat session        │
│ user_id: "user-456"                                             │
│ specialist_id: NULL             ← Not assigned yet             │
│ call_status: "pending"          ← ✅ PENDING CALL!             │
│ outcome: NULL                                                   │
│ notes: NULL                                                     │
│ created_at: NOW()                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    ESPECIALISTA GERAL SIDE                           │
└─────────────────────────────────────────────────────────────────────┘

🔍 HOW ESPECIALISTA GERAL SEES IT:

1. useEscalatedChats Hook queries database
   📍 Location: src/hooks/useEscalatedChats.ts

```typescript
// Lines 14-18 in useEscalatedChats.ts
const { data: sessions, error } = await supabase
  .from('chat_sessions')
  .select('*')
  .not('phone_escalation_reason', 'is', null)  // ← FINDS ALL ESCALATED CHATS
  .order('created_at', { ascending: false });
```

   ⚠️ KEY QUERY: Gets ALL chat_sessions WHERE phone_escalation_reason IS NOT NULL

2. Data flows to these pages:
   ✅ EspecialistaCallRequests.tsx (Main call requests page)
   ✅ EspecialistaCallRequestsRevamped.tsx (Revamped version)
   ✅ SpecialistDashboard.tsx (Dashboard with call requests widget)

┌─────────────────────────────────────────────────────────────────────┐
│  ESPECIALISTA GERAL SEES THIS SCREEN:                                │
│  📍 Location: src/pages/EspecialistaCallRequests.tsx                │
│                                                                      │
│  ┌────────────────────────────────────────────────────┐            │
│  │ 📞 Pedidos de Chamada Pendentes                    │            │
│  │                                                     │            │
│  │ ┌──────────────────────────────────────────────┐   │            │
│  │ │ 👤 João Silva                                │   │            │
│  │ │ 🏢 Acme Corp                                 │   │            │
│  │ │ 🧠 Saúde Mental                              │   │            │
│  │ │                                              │   │            │
│  │ │ Email: joao@acme.com                         │   │            │
│  │ │ Telefone: +351 912 345 678                   │   │            │
│  │ │                                              │   │            │
│  │ │ Reason: "User needs urgent help..."          │   │            │
│  │ │                                              │   │            │
│  │ │ [✅ Iniciar Chamada] [❌ Rejeitar]           │   │            │
│  │ └──────────────────────────────────────────────┘   │            │
│  │                                                     │            │
│  │ ⏱️ Tempo de espera: 15 minutos                     │            │
│  └────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘

3. WHAT ESPECIALISTA SEES IN THE DATA:

```typescript
// Lines 56-77 in useEscalatedChats.ts
const enrichedChats: EscalatedChat[] = sessions.map(session => ({
  id: session.id,
  user_name: "João Silva",                    // ← From profiles table
  user_email: "joao@acme.com",                // ← From profiles table
  pillar: "saude_mental",                     // ← From chat_sessions
  status: "escalated",                        // ← phone_escalated status
  phone_escalation_reason: "User needs...",   // ← THE REASON USER GAVE
  created_at: "2025-11-02T10:30:00Z",        // ← When escalated
  messages: [...],                            // ← Full chat history
  call_log: {...}                             // ← Call log entry
}));
```

┌─────────────────────────────────────────────────────────────────────┐
│                    WHERE IT APPEARS (PAGES)                          │
└─────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║  Page 1: EspecialistaCallRequests.tsx                             ║
║  Route: /especialista/call-requests                               ║
╚═══════════════════════════════════════════════════════════════════╝

Shows:
✅ List of all pending call requests
✅ User name, email, phone
✅ Company name
✅ Pillar (mental, physical, financial, legal)
✅ Escalation reason
✅ Wait time
✅ Button to start call
✅ Button to resolve/reject

╔═══════════════════════════════════════════════════════════════════╗
║  Page 2: EspecialistaCallRequestsRevamped.tsx                     ║
║  Route: /especialista/call-requests-revamped                      ║
╚═══════════════════════════════════════════════════════════════════╝

Shows (Enhanced):
✅ Same as above PLUS
✅ Tabs for Pending vs Resolved
✅ Sort by wait time
✅ Success animations when resolved
✅ Detailed user info modal

╔═══════════════════════════════════════════════════════════════════╗
║  Page 3: SpecialistDashboard.tsx                                  ║
║  Route: /especialista/dashboard                                   ║
╚═══════════════════════════════════════════════════════════════════╝

Shows (Widget):
✅ Count of pending escalated chats
✅ Quick view of recent escalations
✅ Link to full call requests page

┌─────────────────────────────────────────────────────────────────────┐
│                    SUMMARY: THE COMPLETE FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   User clicks "Ligar Agora" button
   → src/components/booking/SpecialistContactCard.tsx

2. DATABASE UPDATE
   Two tables get updated:
   
   a) chat_sessions:
      - status → 'phone_escalated'
      - phone_escalation_reason → 'User needs urgent help...'
   
   b) specialist_call_logs:
      - New record with call_status = 'pending'

3. QUERY THAT FINDS IT
   useEscalatedChats hook runs:
   ```sql
   SELECT * FROM chat_sessions
   WHERE phone_escalation_reason IS NOT NULL
   ORDER BY created_at DESC;
   ```

4. APPEARS ON SCREEN
   Especialista Geral sees it in:
   - Main page: /especialista/call-requests
   - Revamped: /especialista/call-requests-revamped
   - Dashboard widget: /especialista/dashboard

5. ESPECIALISTA CAN THEN:
   ✅ View full chat history
   ✅ See user contact info
   ✅ Start the call
   ✅ Log call outcome
   ✅ Book a session if needed
   ✅ Mark as resolved

┌─────────────────────────────────────────────────────────────────────┐
│                    KEY DATABASE COLUMNS                              │
└─────────────────────────────────────────────────────────────────────┘

chat_sessions TABLE (Critical columns):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Column                        │ Purpose                          │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ phone_escalation_reason       │ ← WHY user requested call       │
│ phone_contact_made            │ ← Has specialist called yet?    │
│ status                        │ ← 'phone_escalated' = pending   │
│ session_booked_by_specialist  │ ← Did specialist book session?  │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

specialist_call_logs TABLE (Tracking):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Column                        │ Purpose                          │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ chat_session_id               │ ← Links to chat_sessions        │
│ call_status                   │ ← 'pending', 'completed'        │
│ outcome                       │ ← 'resolved', 'session_booked'  │
│ notes                         │ ← Specialist's notes            │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME UPDATES                                 │
└─────────────────────────────────────────────────────────────────────┘

The system uses Supabase real-time subscriptions:

```typescript
// Lines 95-108 in useEscalatedChats.ts
const channel = supabase
  .channel('escalated-chats')
  .on('postgres_changes', {
    event: '*',                     // ← Listens for ALL changes
    schema: 'public',
    table: 'chat_sessions',
  }, () => {
    fetchEscalatedChats();          // ← Refreshes data automatically
  })
  .subscribe();
```

This means:
✅ Especialista Geral's screen updates AUTOMATICALLY
✅ No need to refresh the page
✅ New call requests appear instantly
✅ Status changes update in real-time

┌─────────────────────────────────────────────────────────────────────┐
│                    ANSWER TO YOUR QUESTION                           │
└─────────────────────────────────────────────────────────────────────┘

❓ "When I click 'Solicitar chamada', where does it appear in the 
   Especialista Geral?"

✅ ANSWER:

1. DATABASE: It gets stored in chat_sessions table with:
   - phone_escalation_reason = "your message"
   - status = "phone_escalated"

2. FRONTEND: It appears in Especialista Geral's screens:
   
   PRIMARY PAGE:
   📍 /especialista/call-requests
   📄 EspecialistaCallRequests.tsx
   
   ALTERNATIVE PAGE:
   📍 /especialista/call-requests-revamped  
   📄 EspecialistaCallRequestsRevamped.tsx
   
   DASHBOARD WIDGET:
   📍 /especialista/dashboard
   📄 SpecialistDashboard.tsx (shows count + quick view)

3. HOW TO FIND IT:
   The useEscalatedChats hook queries:
   ```sql
   SELECT * FROM chat_sessions
   WHERE phone_escalation_reason IS NOT NULL
   ```
   
   Any chat_sessions record with a phone_escalation_reason value
   will appear in Especialista Geral's call request list!

┌─────────────────────────────────────────────────────────────────────┐
│                    TESTING THIS FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

To test this yourself:

1. Login as a USER
2. Start a chat (UniversalAIChat component)
3. Wait for SpecialistContactCard to appear
4. Click "Ligar Agora" button

5. Then login as ESPECIALISTA GERAL
6. Navigate to /especialista/call-requests
7. You should see your call request appear!

To verify in database:
```sql
-- Check chat_sessions table
SELECT id, user_id, status, phone_escalation_reason, created_at
FROM chat_sessions
WHERE phone_escalation_reason IS NOT NULL
ORDER BY created_at DESC;

-- Check specialist_call_logs table
SELECT id, chat_session_id, call_status, created_at
FROM specialist_call_logs
WHERE call_status = 'pending'
ORDER BY created_at DESC;
```





