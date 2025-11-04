# Meeting Link Flow: Creation → Update → User Access

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WHEN SESSION IS BOOKED                            │
└─────────────────────────────────────────────────────────────────────┘

BOOKING CREATION happens in multiple ways:

╔═══════════════════════════════════════════════════════════════════╗
║  Method 1: User Books Directly                                    ║
║  Location: src/components/booking/BookingFlow.tsx                 ║
╚═══════════════════════════════════════════════════════════════════╝

```typescript
// Lines 358-379 in BookingFlow.tsx
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    user_id: profile.id,
    prestador_id: selectedProvider.id,
    date: selectedDate,
    start_time: selectedTime,
    end_time: endTime,
    status: 'pending',
    meeting_type: meetingType,  // 'virtual', 'phone', or 'presencial'
    
    // AUTO-GENERATED MEETING LINK FOR VIRTUAL SESSIONS:
    meeting_link: meetingType === 'virtual' 
      ? `https://meet.example.com/${profile.id}-${new Date().getTime()}`
      : null,  // ← No link for phone/presencial
    
    booking_source: 'direct'
  });
```

Result: booking created with PLACEHOLDER meeting link

╔═══════════════════════════════════════════════════════════════════╗
║  Method 2: Admin Creates Booking                                  ║
║  Location: src/components/admin/providers/BookingModal.tsx        ║
╚═══════════════════════════════════════════════════════════════════╝

```typescript
// Lines 89-107 in BookingModal.tsx
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    user_id: selectedEmployee.user_id,
    prestador_id: provider.id,
    date: selectedDate,
    start_time: format(slot.date, 'HH:mm:ss'),
    status: 'scheduled',
    meeting_type: formData.sessionType === 'Virtual' ? 'online' : 'presencial',
    
    // NO MEETING LINK YET - Prestador will add it later
    meeting_link: null,  // ← NULL initially
    
    booking_source: 'admin_manual'
  });
```

Result: booking created WITHOUT meeting link

╔═══════════════════════════════════════════════════════════════════╗
║  Method 3: Especialista Assigns from Call Request                 ║
║  Location: src/components/admin/AdminMatchingTab.tsx              ║
╚═══════════════════════════════════════════════════════════════════╝

```typescript
// Lines 122-136 in AdminMatchingTab.tsx
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    user_id: chatSession.user_id,
    prestador_id: selectedSpecialist,
    date: selectedDate,
    start_time: '10:00',
    end_time: '11:00',
    pillar: chatSession.pillar,
    meeting_type: 'phone',
    status: 'scheduled',
    
    // NO MEETING LINK FOR PHONE SESSIONS
    meeting_link: null
  });
```

Result: booking created without link (phone session)

┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE STORAGE                              │
└─────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║                      bookings TABLE                                ║
╚═══════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│ AFTER Session Booked:                                           │
│ ────────────────────────────────────────────────────────────    │
│ id: "booking-123"                                               │
│ user_id: "user-456"                                             │
│ prestador_id: "prestador-789"                                   │
│ date: "2025-11-15"                                              │
│ start_time: "14:00:00"                                          │
│ end_time: "15:00:00"                                            │
│ status: "scheduled"                                             │
│ meeting_type: "virtual"                                         │
│ meeting_link: NULL                     ← TO BE UPDATED          │
│ created_at: "2025-11-02T10:00:00Z"                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              HOW PRESTADOR/ESPECIALISTA UPDATES LINK                 │
└─────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║  Option 1: Prestador Updates via Session Management Modal         ║
║  Location: src/components/sessions/ProviderSessionManagementModal ║
╚═══════════════════════════════════════════════════════════════════╝

STEP 1: Prestador views their sessions
📍 Page: /prestador/sessions
📄 File: src/pages/PrestadorSessions.tsx

```typescript
// Lines 66-74: Load sessions from database
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    *,
    profiles (name, email),
    companies (company_name)
  `)
  .eq('prestador_id', prestador.id)  // ← Only THEIR sessions
  .order('date', { ascending: false });
```

STEP 2: Prestador clicks on a session card

```
┌──────────────────────────────────────────────┐
│  📅 Sessão: 15 Nov 2025 às 14:00            │
│  👤 Cliente: João Silva                      │
│  🏢 Empresa: Acme Corp                       │
│  💻 Tipo: Virtual                            │
│                                              │
│  [Ver Detalhes] ← PRESTADOR CLICKS           │
└──────────────────────────────────────────────┘
```

STEP 3: Modal opens with meeting link input

```
┌────────────────────────────────────────────────────────┐
│  ProviderSessionManagementModal                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                        │
│  🧠 Saúde Mental                                      │
│                                                        │
│  📅 15 Nov 2025  ⏰ 14:00  👤 João Silva             │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ Link da Reunião                              │    │
│  │ ┌──────────────────────────────────────────┐ │    │
│  │ │ https://zoom.us/j/123456789              │ │    │
│  │ └──────────────────────────────────────────┘ │    │
│  │               ← PRESTADOR TYPES LINK        │    │
│  │                                              │    │
│  │ [💾 Guardar Link] ← THEN CLICKS             │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [Reagendar]  [Cancelar]  [Fechar]                   │
└────────────────────────────────────────────────────────┘
```

STEP 4: Code updates database

```typescript
// Lines 90-104 in ProviderSessionManagementModal.tsx
const handleSaveMeetingLink = () => {
  if (meetingLink.trim()) {
    onUpdateMeetingLink?.(session.id, meetingLink);  // ← Calls parent function
    toast({
      title: 'Link guardado',
      description: 'O link da reunião foi atualizado com sucesso.',
    });
  }
};

// Parent function in PrestadorSessions.tsx lines 214-222:
const handleUpdateMeetingLink = (sessionId: string, link: string) => {
  // Update local state
  setSessions(prev => prev.map(s => 
    s.id === sessionId ? { ...s, meetingLink: link } : s
  ));
  
  toast({
    title: "Link atualizado",
    description: "O link da reunião foi atualizado com sucesso."
  });
};
```

⚠️ NOTE: The current implementation updates LOCAL STATE only!
Need to also update DATABASE:

```typescript
// SHOULD ALSO DO:
await supabase
  .from('bookings')
  .update({ meeting_link: link })
  .eq('id', sessionId);
```

╔═══════════════════════════════════════════════════════════════════╗
║  Option 2: Especialista Updates via Case Management               ║
║  Location: src/components/admin/SpecialistLayout.tsx              ║
╚═══════════════════════════════════════════════════════════════════╝

STEP 1: Especialista views assigned cases
📍 Page: /especialista/dashboard or /admin/operations
📄 File: src/components/admin/SpecialistLayout.tsx

STEP 2: Especialista clicks on a case

STEP 3: Updates meeting link properly (WITH database update!)

```typescript
// Lines 129-149 in SpecialistLayout.tsx
const handleUpdateMeetingLink = async (caseId: string, link: string) => {
  try {
    // ✅ CORRECT: Updates database directly
    const { error } = await supabase
      .from('bookings')
      .update({ meeting_link: link })
      .eq('id', caseId);

    if (error) throw error;

    toast({
      title: "Link atualizado",
      description: "O link da reunião foi atualizado com sucesso."
    });
  } catch (error) {
    toast({
      title: "Erro",
      description: error.message || "Erro ao atualizar link",
      variant: "destructive"
    });
  }
};
```

This version CORRECTLY updates the database!

┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE AFTER UPDATE                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ UPDATED bookings record:                                        │
│ ────────────────────────────────────────────────────────────    │
│ id: "booking-123"                                               │
│ user_id: "user-456"                                             │
│ prestador_id: "prestador-789"                                   │
│ date: "2025-11-15"                                              │
│ start_time: "14:00:00"                                          │
│ meeting_type: "virtual"                                         │
│ meeting_link: "https://zoom.us/j/123456789"  ← ✅ UPDATED!     │
│ updated_at: "2025-11-02T11:30:00Z"                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    HOW USER SEES THE LINK                            │
└─────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║  Location 1: User Sessions Page                                   ║
║  Route: /user/sessions                                            ║
║  File: src/pages/UserSessions.tsx                                ║
╚═══════════════════════════════════════════════════════════════════╝

STEP 1: User navigates to "Meu percurso" (My Journey)

STEP 2: System loads their bookings

```typescript
// UserSessions.tsx loads bookings
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    *,
    prestadores (
      user_id,
      profiles (name, avatar_url)
    )
  `)
  .eq('user_id', profile.id)  // ← Only THEIR bookings
  .order('date', { ascending: false });
```

STEP 3: User sees their session card

╔═══════════════════════════════════════════════════════════════════╗
║  Component: SessionHistoryCard                                    ║
║  File: src/components/sessions/SessionHistoryCard.tsx             ║
╚═══════════════════════════════════════════════════════════════════╝

```
┌──────────────────────────────────────────────────────────┐
│  📅 15 Nov 2025 às 14:00                                 │
│  🧠 Saúde Mental                                         │
│  👨‍⚕️ Dr. Pedro Santos                                   │
│                                                          │
│  ⚠️ TIMING RULES FOR SHOWING LINK:                       │
│                                                          │
│  IF session is MORE than 5 minutes away:                │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ⏰ Link em preparação                            │  │
│  │ O link estará disponível 5 minutos antes        │  │
│  │ da sessão começar                                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  IF session is WITHIN 5 minutes:                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ✅ Link da Reunião Disponível                    │  │
│  │ Zoom Meeting                                     │  │
│  │                                                   │  │
│  │ [🔗 Entrar na Reunião] ← USER CLICKS            │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

Code that controls this:

```typescript
// Lines 158-176 in SessionHistoryCard.tsx

// Calculate if within 5 minutes of session
const sessionDateTime = new Date(`${session.date} ${session.time}`);
const now = new Date();
const minutesUntil = (sessionDateTime.getTime() - now.getTime()) / 1000 / 60;
const showMeetingLink = minutesUntil <= 5 && minutesUntil >= -60;

// Only show if within 5 minutes AND link exists
{showMeetingLink && session.meetingLink && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-blue-800">
          Link da Reunião Disponível
        </p>
        <p className="text-xs text-blue-600">
          {getMeetingPlatformDisplay(session.meetingPlatform)}
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => window.open(session.meetingLink, '_blank')}
        className="gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        Entrar na Reunião
      </Button>
    </div>
  </div>
)}
```

╔═══════════════════════════════════════════════════════════════════╗
║  Location 2: Meeting Info Card (Alternative Display)              ║
║  Component: src/components/ui/meeting-info-card.tsx               ║
╚═══════════════════════════════════════════════════════════════════╝

```typescript
// Lines 100-138 in meeting-info-card.tsx

{/* User View - Meeting Link */}
{userRole === 'user' && (
  <div className="space-y-3">
    {linkWasSent && session.meetingLink ? (
      // ✅ LINK IS AVAILABLE
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-700">
            Link da sessão disponível
          </span>
        </div>
        <Button asChild className="w-full">
          <a 
            href={session.meetingLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Entrar na Sessão ({platformLabel})
          </a>
        </Button>
      </div>
    ) : isUpcoming ? (
      // ⏰ WAITING FOR LINK
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-700">
            Link em preparação
          </span>
        </div>
        <p className="text-sm text-blue-600">{timeUntilLink}</p>
        {isToday && (
          <p className="text-xs text-blue-500 mt-1">
            Receberá uma notificação quando o link estiver disponível
          </p>
        )}
      </div>
    ) : (
      // 📅 SESSION ALREADY HAPPENED
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">Sessão já realizada</p>
      </div>
    )}
  </div>
)}
```

┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE FLOW SUMMARY                             │
└─────────────────────────────────────────────────────────────────────┘

1️⃣ SESSION IS BOOKED
   ├─ User books via BookingFlow
   ├─ Admin creates via BookingModal  
   ├─ Especialista assigns via AdminMatchingTab
   └─ Creates record in bookings table
      meeting_link = NULL (or placeholder)

2️⃣ PRESTADOR/ESPECIALISTA UPDATES LINK
   
   METHOD A (Prestador):
   └─ Opens /prestador/sessions
      └─ Clicks on session
         └─ ProviderSessionManagementModal opens
            └─ Types meeting link
               └─ Clicks "Guardar Link"
                  └─ ⚠️ Updates local state only (needs fix)

   METHOD B (Especialista):
   └─ Opens /especialista/dashboard or /admin/operations
      └─ Clicks on case
         └─ Case management modal opens
            └─ Types meeting link
               └─ Clicks "Guardar Link"
                  └─ ✅ Updates database correctly:
                     UPDATE bookings 
                     SET meeting_link = 'https://zoom.us/...'
                     WHERE id = booking_id;

3️⃣ USER VIEWS LINK
   
   LOCATION: /user/sessions
   COMPONENT: SessionHistoryCard
   
   TIMING RULES:
   ├─ MORE than 5 minutes before session:
   │  └─ Shows: "Link em preparação" (Link in preparation)
   │
   ├─ WITHIN 5 minutes of session:
   │  └─ Shows: "Link da Reunião Disponível" with [Entrar na Reunião] button
   │     └─ User clicks → Opens meeting_link in new tab
   │
   └─ AFTER session ended:
      └─ Shows: "Sessão já realizada"

┌─────────────────────────────────────────────────────────────────────┐
│                    KEY DATABASE COLUMNS                              │
└─────────────────────────────────────────────────────────────────────┘

bookings TABLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Column        │ Type │ Purpose                                    │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ meeting_link  │ TEXT │ ← The actual meeting URL                  │
│ meeting_type  │ TEXT │ ← 'virtual', 'phone', or 'presencial'     │
│ date          │ DATE │ ← Session date                            │
│ start_time    │ TIME │ ← Session start time                      │
│ end_time      │ TIME │ ← Session end time                        │
│ status        │ TEXT │ ← 'scheduled', 'completed', 'cancelled'   │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────┐
│                    ANSWER TO YOUR QUESTION                           │
└─────────────────────────────────────────────────────────────────────┘

❓ "When a session is booked and the prestador/especialista wants to 
    send the meeting link, how is it done and how does the user see it?"

✅ ANSWER:

1. HOW IT'S DONE (Prestador/Especialista sends link):

   PRESTADOR:
   📍 Goes to /prestador/sessions
   📄 Opens ProviderSessionManagementModal
   ⌨️  Types meeting link (Zoom, Google Meet, etc.)
   💾 Clicks "Guardar Link"
   ⚠️  Currently updates local state only (needs database update)

   ESPECIALISTA:
   📍 Goes to /especialista/dashboard or /admin/operations
   📄 Opens case management modal
   ⌨️  Types meeting link
   💾 Clicks "Guardar Link"
   ✅ Correctly updates database: bookings.meeting_link

2. HOW USER SEES IT:

   📍 Goes to /user/sessions (Meu percurso)
   📄 SessionHistoryCard component shows session
   
   TIMING:
   ⏰ More than 5 min before: "Link em preparação"
   ✅ Within 5 min: Shows button "Entrar na Reunião"
      User clicks → Opens meeting link in new tab
   📅 After session: "Sessão já realizada"

3. DATABASE STORAGE:

   ```sql
   UPDATE bookings
   SET meeting_link = 'https://zoom.us/j/123456789'
   WHERE id = 'booking-123';
   ```

┌─────────────────────────────────────────────────────────────────────┐
│                    🐛 ISSUE FOUND                                    │
└─────────────────────────────────────────────────────────────────────┘

⚠️ PROBLEM: PrestadorSessions.tsx handleUpdateMeetingLink() only 
            updates LOCAL STATE, not DATABASE!

Current code (lines 214-222):
```typescript
const handleUpdateMeetingLink = (sessionId: string, link: string) => {
  setSessions(prev => prev.map(s => 
    s.id === sessionId ? { ...s, meetingLink: link } : s
  ));
  // ❌ MISSING DATABASE UPDATE!
};
```

✅ FIX NEEDED:
```typescript
const handleUpdateMeetingLink = async (sessionId: string, link: string) => {
  try {
    // ✅ UPDATE DATABASE
    const { error } = await supabase
      .from('bookings')
      .update({ meeting_link: link })
      .eq('id', sessionId);
    
    if (error) throw error;
    
    // Then update local state
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, meetingLink: link } : s
    ));
    
    toast({
      title: "Link atualizado",
      description: "O link da reunião foi atualizado com sucesso."
    });
  } catch (error) {
    toast({
      title: "Erro",
      description: "Erro ao atualizar link",
      variant: "destructive"
    });
  }
};
```

┌─────────────────────────────────────────────────────────────────────┐
│                    TESTING THIS FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

To test:

1. Login as PRESTADOR
2. Go to /prestador/sessions
3. Click on a future session
4. Enter meeting link (e.g., https://zoom.us/j/123456789)
5. Click "Guardar Link"

6. Login as USER (the session participant)
7. Go to /user/sessions
8. Find the session
9. If within 5 minutes: Should see "Entrar na Reunião" button
10. Click it → Opens meeting link in new tab

To verify in database:
```sql
SELECT id, user_id, prestador_id, date, start_time, 
       meeting_type, meeting_link, status
FROM bookings
WHERE id = 'your-booking-id';
```





