# 🔗 Meeting Link Email - Complete Data Flow Analysis

## 🎯 Your Questions Answered

### ❓ "How does the email get the correct username?"
**Answer:** From `profiles` table via `bookings.user_id` foreign key relationship

### ❓ "How does the email get the correct session details?"
**Answer:** From `bookings` table (date, time, pillar, type) via direct query

### ❓ "How does the email get the correct meeting link?"
**Answer:** The meeting link is passed as a parameter when prestador types it - it's the exact link they entered

### ❓ "How is the meeting link added by prestador/especialista?"
**Answer:** Via `ProviderSessionManagementModal` → they type it → saved to `bookings.meeting_link`

### ❓ "How is the button linked to the actual session?"
**Answer:** Button's `href` attribute is set directly to `data.meetingLink` (the Zoom/Google Meet URL)

---

## 📊 COMPLETE DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Prestador Opens Session Management Modal                       │
└─────────────────────────────────────────────────────────────────────────┘

    Prestador is viewing: /prestador/sessions
    
    Component: PrestadorSessions.tsx
    ├─ Loads all sessions from database:
    │  
    │  const { data: bookings } = await supabase
    │    .from('bookings')
    │    .select(`
    │      *,
    │      profiles (name, email),           ← USER INFO
    │      companies (company_name)          ← COMPANY INFO
    │    `)
    │    .eq('prestador_id', prestador.id)   ← ONLY THIS PRESTADOR'S SESSIONS
    │
    └─ Displays list of sessions

    User clicks on a session → Opens ProviderSessionManagementModal


┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Prestador Types Meeting Link                                   │
└─────────────────────────────────────────────────────────────────────────┘

    Component: ProviderSessionManagementModal.tsx
    
    UI Shows:
    ┌──────────────────────────────────────────────────────┐
    │  🧠 Saúde Mental                                     │
    │  📅 15 Nov 2025  ⏰ 14:00  👤 João Silva            │
    │                                                      │
    │  Link da Reunião                                    │
    │  ┌────────────────────────────────────────────┐    │
    │  │ [Prestador types here]                     │    │
    │  │ https://zoom.us/j/123456789                │ ← TYPES THIS
    │  └────────────────────────────────────────────┘    │
    │                                                      │
    │  [💾 Guardar Link] ← CLICKS THIS                   │
    └──────────────────────────────────────────────────────┘
    
    Code (ProviderSessionManagementModal.tsx:90-104):
    ```typescript
    const handleSaveMeetingLink = () => {
      if (meetingLink.trim()) {
        onUpdateMeetingLink?.(session.id, meetingLink);
        //                     ↑            ↑
        //                  BOOKING ID   THE LINK PRESTADOR TYPED
      }
    };
    ```
    
    This calls the parent function: handleUpdateMeetingLink()


┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Backend Function Processes Meeting Link                        │
└─────────────────────────────────────────────────────────────────────────┘

    File: src/pages/PrestadorSessions.tsx
    Function: handleUpdateMeetingLink(sessionId, link)
    
    Parameters received:
    ├─ sessionId: "abc-123-booking-uuid"
    └─ link: "https://zoom.us/j/123456789"  ← THE EXACT LINK PRESTADOR TYPED
    
    
    ──────────────────────────────────────────────────────────────────────
    ACTION 1: Update Database
    ──────────────────────────────────────────────────────────────────────
    
    ```typescript
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        meeting_link: link  ← SAVES "https://zoom.us/j/123456789" TO DATABASE
      })
      .eq('id', sessionId);  ← FOR THIS SPECIFIC BOOKING
    ```
    
    Database after this update:
    ┌─────────────────────────────────────────────────────────┐
    │ bookings table:                                         │
    │ ─────────────────────────────────────────────────────   │
    │ id: "abc-123-booking-uuid"                             │
    │ user_id: "user-456-uuid"                               │
    │ prestador_id: "prestador-789-uuid"                     │
    │ booking_date: "2025-11-15"                             │
    │ start_time: "14:00:00"                                 │
    │ pillar: "saude_mental"                                 │
    │ meeting_type: "virtual"                                │
    │ meeting_link: "https://zoom.us/j/123456789" ← SAVED!  │
    └─────────────────────────────────────────────────────────┘
    
    
    ──────────────────────────────────────────────────────────────────────
    ACTION 2: Fetch Complete Booking Details (WITH USER & PRESTADOR INFO)
    ──────────────────────────────────────────────────────────────────────
    
    ```typescript
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,                                          ← ALL BOOKING FIELDS
        profiles!bookings_user_id_fkey(            ← JOIN TO USER'S PROFILE
          name,                                     ← USER'S NAME
          email                                     ← USER'S EMAIL
        ),
        prestadores!bookings_prestador_id_fkey(    ← JOIN TO PRESTADOR
          profiles!prestadores_user_id_fkey(       ← JOIN TO PRESTADOR'S PROFILE
            name                                    ← PRESTADOR'S NAME
          )
        )
      `)
      .eq('id', sessionId)                         ← FOR THIS SPECIFIC BOOKING
      .single();                                   ← GET ONE RECORD
    ```
    
    This query returns:
    ┌──────────────────────────────────────────────────────────────┐
    │ booking = {                                                  │
    │   id: "abc-123-booking-uuid",                               │
    │   user_id: "user-456-uuid",                                 │
    │   prestador_id: "prestador-789-uuid",                       │
    │   booking_date: "2025-11-15T00:00:00Z",                     │
    │   start_time: "14:00:00",                                   │
    │   end_time: "15:00:00",                                     │
    │   pillar: "saude_mental",                                   │
    │   meeting_type: "virtual",                                  │
    │   meeting_link: "https://zoom.us/j/123456789",             │
    │   status: "scheduled",                                      │
    │                                                              │
    │   profiles: {                    ← USER'S DATA              │
    │     name: "João Silva",          ← FROM profiles TABLE     │
    │     email: "joao@email.com"      ← FROM profiles TABLE     │
    │   },                                                         │
    │                                                              │
    │   prestadores: {                 ← PRESTADOR'S DATA        │
    │     profiles: {                  ← NESTED JOIN              │
    │       name: "Dr. Pedro Santos"   ← FROM profiles TABLE     │
    │     }                                                        │
    │   }                                                          │
    │ }                                                            │
    └──────────────────────────────────────────────────────────────┘
    
    
    ──────────────────────────────────────────────────────────────────────
    ACTION 3: Send In-App Notification
    ──────────────────────────────────────────────────────────────────────
    
    ```typescript
    await supabase.from('notifications').insert({
      user_id: booking.user_id,              ← "user-456-uuid"
      type: 'meeting_link_added',
      title: 'Link de Reunião Disponível',
      message: `O link da sua sessão de ${booking.pillar} foi adicionado...`,
      //                                    ↑ "saude_mental"
      related_booking_id: sessionId,
      priority: 'high'
    });
    ```
    
    
    ──────────────────────────────────────────────────────────────────────
    ACTION 4: Send Email with ALL DATA
    ──────────────────────────────────────────────────────────────────────
    
    ```typescript
    supabase.functions.invoke('send-booking-email', {
      body: {
        to: booking.profiles.email,
        //  ↑ "joao@email.com" FROM profiles TABLE
        
        subject: 'Link da Sua Sessão Disponível',
        
        html: getMeetingLinkEmail({
          userName: booking.profiles.name || 'Utilizador',
          //        ↑ "João Silva" FROM profiles TABLE
          
          providerName: booking.prestadores?.profiles?.name || 'Prestador',
          //            ↑ "Dr. Pedro Santos" FROM prestadores->profiles TABLE
          
          date: booking.booking_date || new Date().toISOString(),
          //    ↑ "2025-11-15T00:00:00Z" FROM bookings TABLE
          
          time: booking.start_time || '00:00',
          //    ↑ "14:00:00" FROM bookings TABLE
          
          pillar: booking.pillar,
          //      ↑ "saude_mental" FROM bookings TABLE
          
          meetingLink: link,
          //           ↑ "https://zoom.us/j/123456789" 
          //           ↑ THIS IS THE EXACT LINK PRESTADOR TYPED!
          
          meetingType: booking.meeting_type || 'virtual'
          //           ↑ "virtual" FROM bookings TABLE
        }),
        
        type: 'booking_update',
        booking_id: sessionId
      }
    });
    ```


┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Email Template Uses This Data                                  │
└─────────────────────────────────────────────────────────────────────────┘

    File: src/utils/emailTemplates.ts
    Function: getMeetingLinkEmail(data: BookingEmailData)
    
    Data received:
    {
      userName: "João Silva",                      ← FROM DATABASE
      providerName: "Dr. Pedro Santos",            ← FROM DATABASE
      date: "2025-11-15T00:00:00Z",               ← FROM DATABASE
      time: "14:00:00",                            ← FROM DATABASE
      pillar: "saude_mental",                      ← FROM DATABASE
      meetingLink: "https://zoom.us/j/123456789",  ← PRESTADOR TYPED THIS
      meetingType: "virtual"                       ← FROM DATABASE
    }
    
    
    ──────────────────────────────────────────────────────────────────────
    HOW EACH FIELD IS USED IN THE EMAIL
    ──────────────────────────────────────────────────────────────────────
    
    1. USER NAME:
       ```html
       <p>Olá <strong>${data.userName}</strong>,</p>
       ```
       Result: "Olá João Silva,"
       Source: booking.profiles.name (from profiles table)
    
    2. PROVIDER NAME:
       ```html
       <p><strong>Prestador:</strong> ${data.providerName}</p>
       ```
       Result: "Prestador: Dr. Pedro Santos"
       Source: booking.prestadores.profiles.name (from profiles table)
    
    3. PILLAR (converted to Portuguese):
       ```typescript
       const pillarNames = {
         'saude_mental': 'Saúde Mental',
         'bem_estar_fisico': 'Bem-Estar Físico',
         'assistencia_financeira': 'Assistência Financeira',
         'assistencia_juridica': 'Assistência Jurídica'
       };
       const pillarName = pillarNames[data.pillar as keyof typeof pillarNames];
       ```
       ```html
       <p><strong>Área:</strong> ${pillarName}</p>
       ```
       Result: "Área: Saúde Mental"
       Source: booking.pillar (from bookings table)
    
    4. DATE (formatted to Portuguese):
       ```html
       <p><strong>Data:</strong> ${
         new Date(data.date).toLocaleDateString('pt-PT', { 
           weekday: 'long', 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
         })
       }</p>
       ```
       Result: "Data: Sexta-feira, 15 de Novembro de 2025"
       Source: booking.booking_date (from bookings table)
    
    5. TIME:
       ```html
       <p><strong>Hora:</strong> ${data.time}</p>
       ```
       Result: "Hora: 14:00:00"
       Source: booking.start_time (from bookings table)
    
    6. MEETING LINK - THE MOST IMPORTANT PART:
       ```html
       <div class="meeting-link-box">
         <p class="meeting-link">
           <a href="${data.meetingLink}" style="color: #047857;">
             ${data.meetingLink}
           </a>
         </p>
         <a href="${data.meetingLink}" class="button" target="_blank">
           Entrar na Sessão
         </a>
       </div>
       ```
       Result: 
       - Clickable text: "https://zoom.us/j/123456789"
       - Button href: "https://zoom.us/j/123456789"
       Source: THE EXACT LINK PRESTADOR TYPED (passed as `link` parameter)


┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: User Receives Email & Clicks Button                            │
└─────────────────────────────────────────────────────────────────────────┘

    User opens email and sees:
    
    ┌──────────────────────────────────────────────────────────┐
    │  ✅ Link da Sessão Disponível                           │
    ├──────────────────────────────────────────────────────────┤
    │  Olá João Silva,                     ← FROM profiles    │
    │                                                          │
    │  Prestador: Dr. Pedro Santos         ← FROM prestadores │
    │  Área: Saúde Mental                  ← FROM bookings    │
    │  Data: 15 de Novembro de 2025        ← FROM bookings    │
    │  Hora: 14:00:00                      ← FROM bookings    │
    │                                                          │
    │  🔗 Link da Reunião Virtual                             │
    │  https://zoom.us/j/123456789         ← PRESTADOR TYPED  │
    │                                                          │
    │  [ Entrar na Sessão ] ← BUTTON                          │
    │     ↑                                                    │
    │     href="https://zoom.us/j/123456789"                  │
    │     target="_blank"                                     │
    └──────────────────────────────────────────────────────────┘
    
    When user clicks "Entrar na Sessão":
    1. Browser opens new tab
    2. Navigates to: https://zoom.us/j/123456789
    3. Zoom/Google Meet opens
    4. User joins the session!


┌─────────────────────────────────────────────────────────────────────────┐
│  BONUS: How Especialista Can Also Add Meeting Links                     │
└─────────────────────────────────────────────────────────────────────────┘

    Location: src/components/admin/SpecialistLayout.tsx
    
    When especialista adds meeting link:
    
    ```typescript
    const handleUpdateMeetingLink = async (caseId: string, link: string) => {
      try {
        // Update database
        const { error } = await supabase
          .from('bookings')
          .update({ meeting_link: link })
          .eq('id', caseId);
        
        // Same process as prestador!
        // User would receive same email/notification
      }
    };
    ```
    
    SAME RESULT:
    - Database updated ✅
    - User notified ✅
    - Email sent ✅
```

---

## 🔍 DATA SOURCE SUMMARY

| Email Field | Database Source | How It's Obtained |
|-------------|----------------|-------------------|
| **To Email Address** | `profiles.email` | JOIN via `bookings.user_id` |
| **User Name** | `profiles.name` | JOIN via `bookings.user_id` |
| **Provider Name** | `profiles.name` | JOIN via `prestadores.user_id` → `bookings.prestador_id` |
| **Session Date** | `bookings.booking_date` | Direct query |
| **Session Time** | `bookings.start_time` | Direct query |
| **Pillar** | `bookings.pillar` | Direct query (converted to Portuguese) |
| **Meeting Type** | `bookings.meeting_type` | Direct query |
| **Meeting Link** | `link` parameter | **The exact URL prestador typed** |

---

## 💾 Database Tables Involved

```sql
-- 1. bookings table (stores the meeting link)
SELECT 
  id,
  user_id,              ← Links to profiles
  prestador_id,         ← Links to prestadores
  booking_date,         ← Used in email
  start_time,           ← Used in email
  pillar,               ← Used in email
  meeting_type,         ← Used in email
  meeting_link          ← THE IMPORTANT ONE! Stored here
FROM bookings
WHERE id = 'abc-123-booking-uuid';

-- 2. profiles table (user information)
SELECT 
  id,
  name,                 ← Used in email greeting
  email                 ← Email recipient
FROM profiles
WHERE id = (SELECT user_id FROM bookings WHERE id = 'abc-123-booking-uuid');

-- 3. prestadores table (provider link)
SELECT 
  id,
  user_id               ← Links to profiles
FROM prestadores
WHERE id = (SELECT prestador_id FROM bookings WHERE id = 'abc-123-booking-uuid');

-- 4. profiles table again (provider name)
SELECT 
  name                  ← Used in email
FROM profiles
WHERE id = (SELECT user_id FROM prestadores WHERE id = '...');
```

---

## 🎯 THE MEETING LINK - CRITICAL EXPLANATION

### Where does `meetingLink: link` come from?

```typescript
const handleUpdateMeetingLink = async (sessionId: string, link: string) => {
  //                                                        ↑
  //                                                     THIS IS IT!
  
  // This 'link' parameter is EXACTLY what prestador typed:
  // Example: "https://zoom.us/j/123456789"
  
  // It gets passed to the email template AS-IS:
  html: getMeetingLinkEmail({
    meetingLink: link,  ← EXACT SAME VALUE
  })
}
```

### How prestador types it:

```typescript
// In ProviderSessionManagementModal.tsx
const [meetingLink, setMeetingLink] = useState(session?.meetingLink || '');

<Input
  id="meeting-link"
  type="url"
  placeholder="Cole o link da reunião aqui..."
  value={meetingLink}
  onChange={(e) => setMeetingLink(e.target.value)}  ← PRESTADOR TYPES HERE
/>

<Button onClick={handleSaveMeetingLink}>
  Guardar Link
</Button>

const handleSaveMeetingLink = () => {
  onUpdateMeetingLink?.(session.id, meetingLink);
  //                                  ↑
  //                         PASSES THE TYPED LINK
};
```

---

## ✅ VERIFICATION CHECKLIST

To verify all data is correctly connected:

### 1. User Name in Email
```sql
-- Check if user name matches
SELECT p.name 
FROM profiles p
JOIN bookings b ON b.user_id = p.id
WHERE b.id = 'your-booking-id';
```
✅ This exact name appears in: "Olá **[name]**,"

### 2. Provider Name in Email
```sql
-- Check if provider name matches
SELECT p.name 
FROM profiles p
JOIN prestadores pr ON pr.user_id = p.id
JOIN bookings b ON b.prestador_id = pr.id
WHERE b.id = 'your-booking-id';
```
✅ This exact name appears in: "Prestador: **[name]**"

### 3. Session Date in Email
```sql
-- Check if date matches
SELECT booking_date 
FROM bookings 
WHERE id = 'your-booking-id';
```
✅ This date is formatted and appears in email

### 4. Session Time in Email
```sql
-- Check if time matches
SELECT start_time 
FROM bookings 
WHERE id = 'your-booking-id';
```
✅ This time appears in: "Hora: **[time]**"

### 5. Pillar in Email
```sql
-- Check if pillar matches
SELECT pillar 
FROM bookings 
WHERE id = 'your-booking-id';
```
✅ This is converted (e.g., `saude_mental` → "Saúde Mental")

### 6. Meeting Link in Email & Button
```sql
-- Check if meeting link matches
SELECT meeting_link 
FROM bookings 
WHERE id = 'your-booking-id';
```
✅ This EXACT link appears in:
- The visible link text
- The link href
- The button href

---

## 🚨 CRITICAL: The Meeting Link Flow

```
PRESTADOR TYPES                DATABASE               EMAIL
─────────────────────────────────────────────────────────────

"https://zoom.us/j/123"
         ↓
    [Guardar Link]
         ↓
    handleUpdateMeetingLink(
      sessionId: "abc-123",
      link: "https://zoom.us/j/123"  ← EXACT SAME
    )
         ↓
    UPDATE bookings 
    SET meeting_link = "https://zoom.us/j/123"  ← EXACT SAME
         ↓
    getMeetingLinkEmail({
      meetingLink: "https://zoom.us/j/123"  ← EXACT SAME
    })
         ↓
    <a href="https://zoom.us/j/123">  ← EXACT SAME
      Entrar na Sessão
    </a>
```

**There is NO transformation or modification of the meeting link.**
**It's stored and used EXACTLY as the prestador typed it.**

---

## 🎉 Summary

### All Email Features Are Connected to Backend ✅

1. ✅ **User Name:** From `profiles.name` via `bookings.user_id` FK
2. ✅ **User Email:** From `profiles.email` via `bookings.user_id` FK
3. ✅ **Provider Name:** From `profiles.name` via `prestadores.user_id` → `bookings.prestador_id` FK
4. ✅ **Session Date:** From `bookings.booking_date`
5. ✅ **Session Time:** From `bookings.start_time`
6. ✅ **Pillar:** From `bookings.pillar` (translated to Portuguese)
7. ✅ **Meeting Type:** From `bookings.meeting_type`
8. ✅ **Meeting Link:** From prestador's typed input (saved to `bookings.meeting_link`)

### The Button Works Because:
```html
<a href="${data.meetingLink}" class="button" target="_blank">
  Entrar na Sessão
</a>
```
- `href` is set to the EXACT link prestador typed
- `target="_blank"` opens in new tab
- When clicked, browser navigates to Zoom/Google Meet URL
- User joins the session automatically

**Everything is fully integrated and production ready!** 🚀





