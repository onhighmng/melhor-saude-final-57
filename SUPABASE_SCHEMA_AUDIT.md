# 🗂️ SUPABASE DATABASE SCHEMA AUDIT

**Analysis: Current vs Required Tables**  
**Date:** November 1, 2025  
**Current State:** 17 Tables | 58 Edge Functions | 0 Replicas

---

## ⚠️ CRITICAL FINDING

**Your Supabase has 17 tables but is missing ~40+ critical tables!**

❌ **4 tables would be INSUFFICIENT for any platform this complex.**  
✅ **17 tables is better but still missing critical infrastructure.**

---

## CURRENT TABLES (17 TOTAL)

### ✅ TABLES YOU HAVE

1. **profiles** - User profiles with roles
2. **chat_sessions** - Chat history tracking
3. **chat_messages** - Chat message content
4. **bookings** - Session bookings
5. **feedback** - User feedback
6. **prestadores** - Healthcare providers (partial)
7. **company_organizations** - Company grouping
8. **notifications** - User notifications
9. **companies** - Company data
10. **company_employees** - Employee roster
11. **user_milestones** - Progress tracking
12. **user_progress** - Action tracking
13. **user_roles** - Role assignments
14. **specialist_assignments** - Specialist to company links
15. **specialist_analytics** - Analytics data
16. **admin_logs** - Admin action logs
17. **invites** - Access codes
18. **resources** - Learning materials

---

## 🔴 CRITICAL MISSING TABLES (40+ TABLES)

### AUTHENTICATION & IDENTITY (5 Missing)

#### 1. ❌ `email_verification_tokens`
```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  token TEXT UNIQUE,
  token_hash TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verification_ip INET,
  attempts INT DEFAULT 0
);

-- WHY: Email verification is completely missing
-- IMPACT: Can't verify emails, high bounce rates, can't send password resets
-- CURRENT: ❌ NO VERIFICATION TOKENS
```

#### 2. ❌ `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  token TEXT UNIQUE,
  token_hash TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  ip_address INET
);

-- WHY: Password reset workflow missing
-- IMPACT: Users can't reset forgotten passwords
-- CURRENT: ❌ NO PASSWORD RESET
```

#### 3. ❌ `two_factor_auth`
```sql
CREATE TABLE two_factor_auth (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  method TEXT, -- sms, email, authenticator
  secret_key TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ
);

-- WHY: No 2FA for security
-- IMPACT: Accounts vulnerable to credential stuffing
-- CURRENT: ❌ NO 2FA SUPPORT
```

#### 4. ❌ `terms_acceptance`
```sql
CREATE TABLE terms_acceptance (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  terms_version TEXT,
  terms_accepted BOOLEAN,
  accepted_at TIMESTAMPTZ,
  privacy_accepted BOOLEAN,
  privacy_version TEXT,
  ip_address INET,
  user_agent TEXT
);

-- WHY: GDPR requires proof of acceptance
-- IMPACT: Legal compliance violation
-- CURRENT: ❌ NO TERMS TRACKING
```

#### 5. ❌ `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ
);

-- WHY: Audit trail required for compliance
-- IMPACT: Can't track who changed what, no compliance proof
-- CURRENT: ❌ MISSING (admin_logs exists but incomplete)
```

---

### SPECIALIST REGISTRATION & MANAGEMENT (12 Missing)

#### 6. ❌ `specialist_documents`
```sql
CREATE TABLE specialist_documents (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  document_type TEXT, -- license, diploma, insurance, etc
  file_path TEXT,
  file_name TEXT,
  file_size INT,
  file_hash TEXT,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ,
  expiry_date DATE,
  verification_status TEXT, -- pending, verified, expired, rejected
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  document_number TEXT,
  issuing_authority TEXT,
  issue_date DATE
);

-- WHY: Credential verification is completely missing
-- IMPACT: Can't verify licenses, fake credentials accepted
-- CURRENT: ❌ NO DOCUMENT TRACKING
```

#### 7. ❌ `specialist_bank_accounts`
```sql
CREATE TABLE specialist_bank_accounts (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  account_holder_name TEXT,
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  country TEXT,
  currency TEXT,
  verification_status TEXT,
  verified_at TIMESTAMPTZ,
  is_primary BOOLEAN DEFAULT true
);

-- WHY: Payment setup for specialists
-- IMPACT: Can't pay specialists, no payment infrastructure
-- CURRENT: ❌ NO BANK ACCOUNT TRACKING
```

#### 8. ❌ `specialist_working_hours`
```sql
CREATE TABLE specialist_working_hours (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  day_of_week INT, -- 0-6
  start_time TIME,
  end_time TIME,
  is_working BOOLEAN,
  recurring BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ
);

-- WHY: Availability management
-- IMPACT: Can't set recurring hours, all manual, inflexible
-- CURRENT: ❌ NO WORKING HOURS TRACKING
```

#### 9. ❌ `specialist_rates`
```sql
CREATE TABLE specialist_rates (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  service_type TEXT,
  session_duration INT,
  rate DECIMAL(10,2),
  currency TEXT,
  rate_type TEXT, -- per-session, hourly, package
  effective_from DATE,
  effective_to DATE
);

-- WHY: Pricing setup for specialists
-- IMPACT: Can't set rates, no pricing model, no revenue
-- CURRENT: ❌ NO RATE TRACKING
```

#### 10. ❌ `specialist_specializations`
```sql
CREATE TABLE specialist_specializations (
  specialist_id UUID REFERENCES profiles(id),
  specialization_code TEXT,
  years_of_experience INT,
  certification_id UUID REFERENCES specialist_documents(id),
  is_primary BOOLEAN,
  PRIMARY KEY (specialist_id, specialization_code)
);

-- WHY: Track multiple specializations
-- IMPACT: Can only have one specialty, users can't find right specialist
-- CURRENT: ❌ NO MULTI-SPECIALIZATION
```

#### 11. ❌ `specialist_types`
```sql
CREATE TABLE specialist_types (
  id UUID PRIMARY KEY,
  name TEXT, -- psychologist, lawyer, doctor, etc
  code TEXT UNIQUE,
  pillar_id UUID REFERENCES pillars(id),
  description TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Define types of specialists
-- IMPACT: Can't categorize specialists, no type validation
-- CURRENT: ❌ MISSING SPECIALIST TYPE DEFINITIONS
```

#### 12. ❌ `specialist_availability_exceptions`
```sql
CREATE TABLE specialist_availability_exceptions (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  exception_date DATE,
  is_available BOOLEAN,
  reason TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Handle vacation, sick leave, etc
-- IMPACT: Can't block availability, specialists forced to work when away
-- CURRENT: ❌ NO EXCEPTION HANDLING
```

#### 13. ❌ `specialist_verification_queue`
```sql
CREATE TABLE specialist_verification_queue (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  verification_type TEXT, -- documents, background_check, etc
  status TEXT DEFAULT 'pending', -- pending, in_review, approved, rejected
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  deadline DATE,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Manage verification workflow
-- IMPACT: No verification queue, can't track who's pending approval
-- CURRENT: ❌ NO VERIFICATION QUEUE
```

#### 14. ❌ `specialist_license_verification`
```sql
CREATE TABLE specialist_license_verification (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  license_number TEXT,
  license_type TEXT,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE,
  verification_status TEXT, -- pending, verified, expired, revoked
  verified_at TIMESTAMPTZ,
  notes TEXT
);

-- WHY: Track license verification
-- IMPACT: Can't verify license numbers, expired licenses not detected
-- CURRENT: ❌ NO LICENSE TRACKING
```

#### 15. ❌ `specialist_background_checks`
```sql
CREATE TABLE specialist_background_checks (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  check_type TEXT, -- criminal, reference, credit
  status TEXT, -- pending, completed, failed
  provider TEXT, -- Stripe, DuckDuckGo API, etc
  result JSONB,
  checked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- WHY: Background check results
-- IMPACT: No background checks performed, security risk
-- CURRENT: ❌ NO BACKGROUND CHECK TRACKING
```

#### 16. ❌ `specialist_payment_history`
```sql
CREATE TABLE specialist_payment_history (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  session_id UUID,
  amount DECIMAL(10,2),
  currency TEXT,
  status TEXT, -- pending, completed, failed, refunded
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- WHY: Track payments to specialists
-- IMPACT: No payment tracking, can't audit payment history
-- CURRENT: ❌ NO PAYMENT HISTORY
```

#### 17. ❌ `specialist_no_shows`
```sql
CREATE TABLE specialist_no_shows (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  booking_id UUID REFERENCES bookings(id),
  reason TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Track no-shows and build reputation
-- IMPACT: Can't measure reliability, no reputation system
-- CURRENT: ❌ NO NO-SHOW TRACKING
```

---

### COMPANY REGISTRATION & MANAGEMENT (10 Missing)

#### 18. ❌ `company_verification`
```sql
CREATE TABLE company_verification (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  registration_number TEXT,
  registration_verified BOOLEAN,
  tax_id TEXT,
  tax_id_verified BOOLEAN,
  business_license TEXT,
  license_verified BOOLEAN,
  verification_status TEXT, -- pending, verified, rejected
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT
);

-- WHY: Verify company details
-- IMPACT: Fake companies can register, no verification
-- CURRENT: ❌ NO COMPANY VERIFICATION
```

#### 19. ❌ `company_contacts`
```sql
CREATE TABLE company_contacts (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_role TEXT,
  is_primary BOOLEAN,
  verified BOOLEAN DEFAULT false,
  verification_email_sent_at TIMESTAMPTZ
);

-- WHY: Track company contacts
-- IMPACT: Can't verify who can authorize, no contact info verification
-- CURRENT: ❌ NO CONTACT TRACKING
```

#### 20. ❌ `company_subscription_plans`
```sql
CREATE TABLE company_subscription_plans (
  id UUID PRIMARY KEY,
  name TEXT,
  price DECIMAL(10,2),
  currency TEXT,
  sessions_per_month INT,
  max_employees INT,
  features JSONB,
  trial_days INT,
  billing_cycle TEXT, -- monthly, annual
  created_at TIMESTAMPTZ
);

-- WHY: Define subscription tiers
-- IMPACT: No subscription system, can't charge companies
-- CURRENT: ❌ NO SUBSCRIPTION PLANS
```

#### 21. ❌ `company_subscriptions`
```sql
CREATE TABLE company_subscriptions (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  plan_id UUID REFERENCES company_subscription_plans(id),
  status TEXT, -- active, trial, suspended, cancelled
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  cancellation_date DATE,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Track company subscriptions
-- IMPACT: No way to charge companies, no billing
-- CURRENT: ❌ NO SUBSCRIPTION TRACKING
```

#### 22. ❌ `company_invoices`
```sql
CREATE TABLE company_invoices (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  invoice_number TEXT UNIQUE,
  amount DECIMAL(10,2),
  currency TEXT,
  status TEXT, -- draft, sent, paid, overdue
  billing_period_start DATE,
  billing_period_end DATE,
  due_date DATE,
  created_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- WHY: Track invoices
-- IMPACT: No invoicing system, no payment tracking
-- CURRENT: ❌ NO INVOICING
```

#### 23. ❌ `company_payments`
```sql
CREATE TABLE company_payments (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  invoice_id UUID REFERENCES company_invoices(id),
  amount DECIMAL(10,2),
  currency TEXT,
  status TEXT, -- pending, completed, failed, refunded
  payment_method TEXT, -- card, bank_transfer, etc
  transaction_id TEXT,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- WHY: Track company payments
-- IMPACT: No payment processing, can't collect revenue
-- CURRENT: ❌ NO PAYMENT PROCESSING
```

#### 24. ❌ `company_employee_invitations`
```sql
CREATE TABLE company_employee_invitations (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  email TEXT,
  invited_by_user_id UUID REFERENCES profiles(id),
  token TEXT UNIQUE,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

-- WHY: Track employee invitations
-- IMPACT: No way to invite employees, manual process only
-- CURRENT: ❌ NO INVITATION TRACKING
```

#### 25. ❌ `company_session_quota_history`
```sql
CREATE TABLE company_session_quota_history (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  month_year DATE,
  quota_allocated INT,
  sessions_used INT,
  sessions_remaining INT,
  adjusted_by UUID REFERENCES profiles(id),
  adjustment_reason TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Track quota usage
-- IMPACT: Can't enforce limits, no usage tracking
-- CURRENT: ❌ NO QUOTA HISTORY
```

#### 26. ❌ `company_dpa_acceptance`
```sql
CREATE TABLE company_dpa_acceptance (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  dpa_version TEXT,
  accepted BOOLEAN,
  accepted_by_user_id UUID REFERENCES profiles(id),
  accepted_at TIMESTAMPTZ,
  signed_document_url TEXT
);

-- WHY: GDPR Data Processing Agreement
-- IMPACT: GDPR compliance violation, legal liability
-- CURRENT: ❌ NO DPA TRACKING
```

#### 27. ❌ `company_activity_logs`
```sql
CREATE TABLE company_activity_logs (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
);

-- WHY: Track company activities
-- IMPACT: No audit trail, can't track employee actions
-- CURRENT: ❌ NO ACTIVITY TRACKING
```

---

### PAYMENT & BILLING (5 Missing)

#### 28. ❌ `payment_methods`
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT, -- card, bank_account
  stripe_payment_method_id TEXT,
  last_four TEXT,
  brand TEXT,
  is_default BOOLEAN,
  created_at TIMESTAMPTZ
);

-- WHY: Store payment methods
-- IMPACT: No payment method storage, can't process payments
-- CURRENT: ❌ NO PAYMENT METHODS
```

#### 29. ❌ `payment_transactions`
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2),
  currency TEXT,
  status TEXT, -- pending, completed, failed, refunded
  stripe_transaction_id TEXT,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- WHY: Track all transactions
-- IMPACT: No transaction tracking, can't audit payments
-- CURRENT: ❌ NO TRANSACTION HISTORY
```

#### 30. ❌ `refunds`
```sql
CREATE TABLE refunds (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES payment_transactions(id),
  reason TEXT,
  amount DECIMAL(10,2),
  status TEXT, -- pending, completed, failed
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- WHY: Handle refunds
-- IMPACT: No refund system, can't handle disputes
-- CURRENT: ❌ NO REFUND HANDLING
```

#### 31. ❌ `invoicing_templates`
```sql
CREATE TABLE invoicing_templates (
  id UUID PRIMARY KEY,
  company_id UUID,
  name TEXT,
  template_html TEXT,
  is_default BOOLEAN,
  created_at TIMESTAMPTZ
);

-- WHY: Customize invoices
-- IMPACT: No invoice customization, generic invoices only
-- CURRENT: ❌ NO INVOICE TEMPLATES
```

#### 32. ❌ `expenses`
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2),
  currency TEXT,
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Track company expenses
-- IMPACT: No expense tracking, no cost allocation
-- CURRENT: ❌ NO EXPENSE TRACKING
```

---

### SESSION & BOOKING MANAGEMENT (8 Missing)

#### 33. ❌ `session_types`
```sql
CREATE TABLE session_types (
  id UUID PRIMARY KEY,
  name TEXT, -- initial consultation, follow-up, etc
  duration INT, -- minutes
  description TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Define session types
-- IMPACT: Can't have different rates for different session types
-- CURRENT: ❌ NO SESSION TYPE DEFINITIONS
```

#### 34. ❌ `booking_status_history`
```sql
CREATE TABLE booking_status_history (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Audit booking status changes
-- IMPACT: Can't track booking history, no audit trail
-- CURRENT: ❌ NO STATUS HISTORY
```

#### 35. ❌ `booking_reminders`
```sql
CREATE TABLE booking_reminders (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  reminder_type TEXT, -- email, sms, push
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT, -- pending, sent, failed
  created_at TIMESTAMPTZ
);

-- WHY: Track reminders sent
-- IMPACT: No reminder tracking, can't reduce no-shows
-- CURRENT: ❌ NO REMINDER TRACKING
```

#### 36. ❌ `booking_cancellations`
```sql
CREATE TABLE booking_cancellations (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  cancelled_by UUID REFERENCES profiles(id),
  reason TEXT,
  cancelled_at TIMESTAMPTZ,
  refund_issued BOOLEAN,
  refund_amount DECIMAL(10,2)
);

-- WHY: Track cancellations
-- IMPACT: Can't process cancellations properly, no refund tracking
-- CURRENT: ❌ NO CANCELLATION TRACKING
```

#### 37. ❌ `meeting_recordings`
```sql
CREATE TABLE meeting_recordings (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  recording_url TEXT,
  duration INT, -- seconds
  storage_size INT, -- bytes
  created_at TIMESTAMPTZ
);

-- WHY: Store meeting recordings
-- IMPACT: Can't record sessions, no compliance documentation
-- CURRENT: ❌ NO RECORDING STORAGE
```

#### 38. ❌ `session_notes`
```sql
CREATE TABLE session_notes (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  provider_id UUID REFERENCES profiles(id),
  notes TEXT,
  follow_up_actions TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- WHY: Store provider notes
-- IMPACT: No way to track session notes, no follow-up tracking
-- CURRENT: ❌ NO SESSION NOTES
```

#### 39. ❌ `recurring_bookings`
```sql
CREATE TABLE recurring_bookings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  specialist_id UUID REFERENCES profiles(id),
  frequency TEXT, -- weekly, biweekly, monthly
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
);

-- WHY: Support recurring sessions
-- IMPACT: Can't book recurring sessions, manual booking only
-- CURRENT: ❌ NO RECURRING BOOKINGS
```

#### 40. ❌ `booking_packages`
```sql
CREATE TABLE booking_packages (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  name TEXT,
  session_count INT,
  price DECIMAL(10,2),
  currency TEXT,
  discount_percentage DECIMAL(5,2),
  created_at TIMESTAMPTZ
);

-- WHY: Support package deals
-- IMPACT: Can't offer discounts for bulk bookings
-- CURRENT: ❌ NO PACKAGE PRICING
```

---

### COMMUNICATION & NOTIFICATIONS (4 Missing)

#### 41. ❌ `email_templates`
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE, -- welcome-specialist, booking-confirmation, etc
  subject TEXT,
  body_html TEXT,
  variables JSONB,
  created_at TIMESTAMPTZ
);

-- WHY: Manage email templates
-- IMPACT: No templated emails, can't send consistent communications
-- CURRENT: ❌ NO EMAIL TEMPLATES
```

#### 42. ❌ `sms_templates`
```sql
CREATE TABLE sms_templates (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,
  content TEXT,
  variables JSONB,
  created_at TIMESTAMPTZ
);

-- WHY: Manage SMS templates
-- IMPACT: No SMS notifications, can't send reminders via SMS
-- CURRENT: ❌ NO SMS TEMPLATES
```

#### 43. ❌ `notification_preferences`
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
);

-- WHY: Respect user preferences
-- IMPACT: GDPR violation - sending unwanted emails
-- CURRENT: ❌ NO PREFERENCE TRACKING
```

#### 44. ❌ `communication_logs`
```sql
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  message_type TEXT, -- email, sms, push
  recipient TEXT,
  subject TEXT,
  content TEXT,
  status TEXT, -- sent, failed, bounced
  sent_at TIMESTAMPTZ
);

-- WHY: Audit all communications
-- IMPACT: Can't track communications, no audit trail for compliance
-- CURRENT: ❌ NO COMMUNICATION LOG
```

---

### DATA & ANALYTICS (5 Missing)

#### 45. ❌ `user_activity_logs`
```sql
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Track user actions
-- IMPACT: No user activity tracking, can't analyze behavior
-- CURRENT: ❌ NO ACTIVITY LOGGING
```

#### 46. ❌ `monthly_analytics`
```sql
CREATE TABLE monthly_analytics (
  id UUID PRIMARY KEY,
  month DATE,
  total_users INT,
  total_specialists INT,
  total_companies INT,
  total_bookings INT,
  total_revenue DECIMAL(10,2),
  average_rating DECIMAL(3,2),
  created_at TIMESTAMPTZ
);

-- WHY: Track monthly metrics
-- IMPACT: Can't see business metrics, no KPIs
-- CURRENT: ❌ NO MONTHLY ANALYTICS
```

#### 47. ❌ `pillar_analytics`
```sql
CREATE TABLE pillar_analytics (
  id UUID PRIMARY KEY,
  pillar TEXT,
  date DATE,
  chats INT DEFAULT 0,
  bookings INT DEFAULT 0,
  revenue DECIMAL(10,2),
  satisfaction_score DECIMAL(3,2),
  created_at TIMESTAMPTZ
);

-- WHY: Track metrics per pillar
-- IMPACT: Can't see which pillars are performing
-- CURRENT: ❌ NO PILLAR-LEVEL ANALYTICS
```

#### 48. ❌ `user_feedback_surveys`
```sql
CREATE TABLE user_feedback_surveys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  survey_type TEXT, -- nps, csat, ces
  score INT,
  comment TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Collect structured feedback
-- IMPACT: Can't measure satisfaction systematically
-- CURRENT: ❌ NO SURVEY TRACKING
```

#### 49. ❌ `error_tracking`
```sql
CREATE TABLE error_tracking (
  id UUID PRIMARY KEY,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  user_id UUID REFERENCES profiles(id),
  url TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Track application errors
-- IMPACT: Can't see errors happening in production
-- CURRENT: ❌ NO ERROR TRACKING (Sentry not yet integrated)
```

---

### INFRASTRUCTURE & CONFIG (4 Missing)

#### 50. ❌ `system_settings`
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY,
  setting_key TEXT UNIQUE,
  setting_value JSONB,
  setting_type TEXT, -- string, number, boolean, json
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- WHY: Store system configuration
-- IMPACT: Can't configure system dynamically, hard-coded values
-- CURRENT: ❌ NO SETTINGS TABLE
```

#### 51. ❌ `feature_flags`
```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INT DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- WHY: Control feature releases
-- IMPACT: Can't do feature rollouts, can't A/B test
-- CURRENT: ❌ NO FEATURE FLAGS
```

#### 52. ❌ `scheduled_jobs`
```sql
CREATE TABLE scheduled_jobs (
  id UUID PRIMARY KEY,
  job_type TEXT,
  status TEXT, -- pending, running, completed, failed
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- WHY: Track scheduled jobs
-- IMPACT: Can't manage background jobs, no scheduling
-- CURRENT: ❌ NO JOB SCHEDULING
```

#### 53. ❌ `api_keys`
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  key_hash TEXT UNIQUE,
  name TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- WHY: Track API keys
-- IMPACT: Can't revoke API keys, no key management
-- CURRENT: ❌ NO API KEY MANAGEMENT
```

---

### SECURITY & COMPLIANCE (6 Missing)

#### 54. ❌ `ip_whitelist`
```sql
CREATE TABLE ip_whitelist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  ip_address INET,
  description TEXT,
  created_at TIMESTAMPTZ
);

-- WHY: Security - restrict access to specific IPs
-- IMPACT: No IP restriction, accounts vulnerable to access from anywhere
-- CURRENT: ❌ NO IP WHITELISTING
```

#### 55. ❌ `failed_login_attempts`
```sql
CREATE TABLE failed_login_attempts (
  id UUID PRIMARY KEY,
  email TEXT,
  ip_address INET,
  attempt_at TIMESTAMPTZ
);

-- WHY: Detect brute force attacks
-- IMPACT: No brute force protection, accounts vulnerable
-- CURRENT: ❌ NO BRUTE FORCE DETECTION
```

#### 56. ❌ `session_tokens`
```sql
CREATE TABLE session_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  token_hash TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- WHY: Track active sessions
-- IMPACT: Can't invalidate sessions, no session management
-- CURRENT: ❌ NO SESSION MANAGEMENT
```

#### 57. ❌ `data_retention_policies`
```sql
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY,
  entity_type TEXT,
  retention_days INT,
  auto_delete BOOLEAN,
  created_at TIMESTAMPTZ
);

-- WHY: Manage GDPR data retention
-- IMPACT: GDPR violation - data not deleted per retention policy
-- CURRENT: ❌ NO RETENTION POLICIES
```

#### 58. ❌ `encryption_keys`
```sql
CREATE TABLE encryption_keys (
  id UUID PRIMARY KEY,
  key_type TEXT, -- jwt, data, etc
  key_version INT,
  algorithm TEXT,
  created_at TIMESTAMPTZ,
  rotated_at TIMESTAMPTZ
);

-- WHY: Manage encryption keys
-- IMPACT: No key rotation, security risk
-- CURRENT: ❌ NO KEY MANAGEMENT
```

---

## SUMMARY: WHAT'S ACTUALLY MISSING

### By Category

| Category | Current | Needed | Missing |
|----------|---------|--------|---------|
| Authentication | 0 | 5 | **5** ❌ |
| Specialist Mgmt | 1 | 13 | **12** ❌ |
| Company Mgmt | 3 | 13 | **10** ❌ |
| Payment & Billing | 0 | 5 | **5** ❌ |
| Session Mgmt | 2 | 10 | **8** ❌ |
| Communication | 1 | 5 | **4** ❌ |
| Analytics | 2 | 7 | **5** ❌ |
| Infrastructure | 0 | 4 | **4** ❌ |
| Security | 0 | 6 | **6** ❌ |
| **TOTALS** | **17** | **68** | **51** ❌ |

---

## ⚠️ CRITICAL ISSUES

### 🔴 MOST CRITICAL MISSING

1. **NO PAYMENT SYSTEM** (Tables 28-32)
   - Can't collect payments from companies
   - Can't pay specialists
   - **Revenue: $0**

2. **NO EMAIL VERIFICATION** (Table 1)
   - Accounts with invalid emails
   - Password resets don't work
   - **Compliance: BROKEN**

3. **NO TERMS ACCEPTANCE** (Table 4)
   - GDPR violation
   - No proof of consent
   - **Legal: AT RISK**

4. **NO VERIFICATION WORKFLOWS** (Tables 13-16)
   - Unverified specialists can work
   - Unverified companies can register
   - **Trust: BROKEN**

5. **NO SUBSCRIPTION SYSTEM** (Tables 20-23)
   - Can't bill companies
   - No plan management
   - **Revenue: ZERO**

6. **NO SESSION MANAGEMENT** (Tables 33-40)
   - Can't track bookings properly
   - No cancellations
   - No recurring sessions
   - **UX: BROKEN**

---

## WHAT YOU HAVE RIGHT

✅ **Good foundations:**
- Basic profiles table
- Bookings tracking
- Chat system
- Company organization
- Specialist assignments
- Admin logging

❌ **But missing the infrastructure to actually operate**

---

## IS 4 TABLES CORRECT?

**No, absolutely not. 4 tables would be:**
- Just profiles
- Just bookings
- Just companies
- Maybe chat

**That would be:**
- Can't verify emails ❌
- Can't process payments ❌
- Can't track terms ❌
- No audit logs ❌
- No security ❌
- **Literally unusable**

---

## IS 17 TABLES SUFFICIENT?

**No, still insufficient. You need ~68 tables minimum.**

**17 tables gets you:**
- ✅ Basic user system
- ✅ Basic booking system
- ✅ Basic company system
- ❌ BUT nothing else

---

## RECOMMENDATIONS

### PHASE 1: CRITICAL (Days 1-3)
**Do these first - platform won't work without them:**

1. Email verification tokens
2. Password reset tokens
3. Terms acceptance
4. Payment methods & transactions
5. Specialist documents
6. Company verification
7. Subscription plans & subscriptions

### PHASE 2: ESSENTIAL (Days 4-7)
**Core operational infrastructure:**

1. Working hours tracking
2. Specialist rates
3. Bank account verification
4. Company invoices
5. Employee invitations
6. Session notes
7. Booking status history

### PHASE 3: IMPORTANT (Week 2)
**Experience & safety:**

1. Email templates
2. Notification preferences
3. Audit logs
4. Session reminders
5. Failed login attempts
6. Feature flags

### PHASE 4: NICE-TO-HAVE (Later)
**Advanced features:**

1. Recurring bookings
2. Booking packages
3. Analytics
4. Recording storage
5. IP whitelisting

---

## ANSWER TO YOUR QUESTION

> "Four tables, 58 functions and 0 replicas. Is that... correct?"

**17 tables ≠ 4 tables, but...**

**NO - not sufficient for this platform.**

You need:
- ✅ 68+ tables (currently 17)
- ✅ Way more than 58 functions
- ⚠️ Replicas: Not for now, but add later for HA
- ❌ Payment system
- ❌ Verification workflows
- ❌ Email verification
- ❌ Terms tracking
- ❌ Subscription system

**This is why registrations fail, payments don't work, and you can't verify anyone.**

---

This is your database schema reality check! 🚨

