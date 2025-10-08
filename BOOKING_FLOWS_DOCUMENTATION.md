# 📋 Booking Flows Documentation

## Overview

The wellness platform has **two distinct booking flows**:

1. **DirectBookingFlow** (`/user/book-session`) - Topic-driven, pre-diagnostic chat flow
2. **BookingFlow** (`/user/book`) - Quick booking flow with legal AI/human choice

---

## 🎯 Flow 1: DirectBookingFlow (`/user/book-session`)

**Route:** `/user/book-session`  
**Component:** `src/components/booking/DirectBookingFlow.tsx`

### Purpose
A comprehensive booking flow that includes topic selection and pre-diagnostic chat before provider assignment.

### Flow Steps

```
Step 1: Pillar Selection
    ↓
Step 2: Topic Selection (based on selected pillar)
    ↓
Step 3: Pre-Diagnostic Chat (AI conversation about the topic)
    ↓
Step 4: Provider Assignment (automatic matching)
    ↓
Step 5: Date & Time Selection
    ↓
Step 6: Confirmation
    ↓
Booking Created → Navigate to Dashboard
```

### Step Details

#### **Step 1: Pillar Selection**
- **Component:** `PillarSelection.tsx`
- **User selects from:**
  - `psicologica` (Mental Health)
  - `fisica` (Physical Wellness)
  - `financeira` (Financial Assistance)
  - `juridica` (Legal Assistance)
- **Data type:** `BookingPillar` (as defined in `BookingFlow.tsx`)

#### **Step 2: Topic Selection**
- **Component:** `TopicSelection.tsx`
- **Props received:** `pillar: BookingPillar`
- **Internal conversion:** Converts `BookingPillar` → topic pillar ID using `getTopicPillarId()`
  - `'psicologica'` → `'saude_mental'`
  - `'fisica'` → `'bem_estar_fisico'`
  - `'financeira'` → `'assistencia_financeira'`
  - `'juridica'` → `'assistencia_juridica'`
- **Topics loaded from:** `topicsData.ts` using the converted pillar ID
- **Translation keys:** `user:topics.{topicPillarId}.{topicId}.name`

#### **Step 3: Pre-Diagnostic Chat**
- **Component:** `PreDiagnosticChat.tsx`
- **Props received:** `pillar: BookingPillar`, `topic: string`
- **Functionality:**
  - Creates a chat session in `chat_sessions` table
  - Stores pillar as topic pillar ID (converted using `getTopicPillarId()`)
  - AI conversation about the selected topic
  - Messages stored in `chat_messages` table
  - User can provide context about their situation
- **On complete:** Returns `sessionId` to parent flow

#### **Step 4: Provider Assignment**
- **Component:** `ProviderAssignmentStep.tsx`
- **Automatic matching logic:**
  - Uses `sessionId` from chat
  - Filters `mockProviders` by converted pillar ID
  - Assigns first available provider
  - Shows provider details with checkmark confirmation
- **Translation keys:** `user:booking.directFlow.providerAssigned`

#### **Step 5: Date & Time Selection**
- **Component:** `CalendarStep.tsx`
- **Functionality:**
  - Calendar UI for date selection
  - Time slot selection (5:00 AM - 6:30 PM, 30-min intervals)
  - Mock availability check
- **Translation keys:** `user:booking.dateTime.title`

#### **Step 6: Confirmation**
- **Component:** `ConfirmationStep.tsx`
- **Shows:**
  - Provider details (name, specialty, avatar)
  - Selected date (formatted in Portuguese)
  - Selected time
  - Focus area (pillar + topic)
- **Actions:**
  - Back button (returns to date/time selection)
  - Confirm button (creates booking)
- **Translation keys:** `user:booking.directFlow.confirmTitle`

### Key Features
- ✅ Complete pillar type mapping (`BookingPillar` ↔ topic pillar IDs)
- ✅ All text uses i18n translations (PT/EN)
- ✅ Pre-diagnostic chat stored in database
- ✅ Provider automatically assigned based on pillar
- ✅ Full booking creation and confirmation

---

## 🎯 Flow 2: BookingFlow (`/user/book`)

**Route:** `/user/book`  
**Component:** `src/components/booking/BookingFlow.tsx`

### Purpose
A streamlined booking flow with special handling for legal pillar (AI vs Human choice).

### Flow Steps

```
Step 1: Pillar Selection
    ↓
[If Legal Pillar Selected]
    ↓
Step 2a: Specialist Choice (AI vs Human)
    ↓
    [If AI] → Legal Assessment Flow → Complete
    [If Human] → Provider Assignment → Date/Time → Confirmation
    
[If Other Pillars Selected]
    ↓
Step 2b: Provider Assignment (automatic)
    ↓
Step 3: Date & Time Selection
    ↓
Step 4: Confirmation
    ↓
    [If Legal] → Pre-Diagnostic CTA (optional)
    [Otherwise] → Navigate to Dashboard
```

### Special Legal Pillar Handling

#### **Legal AI Path**
- User chooses "Assistente Jurídico AI"
- Enters `LegalAssessmentFlow` component
- Topic selection → Symptom selection → AI chat
- No provider assigned, no date/time selection
- Completes directly to dashboard

#### **Legal Human Path**
- User chooses "Especialista Humano"
- Provider assigned automatically
- Proceeds to date/time → confirmation
- After confirmation, shows optional "Pre-Diagnostic CTA"
- User can choose to do AI pre-diagnostic or skip

### Key Features
- ✅ Special legal pillar routing
- ✅ AI vs Human specialist choice
- ✅ Post-booking pre-diagnostic CTA for legal
- ✅ All text uses i18n translations (PT/EN)

---

## 🔧 Utility Functions

### `src/utils/pillarMapping.ts`

**Purpose:** Converts between `BookingPillar` types and topic pillar IDs

```typescript
// BookingPillar → Topic Pillar ID
getTopicPillarId('psicologica') // → 'saude_mental'
getTopicPillarId('fisica')      // → 'bem_estar_fisico'
getTopicPillarId('financeira')  // → 'assistencia_financeira'
getTopicPillarId('juridica')    // → 'assistencia_juridica'

// Topic Pillar ID → BookingPillar
getBookingPillar('saude_mental')              // → 'psicologica'
getBookingPillar('bem_estar_fisico')          // → 'fisica'
getBookingPillar('assistencia_financeira')    // → 'financeira'
getBookingPillar('assistencia_juridica')      // → 'juridica'
```

---

## 📝 Translation Keys

### Direct Flow Keys (`user:booking.directFlow.*`)

```json
{
  "pillarTitle": "Qual dos quatro pilares deseja acessar?",
  "pillarSubtitle": "Escolha a área onde precisa de apoio especializado",
  "pillars": {
    "psicologica": { "title": "...", "description": "..." },
    "fisica": { "title": "...", "description": "..." },
    "financeira": { "title": "...", "description": "..." },
    "juridica": { "title": "...", "description": "..." }
  },
  "selectTopic": "Selecione um Tópico",
  "topicSubtitle": "Escolha o tópico que melhor descreve a sua situação",
  "chatTitle": "Conte-nos mais sobre a sua situação",
  "chatSubtitle": "As suas respostas ajudarão o especialista a preparar-se melhor",
  "chatWelcome": "Olá! Vou ajudá-lo com {{topic}}...",
  "chatAcknowledge": "Obrigado por partilhar...",
  "chatPlaceholder": "Escreva aqui os detalhes...",
  "conversation": "Conversa",
  "providerAssigned": "Especialista Atribuído",
  "providerAssignedSubtitle": "Encontrámos o melhor especialista para si",
  "matchFound": "Correspondência Encontrada!",
  "matchFoundDesc": "Com base na sua área de necessidade...",
  "providerExpertise": "Especialista em {{pillar}}...",
  "selectDateTime": "Selecionar Data e Hora",
  "confirmTitle": "Confirmar a Sua Sessão",
  "confirmSubtitle": "Por favor, reveja os detalhes...",
  "sessionDetails": "Detalhes da Sessão",
  "date": "Data",
  "time": "Hora",
  "focusArea": "Área de Foco",
  "confirmBooking": "Confirmar Marcação",
  "confirming": "A confirmar..."
}
```

### Standard Flow Keys (`user:booking.*`)

```json
{
  "choosePillar": "Escolha a Área de Apoio",
  "pillarSubtitle": "Selecione a área onde precisa de ajuda",
  "specialistChoice": {
    "title": "Como deseja receber ajuda?",
    "subtitle": "Escolha entre assistente AI ou especialista humano",
    "aiTitle": "Assistente Jurídico AI",
    "aiDescription": "Obtenha respostas imediatas...",
    "aiButton": "Experimentar Assistente Inteligente",
    "humanTitle": "Especialista Humano",
    "humanDescription": "Agende uma consulta personalizada...",
    "humanButton": "Falar com um Especialista"
  },
  "dateTime": {
    "title": "Escolha uma Data e Horário",
    "subtitle": "Selecione o dia e horário para a sua sessão de {{pillar}}",
    "confirmSession": "Confirmar Sessão"
  },
  "confirmation": {
    "title": "Confirmar Agendamento",
    "provider": "Prestador:",
    "specialty": "Especialidade:",
    "date": "Data:",
    "time": "Hora:",
    "confirm": "Confirmar Sessão"
  },
  "preDiagnostic": {
    "successTitle": "Sessão Agendada com Sucesso!",
    "helpTitle": "Ajude o especialista a preparar sua consulta",
    "startButton": "Fazer Pré-Diagnóstico",
    "skipButton": "Pular por Agora"
  }
}
```

### Topic Translation Keys

**Pattern:** `user:topics.{pillarId}.{topicId}.{key}`

```json
"topics": {
  "saude_mental": {
    "anxiety": {
      "name": "Ansiedade",
      "description": "Preocupação excessiva e tensão"
    },
    "depression": { "name": "...", "description": "..." }
    // ... more topics
  },
  "bem_estar_fisico": { /* ... */ },
  "assistencia_financeira": { /* ... */ },
  "assistencia_juridica": { /* ... */ }
}
```

---

## 🗄️ Database Schema

### `chat_sessions` Table
```sql
- id: uuid (primary key)
- user_id: uuid (nullable for guests)
- pillar: text (stores topic pillar ID: 'saude_mental', etc.)
- status: text ('active', 'completed', 'escalated')
- ai_resolution: boolean
- created_at: timestamp
```

### `chat_messages` Table
```sql
- id: uuid (primary key)
- session_id: uuid (foreign key to chat_sessions)
- role: text ('user' or 'assistant')
- content: text
- created_at: timestamp
```

---

## ✅ Testing Checklist

### DirectBookingFlow (`/user/book-session`)
- [ ] Pillar selection displays all 4 pillars with correct translations
- [ ] Topic selection shows correct topics for each pillar
- [ ] Pre-diagnostic chat initializes correctly
- [ ] Chat messages save to database
- [ ] Provider is automatically assigned after chat
- [ ] Date/time selection works
- [ ] Confirmation shows all correct details
- [ ] Booking creates successfully
- [ ] All text displays correctly in PT and EN

### BookingFlow (`/user/book`)
- [ ] Legal pillar shows AI vs Human choice
- [ ] Legal AI path enters assessment flow correctly
- [ ] Legal Human path assigns provider and continues to booking
- [ ] Other pillars skip specialist choice and auto-assign provider
- [ ] Date/time selection works
- [ ] Confirmation shows all correct details
- [ ] Legal bookings show pre-diagnostic CTA
- [ ] Non-legal bookings navigate to dashboard
- [ ] All text displays correctly in PT and EN

---

## 🔍 Common Issues & Solutions

### Issue: Translation keys not found
**Solution:** Ensure namespace is correctly specified: `t('user:booking.key')` not `t('booking.key')`

### Issue: Wrong topics displayed for pillar
**Solution:** Check that `getTopicPillarId()` is used to convert `BookingPillar` to topic pillar ID

### Issue: Provider not assigned
**Solution:** Verify `mockProviders` data has providers with matching pillar IDs (`saude_mental`, etc.)

### Issue: Chat session not created
**Solution:** Check that user authentication is working (or allow null `user_id` for guests)

---

## 📊 Component Dependency Tree

```
DirectBookingFlow
├── PillarSelection
├── TopicSelection
│   └── topicsData.ts
├── PreDiagnosticChat
│   ├── BookingBanner
│   └── Supabase (chat_sessions, chat_messages)
├── ProviderAssignmentStep
│   └── mockProviders
├── CalendarStep
│   └── BookingCalendar
└── ConfirmationStep

BookingFlow
├── PillarSelection
├── Specialist Choice (legal only)
├── LegalAssessmentFlow
│   ├── TopicSelection (legal)
│   ├── SymptomSelection
│   ├── AssessmentResult
│   └── LegalChatInterface
├── PreDiagnosticChat (legal, post-booking)
├── Provider Assignment (automatic)
├── Date/Time Selection
└── Confirmation
```

---

**Last Updated:** 2025-10-08  
**Status:** ✅ Complete and Verified
