# Database Schema - Table Count Audit

## Current Status: 21 Tables ✅

### What You Have Now

**Public Schema (21 tables)**:

**Auth/Identity** (1):
- ✅ `profiles`
- ❌ `email_verification_tokens` - MISSING
- ❌ `password_reset_tokens` - MISSING
- ❌ `terms_acceptance` - MISSING
- ❌ `audit_logs` - MISSING

**Chat/Messaging** (2):
- ✅ `chat_sessions`
- ✅ `chat_messages`

**Bookings/Sessions** (1):
- ✅ `bookings`

**Feedback** (1):
- ✅ `feedback`

**Providers/Specialists** (1):
- ✅ `prestadores`

**Company Management** (4):
- ✅ `companies`
- ✅ `company_employees`
- ✅ `company_organizations`
- ❌ `company_subscription_plans` - MISSING
- ❌ `company_subscriptions` - MISSING
- ❌ `company_verification` - MISSING

**User Management** (3):
- ✅ `user_roles`
- ✅ `user_progress`
- ✅ `user_milestones`

**Specialist Management** (2):
- ✅ `specialist_assignments`
- ✅ `specialist_analytics`
- ❌ `specialist_documents` - MISSING
- ❌ `specialist_rates` - MISSING
- ❌ `specialist_working_hours` - MISSING

**Notifications** (1):
- ✅ `notifications`
- ❌ `email_templates` - MISSING
- ❌ `notification_preferences` - MISSING
- ❌ `communication_logs` - MISSING
- ❌ `booking_reminders` - MISSING

**Resources** (1):
- ✅ `resources`

**Analytics/Compliance** (0):
- ❌ `monthly_analytics` - MISSING
- ❌ `pillar_analytics` - MISSING
- ❌ `user_activity_logs` - MISSING
- ❌ `company_dpa_acceptance` - MISSING
- ❌ `data_retention_policies` - MISSING

**Advanced Sessions** (0):
- ❌ `booking_cancellations` - MISSING
- ❌ `booking_packages` - MISSING
- ❌ `recurring_bookings` - MISSING
- ❌ `session_notes` - MISSING
- ❌ `meeting_recordings` - MISSING
- ❌ `specialist_availability_exceptions` - MISSING

**Other** (0):
- ❌ `admin_logs` - EXISTS but should be `audit_logs`
- ❌ `failed_login_attempts` - MISSING
- ❌ `session_tokens` - MISSING
- ❌ `system_settings` - MISSING
- ❌ `feature_flags` - MISSING

---

## According to the Plan

**Phases**:
- **Phase 1**: 11 core tables (auth, specialist, company basics)
- **Phase 2**: +7 tables (email verification, password reset, booking enhancements)
- **Phase 3**: +5 tables (invitations, notifications, reminders, security)
- **Phase 4**: +7 tables (compliance, analytics)
- **Phase 5**: +6 tables (advanced sessions, availability)

**Total Expected**: ~30-35 tables by end of Phase 5

---

## What's Missing

### Critical (Phase 1-2):
- ❌ `email_verification_tokens` 
- ❌ `password_reset_tokens`
- ❌ `specialist_documents`
- ❌ `specialist_rates`
- ❌ `specialist_working_hours`
- ❌ `company_subscription_plans`
- ❌ `company_subscriptions`
- ❌ `company_verification`

### Important (Phase 3):
- ❌ `email_templates`
- ❌ `notification_preferences`
- ❌ `communication_logs`
- ❌ `booking_reminders`
- ❌ `audit_logs` (have `admin_logs` but should be standardized)

### Compliance (Phase 4):
- ❌ `monthly_analytics`
- ❌ `pillar_analytics`
- ❌ `user_activity_logs`
- ❌ `company_dpa_acceptance`
- ❌ `data_retention_policies`

### Advanced (Phase 5):
- ❌ `booking_cancellations`
- ❌ `booking_packages`
- ❌ `recurring_bookings`
- ❌ `session_notes`
- ❌ `meeting_recordings`
- ❌ `specialist_availability_exceptions`

### Security (scattered):
- ❌ `failed_login_attempts`
- ❌ `session_tokens`
- ❌ `system_settings`
- ❌ `feature_flags`

---

## Status Summary

```
Current: 21 tables
Expected by Phase 5: 35-40 tables
Missing: ~15-20 tables

Progress: ~50-60%
```

---

## Recommendation

The image you showed suggests these 5 tables are the **foundation**:
- `companies`
- `company_employees`
- `invites` (partial - has company_employees)
- `profiles`
- `user_roles`

But you're missing several critical tables from Phases 1-3 that are needed for the app to function properly. You should prioritize:

1. **Next: Phase 1-2 Missing Tables** (highest priority)
   - `specialist_documents`, `specialist_rates`, `specialist_working_hours`
   - `company_subscription_plans`, `company_subscriptions`
   - `email_verification_tokens`, `password_reset_tokens`

2. **Then: Phase 3 Notification Tables** (medium priority)
   - `email_templates`, `notification_preferences`, `communication_logs`

3. **Then: Phase 4-5 Advanced Tables** (can defer slightly)
   - Analytics, compliance, and advanced sessions tables

---

## Is It Correct?

**Partially**. You have the **core foundation** correct, but you're missing about **50% of the planned tables**.

This is fine for now if you're still in Phase 1-2, but you'll need to add the missing tables soon to avoid refactoring later.
