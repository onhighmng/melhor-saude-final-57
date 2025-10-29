# ⚡️ AUTO-PHASE SPEC-KIT BUILD SCRIPT

When you run it once in Cursor, it'll walk through the entire Spec Kit pipeline with minimal manual intervention.

## Prompt for Cursor AI:

You are now the Cursor Build Agent operating in sequential autonomous mode. Your task is to read the plan file `admin-especialista-revamp.plan.md`, implement all remaining issues from the comprehensive platform audit, and execute each phase until the entire project is complete.

If a phase fails, stalls, or outputs less than expected (for example, only ~5% complete), automatically re-load the plan and continue where you left off — without repeating already-built files.

Follow this workflow:

---

### 🧩 STEP 1 — PLAN
Read `admin-especialista-revamp.plan.md`. Understand all 16 remaining issues across Phases 1-4. Generate a clear implementation strategy.

---

### 🏗️ STEP 2 — PHASE 1: CRITICAL BACKEND
Implement 4 critical backend features:
- Company deletion with RPC handlers ✅ (migration already created)
- Specialist matching backend persistence ✅ (migration already created)
- Provider financial data tracking ✅ (migration already created)
- Employee edit/remove functionality

Execute the UI handlers and handlers needed for each feature.
Confirm: ✅ **Phase 1 complete**

---

### 🧹 STEP 3 — PHASE 2: REMOVE MOCK DATA
Remove all mock data from 5 files:
- `src/pages/AdminUsersManagement.tsx` - Replace mock employees
- `src/components/booking/ReferralBookingFlow.tsx` - Replace mock providers
- `src/components/mental-health-assessment/PreDiagnosticModal.tsx` - Remove mock fallback
- `src/pages/UserSettings.tsx` - Replace mock providers and notifications

Execute database queries to replace mock data.
Confirm: ✅ **Phase 2 complete**

---

### 🎨 STEP 4 — PHASE 3: PROFILE EDITING
Implement profile editing for 2 user types:
- User profile editing in `src/pages/AdminUserDetail.tsx`
- Provider profile editing in `src/pages/AdminUserDetail.tsx`

Create edit dialogs and handlers.
Confirm: ✅ **Phase 3 complete**

---

### 🔄 STEP 5 — PHASE 4: REAL-TIME
Add real-time subscriptions to 4 admin pages:
- `src/pages/AdminDashboard.tsx`
- `src/pages/PrestadorSessions.tsx`
- `src/components/admin/AdminCompaniesTab.tsx`
- `src/components/admin/AdminEmployeesTab.tsx`

Confirm: ✅ **Phase 4 complete**

---

### 🔍 STEP 6 — VERIFY & FIX
Cross-check all implemented files from the plan.
Run type validation and ensure imports are correct.
Test key flows.
Print summary.

---

### 🛠️ STEP 7 — AUTO-RESUME GUARD
If any phase stopped early or built less than expected, automatically re-load the plan file and continue building the remaining issues until 100% completion.

Do not summarize or stop until every issue from the plan is implemented.

---

### 🧠 EXECUTION NOTES
- Always keep `admin-especialista-revamp.plan.md` in context
- Prefer smaller batched writes if token limits are reached
- Never mark a phase as "complete" unless all issues in that phase are implemented
- Always preserve existing code — improve or append, never overwrite functional code
- Use the components already created (LoadingSpinner, SkeletonLoader, EmptyState, ConfirmDialog)

---

**Final output when done:**
```
🎯 Full remaining issues implementation executed successfully.
All files from plan implemented and verified.
Platform 100% production-ready (28/28 issues completed).
```

💡 How to Use

Save this as `src/utils/cursor_build_prompts.md`

In Cursor, reference this file when asking to implement the remaining issues. The AI will automatically:
- Read all specs
- Execute each phase
- Verify completion
- Resume automatically if partial

