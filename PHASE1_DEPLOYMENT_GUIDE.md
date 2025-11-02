# Phase 1 Deployment Guide - Schema Build Out

## Overview

**Phase 1 adds 10 new tables** to complete the core schema foundation from the `end.plan.md`.

**New tables**: 10  
**Total tables after Phase 1**: 31  
**Progress**: ~60-70% complete

---

## New Tables (10)

### Auth/Identity (4 tables)
- `email_verification_tokens` - Email verification during signup
- `password_reset_tokens` - Secure password reset flow
- `terms_acceptance` - Track GDPR/DPA acceptance
- `audit_logs` - Comprehensive action audit trail

### Specialist (3 tables)
- `specialist_documents` - Licenses, certifications, verification
- `specialist_rates` - Hourly rates and booking constraints
- `specialist_working_hours` - Availability schedule (day/time/breaks)

### Company (3 tables)
- `company_subscription_plans` - Tier definitions (Free/Starter/Business/Enterprise)
- `company_subscriptions` - Company → plan assignments (non-billing)
- `company_verification` - Compliance and verification status

---

## Migration Files

### To Deploy (3 files)

1. **`20251102_phase1_auth_identity.sql`** (4 tables)
   - `email_verification_tokens`
   - `password_reset_tokens`
   - `terms_acceptance`
   - `audit_logs`

2. **`20251102_phase1_specialist_tables.sql`** (3 tables)
   - `specialist_documents`
   - `specialist_rates`
   - `specialist_working_hours`

3. **`20251102_phase1_company_subscription.sql`** (3 tables + seeding)
   - `company_subscription_plans`
   - `company_subscriptions`
   - `company_verification`
   - Includes seed data for 4 default plans

---

## Deployment Steps

### Step 1: Backup Database
```bash
# In Supabase Dashboard:
# Project Settings → Backups → Request backup
```

### Step 2: Deploy Migrations

Go to **Supabase Dashboard → SQL Editor** and run each migration:

**First**: Auth/Identity
```sql
-- Copy & paste from: 20251102_phase1_auth_identity.sql
-- Click: Run
```

**Second**: Specialist Tables
```sql
-- Copy & paste from: 20251102_phase1_specialist_tables.sql
-- Click: Run
```

**Third**: Company Subscription
```sql
-- Copy & paste from: 20251102_phase1_company_subscription.sql
-- Click: Run (includes seed data for plans)
```

### Step 3: Verify Deployment

Run in SQL Editor:
```sql
-- Check all Phase 1 tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN (
  'email_verification_tokens',
  'password_reset_tokens',
  'terms_acceptance',
  'audit_logs',
  'specialist_documents',
  'specialist_rates',
  'specialist_working_hours',
  'company_subscription_plans',
  'company_subscriptions',
  'company_verification'
)
ORDER BY table_name;

-- Should return 10 rows
```

Verify seed data:
```sql
-- Check subscription plans were seeded
SELECT tier, name, max_employees FROM company_subscription_plans
ORDER BY tier;

-- Should return 4 rows: free, starter, business, enterprise
```

### Step 4: Check RLS & Policies

```sql
-- Verify RLS is enabled on all tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'email_verification_tokens', 'password_reset_tokens', 'terms_acceptance',
    'specialist_documents', 'specialist_rates', 'specialist_working_hours',
    'company_subscription_plans', 'company_subscriptions', 'company_verification'
  );

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
  'email_verification_tokens', 'password_reset_tokens', 'terms_acceptance',
  'specialist_documents', 'specialist_rates', 'specialist_working_hours',
  'company_subscriptions', 'company_verification'
)
GROUP BY tablename;
```

---

## What's Next

### Phase 2 (Days 4-7)
Will add:
- Edge Functions for email verification and password reset
- Booking integrity enhancements

### Phase 3 (Week 2)
Will add:
- Invitation system
- Notification tables and email templates
- Booking reminders with pg_cron

### Phase 4 (Week 3)
Will add:
- Compliance tracking
- Analytics tables

### Phase 5 (Week 4)
Will add:
- Advanced sessions (cancellations, packages, recurring)
- Session notes and recordings

---

## Key Features

### Auth/Identity
- ✅ Secure email verification with token expiry
- ✅ Password reset with one-time tokens
- ✅ GDPR/DPA acceptance tracking
- ✅ Full audit trail for compliance

### Specialist Onboarding
- ✅ Document upload and verification workflow
- ✅ Rate management with constraints
- ✅ Availability scheduling with breaks
- ✅ Blocks bookings until verified

### Company Plans (No Payments)
- ✅ 4 tier-based plans (Free/Starter/Business/Enterprise)
- ✅ Employee limits per plan
- ✅ Sessions per employee per month quotas
- ✅ Verification status tracking
- ✅ All data, NO payment processing

---

## Security Notes

### RLS Policies
- ✅ All tables have row-level security enabled
- ✅ Users can only access own data
- ✅ Admins can access all data
- ✅ Company employees can access company data

### Data Protection
- ✅ PII in audit_logs is sensitive
- ✅ Token tables auto-clean on user deletion
- ✅ Verification documents are versioned
- ✅ All timestamps in UTC

---

## Rollback Plan (if needed)

If something goes wrong:

```sql
-- Drop all Phase 1 tables
DROP TABLE IF EXISTS public.company_verification CASCADE;
DROP TABLE IF EXISTS public.company_subscriptions CASCADE;
DROP TABLE IF EXISTS public.company_subscription_plans CASCADE;
DROP TABLE IF EXISTS public.specialist_working_hours CASCADE;
DROP TABLE IF EXISTS public.specialist_rates CASCADE;
DROP TABLE IF EXISTS public.specialist_documents CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.terms_acceptance CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.email_verification_tokens CASCADE;
```

---

## Testing Checklist

After deployment:

- [ ] All 10 tables exist in database
- [ ] 4 subscription plans seeded
- [ ] RLS policies enabled on all tables
- [ ] Admin can view all data
- [ ] Users can only view own data
- [ ] No errors in Supabase logs
- [ ] Indexes created for performance
- [ ] Foreign keys properly constrained

---

## Estimated Time

- **Deployment**: 5-10 minutes
- **Verification**: 5 minutes
- **Testing**: 10-15 minutes
- **Total**: ~20-30 minutes

---

## Next Actions

1. ✅ Deploy Phase 1 migrations
2. ✅ Verify tables and seed data
3. ⏭️ Start Phase 2 (Edge Functions for auth flows)
4. ⏭️ Build frontend forms to use new tables

All migration files are ready in `/supabase/migrations/` 🚀
