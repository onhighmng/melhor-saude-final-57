# Specialist Session Completion - UI Guide

## Complete UI Flow with All Buttons

### **Step 1: Navigate to Sessions**

The specialist has **TWO entry points**:

#### **Option A: From Dashboard**
- URL: `/prestador` (Prestador Dashboard)
- Shows upcoming sessions in a timeline view
- Each session is displayed as a **clickable card**
- Click on any session → Opens Session Detail Page

#### **Option B: From Sessions List**
- URL: `/prestador/sessions` (Prestador Sessions)
- Shows comprehensive list of all sessions
- Filters available: Date, Status
- Each session is displayed as a **clickable row**
- Click on any session → Opens Session Detail Page

---

### **Step 2: Session List View (Sessions Page)**

**What the specialist sees:**

```
┌─────────────────────────────────────────────────────┐
│  Prestador Sessions                                 │
├─────────────────────────────────────────────────────┤
│  Filters:  [All Dates ▼]  [All Status ▼]          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ João Silva                     [Virtual] 🟢  │  │
│  │ Empresa XYZ | 15:00 | ⭐⭐⭐⭐⭐              │  │
│  │ Saúde Mental - 05/11/2025                   │  │
│  │ [Badge: Agendada]                           │  │
│  └──────────────────────────────────────────────┘  │
│       ↑ CLICK HERE TO OPEN DETAILS                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ Maria Santos                   [Presencial]  │  │
│  │ Empresa ABC | 16:30 | ⭐⭐⭐⭐                │  │
│  │ Bem-Estar Físico - 05/11/2025               │  │
│  │ [Badge: Confirmada]                         │  │
│  └──────────────────────────────────────────────┘  │
│       ↑ CLICK HERE TO OPEN DETAILS                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### **Step 3: Session Detail Page (Where Actions Happen)**

**URL:** `/prestador/sessions/:id`

**What the specialist sees:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back to Sessions                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────┐  ┌──────────────────────────────────┐ │
│  │  Session Information    │  │  AÇÕES DA SESSÃO                 │ │
│  │  ─────────────────────  │  │  ───────────────                 │ │
│  │                         │  │                                   │ │
│  │  👤 Cliente:            │  │  ┌────────────────────────────┐  │ │
│  │     João Silva          │  │  │  ▶  Iniciar Sessão         │  │ │
│  │                         │  │  └────────────────────────────┘  │ │
│  │  🏢 Empresa:            │  │       (Only for online sessions) │ │
│  │     Empresa XYZ         │  │                                   │ │
│  │                         │  │  ┌────────────────────────────┐  │ │
│  │  📅 Data:               │  │  │  ✓  Concluir               │  │ │ 
│  │     05/11/2025          │  │  └────────────────────────────┘  │ │
│  │                         │  │       ← THIS IS THE BUTTON!      │ │
│  │  🕐 Hora:               │  │                                   │ │
│  │     15:00 - 16:00       │  │  ┌────────────────────────────┐  │ │
│  │                         │  │  │  ⚠  Falta                  │  │ │
│  │  🎯 Pilar:              │  │  └────────────────────────────┘  │ │
│  │     Saúde Mental        │  │                                   │ │
│  │                         │  │  ┌────────────────────────────┐  │ │
│  │  📍 Local:              │  │  │  ✕  Cancelar               │  │ │
│  │     Online              │  │  └────────────────────────────┘  │ │
│  │                         │  │                                   │ │
│  │  📝 Notas:              │  │  ──────────────────────────────  │ │
│  │     [Text area]         │  │  ESTADO DA SESSÃO                │ │
│  │                         │  │                                   │ │
│  │  [Guardar Notas]        │  │  Estado Atual: [Confirmada]      │ │
│  │                         │  │                                   │ │
│  └─────────────────────────┘  └──────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

### **Step 4: Click the "Concluir" Button**

**Button Details:**
- **Label:** "Concluir" (Complete)
- **Icon:** ✓ CheckCircle
- **Color:** Primary (Blue)
- **Size:** Large (`size="lg"`)
- **Full Width:** Yes
- **Location:** Right panel, "Ações da Sessão" section
- **Visibility:** Only shown when `canComplete = true`

**When is it visible?**
- Session time has passed (current time > end_time)
- Session status is NOT 'completed', 'cancelled', or 'no_show'
- Calculated by: `canComplete = !session.completed && sessionTime < now`

---

### **Step 5: What Happens After Clicking**

**Immediate UI Feedback:**
```
1. Toast notification appears:
   ┌────────────────────────────┐
   │  ✓ Sessão concluída        │
   │  Estado atualizado com     │
   │  sucesso                   │
   └────────────────────────────┘

2. Button disappears (no longer `canComplete`)

3. Status badge updates:
   [Confirmada] → [Concluída]

4. New info box appears:
   ┌────────────────────────────┐
   │  ✓ Quota já deduzida       │
   └────────────────────────────┘
```

**Database Actions (Automatic):**
1. ✅ Booking status → `'completed'`
2. ✅ User progress entry created
3. ✅ First session milestone marked (if applicable)
4. ✅ Notification sent to user
5. ✅ Session quota deducted from user's balance
6. ✅ Company quota updated

---

### **Alternative: Dashboard Quick Action**

On the **Prestador Dashboard** (`/prestador`), there's also a quick completion:

```
Today's Sessions:
┌──────────────────────────────────┐
│  15:00 - João Silva              │
│  Saúde Mental                    │
│  [Concluir] [Falta] [Ver]       │  ← Quick action buttons
└──────────────────────────────────┘
```

**Code reference:**
```typescript
const handleSessionAction = (sessionId: string, action: 'concluir' | 'falta' | 'cancelar' | 'detalhes') => {
  if (action === 'concluir') {
    // Updates session status to 'completed'
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, status: 'concluida' as const }
        : session
    ));
    toast.success('Sessão marcada como concluída');
  }
}
```

---

## Visual Button Reference

### **"Concluir" Button (Main Action)**
```typescript
<Button onClick={completeSession} className="w-full gap-2" size="lg">
  <CheckCircle className="h-5 w-5" />
  Concluir
</Button>
```

**Appearance:**
- Full width button
- Blue background
- White text
- Checkmark icon
- Large padding

### **Other Available Actions:**

1. **"Iniciar Sessão"** (Start Session - Online only)
   - Icon: ▶ Play
   - Action: Changes status to 'in-progress'

2. **"Falta"** (No-Show)
   - Icon: ⚠ AlertTriangle
   - Color: Yellow
   - Opens dialog to record reason

3. **"Cancelar"** (Cancel)
   - Icon: ✕ XCircle
   - Color: Red
   - Opens confirmation dialog

---

## Navigation Paths

### **To Reach Session Detail Page:**

1. **From Sidebar:**
   - Click "Sessões" → Shows sessions list → Click any session

2. **From Dashboard:**
   - See upcoming sessions → Click on session card

3. **From URL:**
   - Direct: `/prestador/sessions/:session-id`

### **Back Navigation:**
- "← Back to Sessions" button at top
- Browser back button
- Sidebar navigation

---

## Mobile View

On mobile devices, the layout stacks vertically:

```
┌──────────────────────┐
│  Session Info        │
│  [Full width]        │
└──────────────────────┘

┌──────────────────────┐
│  [Iniciar Sessão]    │
└──────────────────────┘

┌──────────────────────┐
│  [Concluir] ← HERE   │
└──────────────────────┘

┌──────────────────────┐
│  [Falta]             │
└──────────────────────┘

┌──────────────────────┐
│  [Cancelar]          │
└──────────────────────┘
```

---

## Summary: Quick Reference

| Action | Location | Button Label | Icon | Color |
|--------|----------|-------------|------|-------|
| **Complete Session** | Session Detail → Right Panel | "Concluir" | ✓ | Blue |
| Start Session | Session Detail → Right Panel | "Iniciar Sessão" | ▶ | Blue |
| Mark No-Show | Session Detail → Right Panel | "Falta" | ⚠ | Yellow |
| Cancel | Session Detail → Right Panel | "Cancelar" | ✕ | Red |
| View Details | Sessions List | Click Row | - | - |

---

## Key Files

- **Session Detail Page:** `src/pages/PrestadorSessionDetail.tsx` (line 238-250)
- **Sessions List:** `src/pages/PrestadorSessions.tsx`
- **Dashboard:** `src/pages/PrestadorDashboard.tsx`
- **Session Cards:** `src/components/ui/ruixen-feature-section.tsx`

---

## Testing Checklist

✅ Login as prestador  
✅ Navigate to `/prestador/sessions`  
✅ Click on any confirmed session  
✅ Verify "Concluir" button is visible  
✅ Click "Concluir"  
✅ Verify toast appears  
✅ Verify status changes to "Concluída"  
✅ Verify user receives notification  
✅ Verify quota is deducted  




