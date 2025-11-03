# 🏗️ Melhor Saúde — Architecture & Flow Diagrams

This document provides visual representations of how the platform components are connected.

---

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MELHOR SAÚDE PLATFORM                            │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (React + TypeScript)                  │  │
│  │                                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │  Admin   │  │    HR    │  │   User   │  │Especialista│        │  │
│  │  │Dashboard │  │Dashboard │  │Dashboard │  │  Dashboard │        │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬──────┘        │  │
│  │       │             │             │             │                  │  │
│  │       └─────────────┴─────────────┴─────────────┘                │  │
│  │                          │                                         │  │
│  │                    ┌─────▼──────┐                                │  │
│  │                    │ Auth Layer │                                 │  │
│  │                    │  (Context) │                                 │  │
│  │                    └─────┬──────┘                                │  │
│  │                          │                                         │  │
│  └──────────────────────────┼─────────────────────────────────────┘  │
│                              │                                          │
│  ┌──────────────────────────▼─────────────────────────────────────┐  │
│  │              SUPABASE BACKEND (PostgreSQL + Auth)              │  │
│  │                                                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │  │
│  │  │ Row-Level    │  │  Database    │  │  Edge        │        │  │
│  │  │ Security     │  │  Tables      │  │  Functions   │        │  │
│  │  │ (RLS)        │  │              │  │              │        │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Role Flow Diagram

```
                          ┌─────────────────┐
                          │  MELHOR SAÚDE   │
                          │     ADMIN       │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌──────────┐   ┌──────────┐   ┌──────────┐
            │ Creates  │   │ Creates  │   │ Monitors │
            │Companies │   │Prestador │   │ Platform │
            │   & HR   │   │ Accounts │   │  Metrics │
            └────┬─────┘   └──────────┘   └──────────┘
                 │
                 │ Generates Access Codes
                 │
                 ▼
         ┌──────────────┐
         │  HR/COMPANY  │◄─────── Can view adoption & usage
         │   ADMIN      │         Cannot see clinical data
         └──────┬───────┘
                │
                │ Sends Codes to Employees
                │
                ▼
         ┌──────────────┐
         │ COLABORADOR  │
         │   (USER)     │
         └──────┬───────┘
                │
                │ Starts Chat / Needs Help
                │
                ▼
         ┌──────────────┐
         │   AI CHAT    │──── Simple Case ────► Resources
         │     BOT      │
         └──────┬───────┘
                │
                │ Complex Case / Escalation
                │
                ▼
      ┌─────────────────┐
      │ ESPECIALISTA    │
      │    GERAL        │
      │ (Internal Staff)│
      └────────┬────────┘
               │
               ├──── Can Resolve ────► Close Case
               │
               └──── Needs External ──► Assign to Prestador
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │  PRESTADOR   │
                                       │ (External    │
                                       │ Specialist)  │
                                       └──────────────┘
```

---

## 🎯 Employee Onboarding Flow

```
START
  │
  ├─► [1] HR logs into /company/dashboard
  │
  ├─► [2] HR navigates to "Colaboradores" section
  │
  ├─► [3] HR clicks "Generate Access Codes"
  │        │
  │        └─► RPC: create_invite_code('user')
  │                  │
  │                  └─► Inserts into `invites` table
  │                        - invite_code: "MS-XXXXXX"
  │                        - company_id: <company_id>
  │                        - role: 'user'
  │                        - status: 'pending'
  │
  ├─► [4] System sends email to employee
  │        - Subject: "Welcome to Melhor Saúde"
  │        - Body contains: code + registration link
  │
  ├─► [5] Employee clicks link → /register/employee?code=MS-XXXXXX
  │
  ├─► [6] Frontend validates code
  │        │
  │        └─► RPC: validate_access_code('MS-XXXXXX')
  │                  │
  │                  └─► Returns: { valid: true, company_id, role }
  │
  ├─► [7] Employee enters email + password
  │
  ├─► [8] Backend creates:
  │        - auth.users record
  │        - profiles record (with company_id)
  │        - user_roles record (role: 'user')
  │        - company_employees record
  │        - Updates invites (status: 'accepted')
  │
  ├─► [9] User auto-logged in → Redirect to /user/dashboard
  │
  └─► [10] First-time login → Shows onboarding modal
           │
           ├─► Step 1: Rate wellbeing (1-10)
           ├─► Step 2: Select difficulty areas
           ├─► Step 3: Define goals
           ├─► Step 4: How know improvement?
           └─► Step 5: Desired frequency
                 │
                 └─► Saves to `onboarding_data` table
                      Updates `profiles.has_completed_onboarding = true`
                      Creates initial milestones
                      Redirects to dashboard

END
```

---

## 💬 Chat Escalation Flow

```
USER STARTS CHAT
  │
  ├─► [1] User opens chat interface (/user/chat)
  │        Component: <UniversalAIChat />
  │
  ├─► [2] System creates chat_session
  │        - user_id: <user_id>
  │        - pillar: null (to be identified)
  │        - status: 'active'
  │
  ├─► [3] User sends first message
  │        "I'm feeling very stressed at work"
  │
  ├─► [4] Edge Function: universal-specialist-chat
  │        - Mode: 'identify_pillar'
  │        - AI analyzes message
  │        - Returns: { pillar: 'saude_mental', message: "..." }
  │
  ├─► [5] System updates chat_session.pillar = 'saude_mental'
  │
  ├─► [6] AI Bot engages in conversation
  │        - Asks diagnostic questions
  │        - Provides initial guidance
  │        - Offers resources
  │
  ├─► [7] Conversation evaluation
  │        │
  │        ├─► CASE A: User satisfied
  │        │    - User clicks "Problem Solved"
  │        │    - chat_session.satisfaction_rating = 'satisfied'
  │        │    - chat_session.status = 'resolved'
  │        │    - chat_session.ai_resolution = true
  │        │    → END (Happy path)
  │        │
  │        └─► CASE B: User needs more help
  │             - User clicks "I need to talk to someone"
  │             OR
  │             - AI confidence < 0.5
  │             │
  │             └─► [8] ESCALATION TRIGGERED
  │                      │
  │                      ├─► Update chat_session:
  │                      │    - status = 'escalated'
  │                      │    - phone_escalation_reason = "User requested"
  │                      │
  │                      ├─► Create notification for Especialista Geral:
  │                      │    - Find specialists with pillar = 'saude_mental'
  │                      │    - Insert into `notifications`:
  │                      │      {
  │                      │        type: 'chat_escalation',
  │                      │        title: 'New Escalation',
  │                      │        message: 'User needs assistance',
  │                      │        metadata: { chat_session_id, pillar }
  │                      │      }
  │                      │
  │                      └─► [9] ESPECIALISTA GERAL receives alert
  │                               │
  │                               ├─► Views in: /especialista/call-requests
  │                               │    Component: <EspecialistaCallRequests />
  │                               │
  │                               ├─► Can see:
  │                               │    - User name
  │                               │    - Chat history
  │                               │    - Pre-diagnostic summary
  │                               │    - Wait time
  │                               │
  │                               ├─► [10] Specialist calls user
  │                               │         Creates: specialist_call_logs
  │                               │         - chat_session_id
  │                               │         - specialist_id
  │                               │         - call_notes
  │                               │
  │                               ├─► DECISION POINT:
  │                               │    │
  │                               │    ├─► RESOLVE: Issue solved on call
  │                               │    │    - call_logs.call_status = 'completed'
  │                               │    │    - call_logs.session_booked = false
  │                               │    │    - chat_session.status = 'resolved'
  │                               │    │    → END
  │                               │    │
  │                               │    └─► REFER: Needs external specialist
  │                               │         │
  │                               │         └─► [11] Books session with Prestador
  │                               │                  │
  │                               │                  ├─► Creates booking:
  │                               │                  │    - user_id
  │                               │                  │    - prestador_id (selected)
  │                               │                  │    - pillar: 'saude_mental'
  │                               │                  │    - booking_source: 'specialist_referral'
  │                               │                  │    - referral_notes: "..."
  │                               │                  │
  │                               │                  ├─► Updates call_log:
  │                               │                  │    - session_booked = true
  │                               │                  │    - booking_id = <booking_id>
  │                               │                  │
  │                               │                  └─► [12] PRESTADOR notified
  │                               │                           - Email notification
  │                               │                           - Visible in /prestador/sessoes
  │                               │                           - Can view referral notes
  │                               │                           - Conducts session
  │                               │                           - Marks as complete
  │                               │                           │
  │                               │                           └─► [13] User gives feedback
  │                               │                                    - Rating (1-5)
  │                               │                                    - Comments
  │                               │                                    - Saved to bookings.rating
  │                               │                                    → END

END
```

---

## 📅 Booking Flow Diagram

```
USER DECIDES TO BOOK SESSION
  │
  ├─► [1] User clicks "Book Session" button
  │        Route: /user/book
  │        Component: <BookingRouter />
  │
  ├─► [2] STEP 1: Select Pillar
  │        Options:
  │        - 🧠 Saúde Mental
  │        - 💪 Bem-Estar Físico
  │        - 💰 Assistência Financeira
  │        - ⚖️ Assistência Jurídica
  │
  ├─► [3] STEP 2: Select Topic (pillar-specific)
  │        Example for Mental Health:
  │        - Stress / Ansiedade
  │        - Depressão
  │        - Burnout
  │        - etc.
  │
  ├─► [4] Check session quota
  │        │
  │        └─► RPC: get_user_session_balance(user_id)
  │                  │
  │                  └─► Returns:
  │                        {
  │                          company_sessions_allocated: 10,
  │                          company_sessions_used: 3,
  │                          company_sessions_remaining: 7
  │                        }
  │                        │
  │                        ├─► IF remaining > 0 → Continue
  │                        └─► IF remaining = 0 → Show error
  │
  ├─► [5] STEP 3: Select Prestador
  │        │
  │        └─► Query: SELECT * FROM prestadores
  │                   WHERE pillar_specialties @> ['saude_mental']
  │                   AND is_active = true
  │                   AND available = true
  │            │
  │            └─► Display cards with:
  │                 - Photo
  │                 - Name
  │                 - Specialty
  │                 - Rating
  │                 - Available slots
  │
  ├─► [6] STEP 4: Select Date & Time
  │        │
  │        ├─► Load prestador availability
  │        │    SELECT * FROM prestador_availability
  │        │    WHERE prestador_id = <selected_prestador>
  │        │    AND day_of_week = <selected_day>
  │        │
  │        └─► Show calendar with available slots
  │             (9:00, 10:00, 11:00, 14:00, 15:00, etc.)
  │
  ├─► [7] STEP 5: Meeting Type
  │        Options:
  │        - 💻 Virtual (Google Meet / Zoom)
  │        - 📱 Phone Call
  │        - 🏢 Presencial (if prestador supports)
  │
  ├─► [8] STEP 6: Confirmation
  │        Summary:
  │        - Prestador: <name>
  │        - Date: <date>
  │        - Time: <time>
  │        - Type: <virtual/phone/presencial>
  │        - Quota: Using 1 company session
  │
  ├─► [9] User clicks "Confirm Booking"
  │        │
  │        └─► RPC: book_session(...)
  │                  │
  │                  ├─► Transaction starts
  │                  │
  │                  ├─► INSERT INTO bookings:
  │                  │    {
  │                  │      user_id,
  │                  │      prestador_id,
  │                  │      date,
  │                  │      start_time,
  │                  │      end_time,
  │                  │      pillar,
  │                  │      topic,
  │                  │      meeting_type,
  │                  │      company_id,
  │                  │      status: 'scheduled'
  │                  │    }
  │                  │
  │                  ├─► UPDATE company_employees:
  │                  │    SET sessions_used = sessions_used + 1
  │                  │    WHERE user_id = <user_id>
  │                  │
  │                  ├─► UPDATE companies:
  │                  │    SET sessions_used = sessions_used + 1
  │                  │    WHERE id = <company_id>
  │                  │
  │                  └─► Transaction commits
  │
  ├─► [10] Send confirmations
  │         │
  │         ├─► Email to User:
  │         │    - Booking details
  │         │    - Calendar invite (.ics)
  │         │    - Meeting link (if virtual)
  │         │
  │         └─► Email to Prestador:
  │              - New booking notification
  │              - User details (name, company)
  │              - Session details
  │
  ├─► [11] User redirected to /user/sessions
  │         Shows booking in "Upcoming Sessions"
  │
  └─► [12] ON SESSION DAY:
           │
           ├─► Prestador conducts session
           │    Route: /prestador/sessoes/<booking_id>
           │
           ├─► Prestador marks as complete:
           │    - Adds session notes
           │    - Updates status: 'completed'
           │
           └─► [13] User receives feedback request
                    Route: /user/feedback
                    │
                    ├─► User rates session (1-5 stars)
                    ├─► User adds comments (optional)
                    │
                    └─► Saves to:
                         bookings.rating = <rating>
                         bookings.feedback = <comments>

END
```

---

## 🔐 Authentication & Authorization Flow

```
                    ┌─────────────────────┐
                    │   User Action       │
                    │  (Login / Register) │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Supabase Auth      │
                    │  auth.signIn()      │
                    │  auth.signUp()      │
                    └──────────┬──────────┘
                               │
                               ├─── Creates JWT token
                               │
                               ▼
                    ┌─────────────────────┐
                    │  AuthContext        │
                    │  (React Context)    │
                    └──────────┬──────────┘
                               │
                               ├─── Fetches user profile
                               ├─── Fetches user roles
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Query user_roles   │
                    │  WHERE user_id = X  │
                    └──────────┬──────────┘
                               │
                               ├─── Returns: ['user', 'hr'] (example)
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Determine Primary   │
                    │      Role           │
                    │ Priority:           │
                    │ admin > hr >        │
                    │ prestador >         │
                    │ specialist > user   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  ROLE_REDIRECT_MAP  │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        /admin/dashboard  /company/dashboard  /user/dashboard
                │              │              │
                │              │              │
                ▼              ▼              ▼
         ┌────────────┐  ┌────────────┐  ┌────────────┐
         │ Protected  │  │ Protected  │  │ Protected  │
         │   Route    │  │   Route    │  │   Route    │
         │            │  │            │  │            │
         │ Checks:    │  │ Checks:    │  │ Checks:    │
         │ role=admin │  │ role=hr    │  │ role=user  │
         └────────────┘  └────────────┘  └────────────┘
                │              │              │
                │              │              │
      ┌─────────┼──────────────┼──────────────┼─────────┐
      │         │              │              │         │
      │         └──────────────┴──────────────┘         │
      │                        │                        │
      │                        ▼                        │
      │             ┌─────────────────────┐            │
      │             │  Row Level Security │            │
      │             │      (RLS)          │            │
      │             │                     │            │
      │             │  Filters queries:   │            │
      │             │  - By company_id    │            │
      │             │  - By user_id       │            │
      │             │  - By role          │            │
      │             └─────────────────────┘            │
      │                                                 │
      │              DATA ACCESS LAYER                 │
      └─────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Example: HR Views Employee Metrics

```
HR User
  │
  │ 1. Navigates to /company/relatorios
  │
  ▼
┌─────────────────────────────────────┐
│  CompanyReportsImpact.tsx           │
│                                     │
│  useEffect(() => {                  │
│    loadCompanyMetrics()             │
│  })                                 │
└──────────────┬──────────────────────┘
               │
               │ 2. Fetches data
               │
               ▼
┌─────────────────────────────────────┐
│  Supabase Query                     │
│                                     │
│  SELECT * FROM company_employees    │
│  WHERE company_id = <hr_company>    │
│                                     │
│  ⚠️ RLS POLICY ACTIVE:              │
│  HR can only see their company      │
└──────────────┬──────────────────────┘
               │
               │ 3. Returns employee list (NO clinical data)
               │
               ▼
┌─────────────────────────────────────┐
│  Data includes:                     │
│  ✅ sessions_allocated              │
│  ✅ sessions_used                   │
│  ✅ employee name/email             │
│  ✅ join date                       │
│  ❌ chat_sessions (BLOCKED by RLS) │
│  ❌ booking details (BLOCKED)       │
└──────────────┬──────────────────────┘
               │
               │ 4. Aggregates metrics
               │
               ▼
┌─────────────────────────────────────┐
│  Frontend calculates:               │
│  - Total employees                  │
│  - Adoption rate                    │
│  - Session utilization %            │
│  - Pillar usage (aggregated only)   │
│                                     │
│  ⚠️ NO individual clinical data     │
└──────────────┬──────────────────────┘
               │
               │ 5. Renders dashboard
               │
               ▼
┌─────────────────────────────────────┐
│  UI Display:                        │
│  📊 Charts & graphs                 │
│  📈 Usage trends                    │
│  👥 Employee adoption list          │
│  💼 No sensitive health info        │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema Relationships

```
                    ┌──────────────┐
                    │   auth.users │
                    └──────┬───────┘
                           │
                           │ id
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │  profiles   │          │ user_roles  │
       │             │          │             │
       │ id (PK, FK) │          │ user_id (FK)│
       │ email       │          │ role        │
       │ full_name   │          └─────────────┘
       │ company_id  │◄──┐
       │ role        │   │
       └──────┬──────┘   │
              │          │
              │          │
              ▼          │
       ┌─────────────┐   │
       │  companies  │   │
       │             │   │
       │ id (PK) ────┘   │
       │ name            │
       │ sessions_alloc. │
       │ sessions_used   │
       └──────┬──────────┘
              │
              │
              ▼
       ┌──────────────────┐
       │ company_employees│
       │                  │
       │ company_id (FK)  │
       │ user_id (FK)     │
       │ sessions_alloc.  │
       │ sessions_used    │
       └──────────────────┘


       ┌─────────────┐
       │   invites   │
       │             │
       │ invite_code │
       │ company_id  │◄───── Used for registration
       │ email       │
       │ role        │
       │ status      │
       └─────────────┘


       ┌──────────────┐
       │chat_sessions │
       │              │
       │ id (PK)      │
       │ user_id (FK) │◄───── User's chat history
       │ pillar       │
       │ status       │
       └──────┬───────┘
              │
              │
              ▼
       ┌──────────────┐
       │chat_messages │
       │              │
       │ session_id(FK)│
       │ role         │
       │ content      │
       └──────────────┘


       ┌──────────────────┐
       │    bookings      │
       │                  │
       │ id (PK)          │
       │ user_id (FK)     │
       │ prestador_id(FK) │
       │ company_id (FK)  │
       │ chat_session_id  │◄── Links to chat
       │ pillar           │
       │ date/time        │
       │ status           │
       │ rating           │
       │ feedback         │
       └──────┬───────────┘
              │
              │
              ▼
       ┌──────────────────┐
       │  prestadores     │
       │                  │
       │ id (PK)          │
       │ user_id (FK)     │
       │ specialties      │
       │ available        │
       └──────────────────┘


       ┌────────────────────┐
       │specialist_call_logs│
       │                    │
       │ chat_session_id(FK)│
       │ user_id (FK)       │
       │ specialist_id (FK) │
       │ call_notes         │
       │ session_booked     │
       │ booking_id (FK)    │
       └────────────────────┘
```

---

## 🔒 RLS Policy Example

```sql
-- Example: Company HR can only see their own company's employees

CREATE POLICY "hr_view_own_company_employees" ON company_employees
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'hr'
    )
  )
);

-- Result: HR user can query company_employees table,
-- but RLS automatically filters to only show employees
-- from their company.
```

```sql
-- Example: Users can only see their own chat sessions

CREATE POLICY "users_view_own_chats" ON chat_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Result: When HR tries to query chat_sessions,
-- they get 0 results because none have their user_id.
-- Clinical data is protected!
```

---

## 📡 API Call Flow Example

```
Frontend Component: <UserDashboard />
        │
        │ useEffect(() => { loadUserProgress() })
        │
        ▼
┌─────────────────────────────┐
│  supabase.from('user_progress') │
│  .select('*')               │
│  .eq('user_id', userId)     │
└─────────┬───────────────────┘
          │
          │ HTTP POST to Supabase API
          │ Headers: { Authorization: 'Bearer <JWT>' }
          │
          ▼
┌─────────────────────────────────┐
│  Supabase PostgREST API         │
│                                 │
│  1. Validates JWT               │
│  2. Extracts user_id from JWT   │
│  3. Applies RLS policies        │
│  4. Executes query with filters │
└─────────┬───────────────────────┘
          │
          │ Query executed with RLS
          │
          ▼
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│                                 │
│  SELECT * FROM user_progress    │
│  WHERE user_id = <from_jwt>     │
│  AND (RLS policies)             │
└─────────┬───────────────────────┘
          │
          │ Returns filtered results
          │
          ▼
┌─────────────────────────────────┐
│  Response: JSON array           │
│  [                              │
│    {                            │
│      id: 'uuid',                │
│      user_id: 'uuid',           │
│      pillar: 'saude_mental',    │
│      action_type: 'chat',       │
│      created_at: '...'          │
│    }                            │
│  ]                              │
└─────────┬───────────────────────┘
          │
          │ Returns to frontend
          │
          ▼
┌─────────────────────────────────┐
│  React Component                │
│  setProgress(data)              │
│  → Updates UI                   │
└─────────────────────────────────┘
```

---

## 🎨 Component Hierarchy Example (User Dashboard)

```
<App>
  └─ <AuthProvider>
      └─ <ProtectedRoute requiredRole="user">
          └─ <UserLayout>
              ├─ <UserSidebar />
              │   ├─ Navigation links
              │   ├─ Progress indicator
              │   └─ Quick actions
              │
              └─ <UserDashboard>
                  ├─ <WelcomeHeader />
                  │   └─ Greeting + onboarding status
                  │
                  ├─ <ProgressOverview />
                  │   ├─ useUserProgress() ←── Fetches data
                  │   └─ <ProgressBar />
                  │
                  ├─ <PillarCarousel />
                  │   ├─ Mental Health card
                  │   ├─ Physical Wellness card
                  │   ├─ Financial Assistance card
                  │   └─ Legal Assistance card
                  │
                  ├─ <UpcomingSessions />
                  │   ├─ useBookings() ←── Fetches bookings
                  │   └─ Maps to <SessionCard />
                  │
                  ├─ <QuickActions />
                  │   ├─ "Talk to Specialist" button
                  │   ├─ "Book Session" button
                  │   └─ "View Resources" button
                  │
                  └─ <RecentActivity />
                      └─ useUserProgress() ←── Shows recent actions
```

---

## 🚀 Deployment Flow

```
Developer
  │
  │ git push to main
  │
  ▼
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │
         │ Webhook triggers
         │
         ▼
┌─────────────────┐
│  Vercel Build   │
│                 │
│  - npm install  │
│  - vite build   │
│  - Optimizes    │
└────────┬────────┘
         │
         │ Deploys static files
         │
         ▼
┌─────────────────┐
│  Vercel CDN     │
│  (Production)   │
└────────┬────────┘
         │
         │ Connects to
         │
         ▼
┌─────────────────────────┐
│  Supabase Cloud         │
│                         │
│  - PostgreSQL DB        │
│  - Auth service         │
│  - Edge Functions       │
│  - Storage              │
│  - Realtime subscript.  │
└─────────────────────────┘
```

---

## 📱 Mobile/Desktop Responsive Architecture

```
                ┌─────────────────────────┐
                │  React App Entry Point  │
                │      (main.tsx)         │
                └────────────┬────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │   Desktop    │          │    Mobile    │
        │   (>768px)   │          │   (<768px)   │
        └──────┬───────┘          └──────┬───────┘
               │                         │
               │                         │
    ┌──────────┴──────────┐   ┌─────────┴────────┐
    │                     │   │                  │
    ▼                     ▼   ▼                  ▼
┌─────────┐        ┌──────────┐      ┌──────────────┐
│ Sidebar │        │  Main    │      │ Mobile Menu  │
│(Fixed)  │        │ Content  │      │ (Hamburger)  │
│         │        │ Area     │      │              │
│ - Nav   │        │          │      │ - Nav        │
│ - Quick │        │ Dynamic  │      │ - Profile    │
│ - Stats │        │ Content  │      │ - Logout     │
└─────────┘        └──────────┘      └──────────────┘
    │                   │                   │
    │                   │                   │
    └───────────────────┴───────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Tailwind CSS    │
              │  Responsive      │
              │  Utilities:      │
              │  - sm:, md:, lg: │
              │  - flex/grid     │
              │  - hidden/block  │
              └──────────────────┘
```

---

This architecture ensures all user flows work correctly with proper data isolation, role-based access, and secure escalation paths.



