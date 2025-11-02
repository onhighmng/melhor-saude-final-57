# 📧 Email Data Mapping - Visual Reference

## 🎯 Quick Answer: Where Does Each Email Field Come From?

```
EMAIL FIELD                     DATABASE SOURCE                     SQL PATH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To: joao@email.com       →      profiles.email                →    bookings.user_id
                                                                    → profiles.id

Olá João Silva          →      profiles.name                 →    bookings.user_id
                                                                    → profiles.id

Prestador:              →      profiles.name                 →    bookings.prestador_id
Dr. Pedro Santos                                                   → prestadores.id
                                                                    → prestadores.user_id
                                                                    → profiles.id

Área:                   →      bookings.pillar               →    bookings.pillar
Saúde Mental                   (converted to Portuguese)

Data:                   →      bookings.booking_date         →    bookings.booking_date
15 Nov 2025                    (formatted to Portuguese)

Hora:                   →      bookings.start_time           →    bookings.start_time
14:00

Link:                   →      PRESTADOR TYPED IT            →    The exact URL entered
https://zoom.us/j/123          (passed as parameter)              by prestador, saved to
                                                                    bookings.meeting_link

Button href:            →      SAME AS LINK ABOVE            →    Same exact URL
"Entrar na Sessão"
```

---

## 🔍 THE MEETING LINK - DETAILED TRACE

### 1️⃣ Prestador Types Link
```
┌────────────────────────────────────────┐
│  ProviderSessionManagementModal        │
│  ────────────────────────────────────  │
│                                        │
│  Link da Reunião:                     │
│  ┌──────────────────────────────────┐ │
│  │ https://zoom.us/j/123456789      │ │ ← PRESTADOR TYPES THIS
│  └──────────────────────────────────┘ │
│                                        │
│  [Guardar Link] ← CLICKS               │
└────────────────────────────────────────┘
         │
         │ Calls: onUpdateMeetingLink(sessionId, "https://zoom.us/j/123456789")
         ↓
```

### 2️⃣ Function Receives Link
```typescript
const handleUpdateMeetingLink = async (
  sessionId: string,              // e.g., "abc-123-uuid"
  link: string                    // "https://zoom.us/j/123456789"
) => {
```
**KEY POINT:** The `link` parameter contains the EXACT URL prestador typed

### 3️⃣ Database Saves Link
```sql
UPDATE bookings
SET meeting_link = 'https://zoom.us/j/123456789'  ← EXACT SAME URL
WHERE id = 'abc-123-uuid';
```

### 4️⃣ Email Template Receives Link
```typescript
html: getMeetingLinkEmail({
  userName: "João Silva",              // From profiles.name
  providerName: "Dr. Pedro Santos",    // From profiles.name
  date: "2025-11-15",                  // From bookings.booking_date
  time: "14:00:00",                    // From bookings.start_time
  pillar: "saude_mental",              // From bookings.pillar
  meetingLink: "https://zoom.us/j/123456789",  ← EXACT SAME URL
  meetingType: "virtual"               // From bookings.meeting_type
})
```

### 5️⃣ Email HTML Uses Link
```html
<!-- Link as text -->
<a href="https://zoom.us/j/123456789">  ← EXACT SAME URL
  https://zoom.us/j/123456789           ← EXACT SAME URL (displayed)
</a>

<!-- Link as button -->
<a href="https://zoom.us/j/123456789"   ← EXACT SAME URL
   class="button" 
   target="_blank">
  Entrar na Sessão
</a>
```

### 6️⃣ User Clicks Button
```
User clicks "Entrar na Sessão"
         ↓
Browser reads: href="https://zoom.us/j/123456789"  ← EXACT SAME URL
         ↓
Opens new tab with: https://zoom.us/j/123456789    ← EXACT SAME URL
         ↓
Zoom/Google Meet loads
         ↓
User joins session! 🎉
```

---

## 🗄️ Database Query Breakdown

### The Complete Query
```typescript
const { data: booking } = await supabase
  .from('bookings')
  .select(`
    *,
    profiles!bookings_user_id_fkey(name, email),
    prestadores!bookings_prestador_id_fkey(
      profiles!prestadores_user_id_fkey(name)
    )
  `)
  .eq('id', sessionId)
  .single();
```

### What This Query Returns

```javascript
booking = {
  // ─────────────────────────────────────────
  // FROM: bookings table (direct fields)
  // ─────────────────────────────────────────
  id: "abc-123-uuid",
  user_id: "user-456-uuid",
  prestador_id: "prestador-789-uuid",
  company_id: "company-999-uuid",
  booking_date: "2025-11-15T00:00:00Z",     // → Email: "Data: 15 Nov 2025"
  start_time: "14:00:00",                    // → Email: "Hora: 14:00"
  end_time: "15:00:00",
  pillar: "saude_mental",                    // → Email: "Área: Saúde Mental"
  meeting_type: "virtual",                   // → Email: Used for formatting
  meeting_link: "https://zoom.us/j/123...", // → Email: Button href
  status: "scheduled",
  
  // ─────────────────────────────────────────
  // FROM: profiles table (via bookings.user_id)
  // This is the USER who booked the session
  // ─────────────────────────────────────────
  profiles: {
    name: "João Silva",                      // → Email: "Olá João Silva"
    email: "joao@email.com"                  // → Email: Recipient
  },
  
  // ─────────────────────────────────────────
  // FROM: prestadores + profiles (via bookings.prestador_id)
  // This is the PROVIDER conducting the session
  // ─────────────────────────────────────────
  prestadores: {
    profiles: {
      name: "Dr. Pedro Santos"               // → Email: "Prestador: Dr. Pedro Santos"
    }
  }
}
```

---

## 📊 Visual Data Flow Map

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE TABLES                                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   profiles              │
│   (User Info)           │
├─────────────────────────┤
│ id: user-456            │───┐
│ name: "João Silva"      │   │ ← Email greeting
│ email: "joao@email.com" │   │ ← Email recipient
└─────────────────────────┘   │
                              │
                              │ bookings.user_id (FK)
┌─────────────────────────────────────────────────┐
│   bookings                                      │
│   (Session Info)                                │
├─────────────────────────────────────────────────┤
│ id: abc-123                                     │
│ user_id: user-456       ─────────────────────┘│
│ prestador_id: prestador-789  ───────────────┐│
│ booking_date: "2025-11-15"  ← Email date    ││
│ start_time: "14:00:00"      ← Email time    ││
│ pillar: "saude_mental"      ← Email pillar  ││
│ meeting_type: "virtual"     ← Email context ││
│ meeting_link: "https://..." ← EMAIL BUTTON! ││
└─────────────────────────────────────────────────┘│
                                                   │
                              bookings.prestador_id (FK)
┌─────────────────────────┐                       │
│   prestadores           │───────────────────────┘
│   (Provider Link)       │
├─────────────────────────┤
│ id: prestador-789       │
│ user_id: prof-999       │───┐
└─────────────────────────┘   │
                              │ prestadores.user_id (FK)
┌─────────────────────────┐   │
│   profiles              │───┘
│   (Provider Info)       │
├─────────────────────────┤
│ id: prof-999            │
│ name: "Dr. Pedro Santos"│ ← Email provider name
└─────────────────────────┘

                    ↓
              ALL COMBINED
                    ↓

┌──────────────────────────────────────────────────────────────┐
│                       EMAIL TEMPLATE                          │
├──────────────────────────────────────────────────────────────┤
│  To: joao@email.com                  (profiles.email)       │
│                                                              │
│  ✅ Link da Sessão Disponível                               │
│                                                              │
│  Olá João Silva,                     (profiles.name)        │
│                                                              │
│  Prestador: Dr. Pedro Santos         (profiles.name)        │
│  Área: Saúde Mental                  (bookings.pillar)      │
│  Data: 15 de Novembro 2025           (bookings.booking_date)│
│  Hora: 14:00                         (bookings.start_time)  │
│                                                              │
│  🔗 Link: https://zoom.us/j/123...   (bookings.meeting_link)│
│                                                              │
│  [Entrar na Sessão]                  (bookings.meeting_link)│
│   href="https://zoom.us/j/123..."                           │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Verification: All Features Connected

| Feature | Database Source | Code Location | Status |
|---------|----------------|---------------|---------|
| **Email Recipient** | `profiles.email` (via `bookings.user_id`) | `booking.profiles.email` | ✅ Connected |
| **User Greeting** | `profiles.name` (via `bookings.user_id`) | `booking.profiles.name` | ✅ Connected |
| **Provider Name** | `profiles.name` (via `prestadores.user_id`) | `booking.prestadores.profiles.name` | ✅ Connected |
| **Session Date** | `bookings.booking_date` | `booking.booking_date` | ✅ Connected |
| **Session Time** | `bookings.start_time` | `booking.start_time` | ✅ Connected |
| **Session Pillar** | `bookings.pillar` | `booking.pillar` | ✅ Connected |
| **Meeting Link (Text)** | Prestador typed it | `link` parameter | ✅ Connected |
| **Meeting Link (Button)** | Same as above | `data.meetingLink` in template | ✅ Connected |

---

## 🎯 The Key Point About the Meeting Link

### Where does it come from?
```
PRESTADOR TYPES IT
      ↓
SAVED TO: bookings.meeting_link
      ↓
PASSED AS: link parameter
      ↓
USED IN EMAIL: data.meetingLink
      ↓
BUTTON href="${data.meetingLink}"
```

### It's NOT retrieved from database for the email
The meeting link is:
1. ✅ Saved to database (for persistence)
2. ✅ Passed directly as parameter to email function
3. ✅ Used as-is in the email template

This means:
- **No transformation** ✅
- **No modification** ✅
- **Exact URL prestador typed** ✅
- **Works immediately** ✅

---

## 🚀 Production Readiness Checklist

- ✅ Username correctly fetched from `profiles` table
- ✅ User email correctly fetched from `profiles` table
- ✅ Provider name correctly fetched via JOIN
- ✅ Session date correctly fetched from `bookings` table
- ✅ Session time correctly fetched from `bookings` table
- ✅ Pillar correctly converted to Portuguese
- ✅ Meeting link correctly passed from prestador input
- ✅ Button href correctly set to meeting link
- ✅ Email sends to correct recipient
- ✅ All foreign keys properly joined
- ✅ Error handling in place
- ✅ Notifications created
- ✅ Database updated

**Status: 100% PRODUCTION READY** 🎉

