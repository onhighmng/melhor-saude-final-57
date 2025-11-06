# 📋 Figma Mobile Implementation Plan

## 🎯 Systematic Implementation Strategy

### Phase 1: User Pages (12 remaining)
### Phase 2: Company Pages (4 remaining)
### Phase 3: Specialist Pages (8 remaining)
### Phase 4: Admin Pages (4 remaining)

---

## 👤 USER PAGES MAPPING (12 pages)

| # | Figma Component | Current Route | Mobile Component Name | Status |
|---|-----------------|---------------|----------------------|---------|
| 1 | AgendarPage | `/user/book` | MobileUserBooking | ❌ TODO |
| 2 | PercursoPage | `/user/sessions` | MobileUserSessions | ❌ TODO |
| 3 | RecursosPage | `/user/resources` | MobileUserResources | ❌ TODO |
| 4 | ChatPage | `/user/chat` (new) | MobileUserChat | ❌ TODO |
| 5 | SettingsPage | `/user/settings` | MobileUserSettings | ❌ TODO |
| 6 | SelectTopicPage | Part of booking | MobileSelectTopic | ❌ TODO |
| 7 | SelectSymptomsPage | Part of booking | MobileSelectSymptoms | ❌ TODO |
| 8 | PreDiagnosisResultPage | Part of booking | MobilePreDiagnosis | ❌ TODO |
| 9 | ChatBotPage | Part of booking | MobileChatBot | ❌ TODO |
| 10 | SpecialistMatchedPage | Part of booking | MobileSpecialistMatched | ❌ TODO |
| 11 | BookingCalendarPage | Part of booking | MobileBookingCalendar | ❌ TODO |
| 12 | BookingConfirmationPage | Part of booking | MobileBookingConfirmation | ❌ TODO |

---

## 🏢 COMPANY PAGES MAPPING (4 pages)

| # | Figma Component | Current Route | Mobile Component Name | Status |
|---|-----------------|---------------|----------------------|---------|
| 1 | EmployeeManagement | `/company/colaboradores` | MobileCompanyEmployees | ❌ TODO |
| 2 | ReportsPage | `/company/relatorios` | MobileCompanyReports | ❌ TODO |
| 3 | ResourcesPage | `/company/recursos` | MobileCompanyResources | ❌ TODO |
| 4 | SessionsPage | `/company/sessions` | MobileCompanySessions | ❌ TODO |

---

## 🩺 SPECIALIST PAGES MAPPING (8 pages)

| # | Figma Component | Current Route | Mobile Component Name | Status |
|---|-----------------|---------------|----------------------|---------|
| 1 | call-requests | `/especialista/call-requests` | MobileSpecialistCalls | ❌ TODO |
| 2 | sessions | `/especialista/sessions` | MobileSpecialistSessions | ❌ TODO |
| 3 | settings | `/especialista/settings` | MobileSpecialistSettings | ❌ TODO |
| 4 | statistics | `/especialista/stats` | MobileSpecialistStats | ❌ TODO |
| 5 | user-history | `/especialista/user-history` | MobileSpecialistHistory | ❌ TODO |
| 6 | desktop-calls | Mobile version of calls | Part of MobileSpecialistCalls | ❌ TODO |
| 7 | desktop-sessions | Mobile version | Part of MobileSpecialistSessions | ❌ TODO |
| 8 | desktop-layout | Layout component | Mobile layout utility | ❌ TODO |

---

## ⚙️ ADMIN PAGES MAPPING (4 pages)

| # | Figma Component | Current Route | Mobile Component Name | Status |
|---|-----------------|---------------|----------------------|---------|
| 1 | AdminReports | `/admin/reports` | MobileAdminReports | ❌ TODO |
| 2 | AdminResources | `/admin/resources` | MobileAdminResources | ❌ TODO |
| 3 | AdminSessions | `/admin/operations` | MobileAdminSessions | ❌ TODO |
| 4 | AdminTeam | `/admin/users-management` | MobileAdminTeam | ❌ TODO |

---

## 📝 Implementation Steps (Per Page)

### For Each Page:

1. ✅ Read original Figma component
2. ✅ Create new mobile component in `src/components/mobile/{usertype}/`
3. ✅ Connect to existing data hooks (useBookings, useAuth, etc.)
4. ✅ Map all buttons to existing navigation/actions
5. ✅ Create responsive wrapper in `src/pages/`
6. ✅ Update App.tsx routing
7. ✅ Test compilation
8. ✅ Verify functionality

---

## ⚠️ Critical Requirements

### Must Preserve:
- ✅ All routing paths (no changes)
- ✅ All button functionality (same actions as desktop)
- ✅ All data fetching (use existing hooks)
- ✅ All authentication (preserve protected routes)
- ✅ All navigation (same flow as desktop)

### Must Change:
- ✅ Visual design only (Figma mobile UI)
- ✅ Layout for mobile screens
- ✅ Touch-optimized interactions

---

## 🎯 Success Criteria

- [ ] All 28 pages compile without errors
- [ ] All pages switch automatically at 768px
- [ ] All buttons work identically to desktop
- [ ] All data displays correctly
- [ ] All navigation flows work
- [ ] Desktop remains 100% untouched
- [ ] Mobile shows Figma designs

---

## 📊 Progress Tracker

**Total**: 28 pages to implement  
**Completed**: 0/28  
**In Progress**: 0  
**Remaining**: 28  

**Estimated Time**: 2-3 hours (methodical implementation)

