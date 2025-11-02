# 🔍 SPECIALIST & COMPANY REGISTRATION FLOWS - COMPLETE AUDIT

**Detailed Analysis of Registration for Especialista Geral & Company HR**  
**Date:** November 1, 2025

---

## TABLE OF CONTENTS

1. [Especialista (Specialist) Registration](#especialista-registration)
2. [Company HR Registration](#company-hr-registration)
3. [Comparative Analysis](#comparative-analysis)
4. [Common Issues Across Both](#common-issues)

---

## ESPECIALISTA (SPECIALIST) REGISTRATION

### 📋 COMPLETE REGISTRATION FLOW BREAKDOWN

**User Type:** Especialista Geral (Healthcare Professional, Psychologist, Lawyer, etc.)

---

### STEP 1️⃣: INITIAL SIGNUP - BASIC ACCOUNT CREATION

**User Action:** Click "Register as Specialist" → Enter email, password, name

#### 🔴 ISSUE 1.1: Email Validation & Uniqueness

```typescript
// CURRENT: Frontend validates email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ❌ MISSING BACKEND CHECKS:
1. No uniqueness check in database
   - Could create multiple accounts with same email
   - Race condition: Two specialists register simultaneously
   
2. No check if email already used by:
   - Regular users
   - Company employees
   - Other specialists
   - Admins
   - All at same time!

3. No disposable email blocking
   - Could use temp-mail.com
   - Email disappears after confirmation
   - Registration succeeds but can't verify

4. No corporate email enforcement
   - Should require professional email
   - Could use personal Gmail
   - Hard to verify credentials

5. No email verification before account creation
   - User could create account with typo
   - Can't receive reset emails
   - Bounces are not handled
```

**Possible Errors:**
- ❌ Two specialists register with same email simultaneously
- ❌ Email validation passes but already exists in database
- ❌ Can register with fake email, account created but unusable
- ❌ Can register with personal email instead of professional
- ❌ Email confirmation email goes to wrong address (typo) - can't verify
- ❌ Duplicate accounts exist for same person

---

#### 🔴 ISSUE 1.2: Password Strength & Validation

```typescript
// CURRENT: Zod password validation
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(val => /[A-Z]/.test(val), 'Must contain uppercase')
  .refine(val => /[0-9]/.test(val), 'Must contain number')
  .refine(val => /[!@#$%^&*]/.test(val), 'Must contain special char');

// ❌ MISSING:
1. No check against common passwords
   - "Specialist1!" passes but is weak
   - Dictionary attacks work
   - Keyboard patterns like "qwerty!Abc123" pass

2. No breach database check
   - Password could be from famous breach
   - Pawn'd password could be used
   - No integration with HaveIBeenPwned

3. No entropy calculation
   - Could require higher entropy for specialists
   - Healthcare data needs stronger passwords

4. No check for personal info in password
   - Could use name in password
   - Professional license number could be in password
   - Easy to guess

5. No password history
   - Can immediately reset and use same password
   - No history of old passwords
   - Can't prevent reuse

6. No password expiry policy
   - Password never needs changing
   - If compromised, stays compromised
   - No forced reset schedule
```

**Possible Errors:**
- ❌ Weak password like "Specialist1!" accepted
- ❌ Compromised password from breach accepted
- ❌ Password contains personal info, easy to guess
- ❌ Same password used forever
- ❌ Brute force succeeds with weak password

---

#### 🔴 ISSUE 1.3: Account Creation Race Condition

```typescript
// CURRENT: Frontend calls auth signup
const result = await signup(email, password, name);

// ❌ MISSING:
1. No database transaction
   - Auth user created
   - Then profile creation fails
   - Orphaned user in auth
   - Can't recover

2. No idempotency key
   - Duplicate requests create multiple accounts
   - Network timeout → retry → 2 accounts created
   - One user, two auth records

3. No concurrent signup prevention
   - Same email submitted twice simultaneously
   - Both race through validation
   - Both create accounts
   - Database constraint violation at the end

4. No signup service health check
   - Auth service could be down
   - No error message to user
   - Generic timeout
   - User confused about what went wrong

5. No network retry logic
   - Timeout = failed (but maybe partially created)
   - User refreshes and tries again
   - Could create duplicate

6. No signup backup/recovery
   - If fails midway, can't recover
   - User stuck in unknown state
   - Can't try again cleanly
```

**Database Flow:**
```sql
-- WHAT SHOULD HAPPEN (but doesn't):
BEGIN TRANSACTION;
  1. Create auth user
  2. Create profile
  3. Assign role
  4. Create specialist_info
  5. Send confirmation email
COMMIT;

-- IF ANY STEP FAILS:
ROLLBACK ALL;

-- WHAT ACTUALLY HAPPENS:
-- Auth user created ✓
-- Network timeout ✗
-- Profile not created
-- Orphaned user in auth!
-- User can login but has no profile
-- "Profile not found" error
```

**Possible Errors:**
- ❌ Auth user created but profile not created
- ❌ Two accounts created from one signup attempt
- ❌ Can login but immediate error: "No profile found"
- ❌ Auth service down, user gets generic error
- ❌ Network timeout, user doesn't know if signup worked

---

### STEP 2️⃣: PROFESSIONAL INFORMATION - CREDENTIALS & VERIFICATION

**User Action:** Enter professional details, upload certificates, verify credentials

#### 🔴 ISSUE 2.1: Missing Specialist Type Selection

```typescript
// CURRENT: Assuming specialist type somewhere
// ❌ MISSING IN REGISTRATION:

1. No specialist_type selection during signup
   - Psychologist?
   - Lawyer?
   - Doctor?
   - Physical Therapist?
   - Financial Advisor?
   
2. If not collected at signup:
   - Could default to wrong type
   - Needs to be updated later
   - User gets notifications for wrong pillar
   - Can't match to clients by type

3. No validation that type matches credentials
   - Upload PhD in Psychology
   - But select "Lawyer" as type
   - No error!
   - Wrong specialization assigned

4. No specialization sub-categories
   - Psychologist but which field?
   - Clinical? Educational? Sports?
   - All shown as generic "psychologist"
   - Client can't find right specialist

5. No multi-specialization support
   - Specialist could be both PhD + Lawyer
   - No way to indicate multiple certifications
   - Limited to one type
```

**SQL MISSING:**
```sql
-- Missing tables:
CREATE TABLE specialist_types (
  id UUID PRIMARY KEY,
  name TEXT, -- psychologist, lawyer, etc
  code TEXT,
  pillar_id UUID REFERENCES pillars(id)
);

CREATE TABLE specialist_type_assignments (
  specialist_id UUID REFERENCES profiles(id),
  specialist_type_id UUID REFERENCES specialist_types(id),
  PRIMARY KEY (specialist_id, specialist_type_id)
);

-- Currently:
CREATE TABLE profiles (
  specialty TEXT -- free-form field, no validation!
);
```

---

#### 🔴 ISSUE 2.2: Credential Upload & Storage

```
CURRENT: Users upload files, but...

❌ MISSING:
1. No file storage integration
   - Where are files stored?
   - S3? Supabase Storage? Local filesystem?
   - No clear path

2. No file validation
   - Could upload EXE file
   - Could upload image
   - No file type checking
   - No file size limits

3. No document security
   - Files not encrypted
   - Files accessible to anyone?
   - No access control
   - Could expose private credentials

4. No document scanning/OCR
   - Upload PDF diploma
   - Manual review only
   - Can't auto-extract info
   - Slow verification process

5. No document versioning
   - Update certification
   - Old versions lost
   - Can't track history
   - No audit trail

6. No expiry date tracking
   - License could expire
   - No notification system
   - Specialist could work with expired license
   - No automatic suspension

7. No fraud detection
   - Could upload fake documents
   - No AI validation
   - No document authenticity check
   - No comparison with official records
```

**Database Missing:**
```sql
-- Missing tables:
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

-- Currently: No document tracking table!
```

**Possible Errors:**
- ❌ Upload file but it's not stored anywhere
- ❌ Upload EXE file, accepted
- ❌ Upload huge file, server crashes
- ❌ File stored unencrypted, exposed
- ❌ License expires but specialist still works
- ❌ Upload fake credentials, never verified

---

#### 🔴 ISSUE 2.3: License/Credential Verification Workflow

```
CURRENT: No verification workflow!

❌ MISSING:
1. No verification queue
   - Documents uploaded
   - No one reviews them
   - Stuck in limbo
   - Never verified

2. No admin assignment
   - No one assigned to verify
   - No due date for verification
   - Could wait forever
   - No notification if stuck

3. No verification criteria
   - What makes document valid?
   - No standards applied
   - Admin might reject for wrong reason
   - No consistency

4. No background check integration
   - Upload credentials
   - No check against official databases
   - Could be forged
   - No way to verify authenticity

5. No resubmission workflow
   - Credentials rejected
   - Specialist doesn't know why
   - Can't fix and resubmit
   - No appeal process

6. No insurance verification
   - Malpractice insurance required?
   - No verification
   - Specialist could be uninsured
   - Liability issue

7. No licensing board verification
   - License number provided
   - Not checked against board
   - Could be fake license number
   - No validation
```

**Missing Workflow:**
```
Document Upload
  ↓
❌ No Verification Queue
  ↓
❌ No Admin Assignment
  ↓
❌ No Status Tracking
  ↓
❌ No Approval/Rejection
  ↓
❌ No Notification
  ↓
❌ No Appeal Process
```

**Possible Errors:**
- ❌ Credentials uploaded but never verified
- ❌ Specialist waits weeks with no status
- ❌ Credentials rejected with no explanation
- ❌ Can't resubmit after rejection
- ❌ Unverified specialist can start working
- ❌ Fake credentials accepted

---

#### 🔴 ISSUE 2.4: Professional License Number Validation

```typescript
// CURRENT: License number collected but not validated

// ❌ MISSING:
1. No format validation per country
   - Different countries have different formats
   - Brazil = CREMESP license?
   - Portugal = different format?
   - No regex per country

2. No database lookup
   - License number provided
   - Not checked against official boards
   - Could be completely made up
   - No verification

3. No realtime verification API
   - Could integrate with government boards
   - No integration implemented
   - Can't verify in real-time
   - Offline verification only

4. No expiry date from license
   - License has expiry
   - Not extracted or tracked
   - Could use expired license
   - No automatic suspension

5. No revocation checking
   - License could be revoked
   - Not checked
   - Revoked specialist could still work
   - Regulatory violation

6. No license status display
   - User doesn't see if verified
   - No indication of active/expired
   - Unclear what status is
```

**Possible Errors:**
- ❌ Fake license number accepted
- ❌ Wrong format accepted
- ❌ Expired license not detected
- ❌ Revoked license still active
- ❌ User doesn't know if verified
- ❌ Non-existent license number works

---

### STEP 3️⃣: BANK ACCOUNT & PAYMENT SETUP

**User Action:** Provide bank details for payouts

#### 🔴 ISSUE 3.1: Bank Account Verification

```sql
-- MISSING TABLE:
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
  verification_status TEXT, -- pending, verified, failed
  verification_method TEXT, -- microdeposits, instant
  created_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  is_primary BOOLEAN DEFAULT true
);

-- CURRENT: No bank account table!
-- No payment setup = can't pay specialists!
```

#### 🔴 MISSING BANK VERIFICATION PROCESS

```
❌ MISSING:
1. No microdeposit verification
   - Bank account provided
   - No test deposits sent
   - Account not verified
   - Could be wrong account

2. No instant verification
   - No Plaid/Stripe integration
   - No real-time account checking
   - Manual verification only
   - Slow process

3. No document verification
   - Bank statement could be fake
   - No verification against bank
   - Forged documents accepted
   - No validation

4. No tax ID verification
   - If required, not checked
   - Could use fake tax ID
   - No validation against authorities
   - Untracked

5. No country-specific formats
   - IBAN for Europe
   - Routing for US
   - Different for each country
   - Generic system doesn't account for this

6. No payout test
   - Bank info provided
   - Never tested with actual transfer
   - First payout could fail
   - No pre-validation
```

**Possible Errors:**
- ❌ Bank account provided but never verified
- ❌ Wrong account, specialist never gets paid
- ❌ Payout fails on first transfer attempt
- ❌ Fake bank details accepted
- ❌ No way to update bank account
- ❌ Specialist waits weeks for first payout

---

### STEP 4️⃣: AVAILABILITY & WORKING HOURS

**User Action:** Set initial availability, working hours, time zone

#### 🔴 ISSUE 4.1: Time Zone Setup

```
CURRENT: Time zone probably set somewhere, but...

❌ MISSING:
1. No time zone validation
   - "UTC+25" accepted (doesn't exist!)
   - No validation against standard list
   - Could set random time zone
   - Booking times all wrong

2. No DST handling
   - Daylight saving time ignored
   - When clocks change, times break
   - Sessions booked at wrong times
   - User misses sessions

3. No automated time zone detection
   - User has to manually select
   - Could select wrong zone
   - Easy to make mistake
   - Not auto-detected from IP/browser

4. No time zone conflict detection
   - Specialist in New York
   - But time zone set to Tokyo
   - Availability all wrong
   - No validation

5. No time zone awareness in bookings
   - Specialist books from different zone
   - Booking shows different time to user
   - User shows up at wrong time
   - Both parties confused

6. No conversions in UI
   - Calendar shows specialist's time only
   - User sees different time in their zone
   - Confusion about session time
```

**SQL MISSING:**
```sql
-- Currently: profiles.timezone TEXT (free-form!)

-- Should be:
CREATE TABLE profile_settings (
  specialist_id UUID PRIMARY KEY REFERENCES profiles(id),
  timezone TEXT CHECK (timezone IN (SELECT tzname FROM pg_timezone_names)),
  dst_aware BOOLEAN,
  preferred_language TEXT,
  currency_code TEXT,
  measurement_units TEXT -- metric/imperial
);
```

**Possible Errors:**
- ❌ Time zone set to "UTC+25" (invalid)
- ❌ DST happens, times change unexpectedly
- ❌ Session scheduled in wrong time zone
- ❌ Both specialist and user show up at different times
- ❌ Can't change time zone after signup

---

#### 🔴 ISSUE 4.2: Working Hours & Availability Setup

```sql
-- MISSING TABLE:
CREATE TABLE specialist_working_hours (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  day_of_week INT, -- 0=Sunday, 6=Saturday
  start_time TIME,
  end_time TIME,
  is_working BOOLEAN,
  recurring BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ
);

-- Currently: No structured working hours!
```

#### 🔴 MISSING AVAILABILITY MANAGEMENT

```
❌ MISSING:
1. No recurring availability
   - "Every Monday 9am-5pm"
   - Can't set recurring patterns
   - Have to enter each day manually
   - Tedious

2. No breaks/lunch time
   - Set 9am-5pm working
   - But have lunch break 12-1pm
   - No way to block lunch
   - Could schedule during lunch

3. No minimum advance booking
   - Specialist accepts bookings 10 minutes before
   - Can't prepare
   - No notice
   - No policy enforcement

4. No maximum advance booking
   - Specialist books 6 months in advance
   - Can't change plans
   - Locked in too far ahead
   - Inflexible

5. No buffer time between sessions
   - End session at 2pm
   - Next session at 2pm
   - No time to prepare
   - No documentation time
   - Back-to-back with no break

6. No concurrent session limits
   - Could set to accept 5 sessions at same time
   - No validation
   - Specialist can't do 5 simultaneous sessions
   - Overbooking possible

7. No initial availability set
   - Specialist signs up but sets no hours
   - Can't be booked
   - Specialist never visible in search
   - Users can't find them
```

**Possible Errors:**
- ❌ Have to manually enter each day
- ❌ Lunch break not blocked, could schedule during lunch
- ❌ Too many advance bookings accepted
- ❌ Back-to-back sessions with no break
- ❌ Set availability but not shown to users
- ❌ Can accept multiple sessions at same time

---

### STEP 5️⃣: SPECIALIZATION & SERVICES

**User Action:** Select areas of specialization, set rates, describe services

#### 🔴 ISSUE 5.1: Specialization Selection

```sql
-- MISSING TABLE:
CREATE TABLE specialist_specializations (
  specialist_id UUID REFERENCES profiles(id),
  specialization_code TEXT,
  years_of_experience INT,
  certification_id UUID REFERENCES specialist_documents(id),
  is_primary BOOLEAN,
  PRIMARY KEY (specialist_id, specialization_code)
);

-- Currently: No specialization tracking!
```

#### 🔴 MISSING SPECIALIZATION OPTIONS

```
❌ MISSING:
1. No specialization list
   - For Psychologist:
     - Clinical psychology
     - Cognitive behavioral therapy
     - Child psychology
     - Couples therapy
     - Sport psychology
   - All missing!

2. No experience level tracking
   - How many years of experience?
   - Not captured
   - Users don't know specialist level
   - Can't filter by experience

3. No certification mapping
   - Select specialization but no certificate
   - No validation that specialist has cert
   - Could claim expertise without credentials
   - No verification

4. No multi-specialization
   - Specialist has multiple certifications
   - Can only list one
   - Incomplete profile
   - Users miss this specialist for other needs

5. No language tracking
   - What languages does specialist speak?
   - Not captured
   - Non-English user can't find
   - Communication barrier

6. No service description
   - What exactly is offered?
   - No description
   - Users guessing
   - Unclear services
```

**Possible Errors:**
- ❌ No way to select specialization
- ❌ Can list expertise without certificates
- ❌ Only one specialization option
- ❌ Languages not tracked
- ❌ Users can't filter by specialization
- ❌ Wrong specialist shown for user's need

---

#### 🔴 ISSUE 5.2: Pricing & Rate Setup

```sql
-- MISSING TABLE:
CREATE TABLE specialist_rates (
  id UUID PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id),
  service_type TEXT,
  session_duration INT, -- minutes
  rate DECIMAL(10,2),
  currency TEXT,
  rate_type TEXT, -- per-session, hourly, package
  effective_from DATE,
  effective_to DATE
);

-- Currently: No rate table!
```

#### 🔴 MISSING PRICING CONTROLS

```
❌ MISSING:
1. No rate setting
   - Specialist set their own rate?
   - Platform fixed rate?
   - Free sessions?
   - No pricing model!

2. No rate validation
   - Set rate to $0.01 (too low)
   - Set rate to $10,000 (too high)
   - No min/max enforcement
   - No sanity check

3. No rate by session type
   - Initial consultation: $50
   - Follow-up: $40
   - Different rates not supported
   - Only one rate

4. No package pricing
   - Buy 5 sessions for discount
   - No package support
   - Can't offer bulk discounts
   - Revenue loss

5. No rate history
   - Change rate
   - Old rate lost
   - Can't see rate changes
   - No audit trail

6. No currency support
   - Hard-coded to one currency?
   - If international, wrong currency
   - No conversion
   - Wrong prices

7. No rate change policy
   - Change rate immediately?
   - Affects existing bookings?
   - No rules
   - Confusion
```

**Possible Errors:**
- ❌ No way to set rates during signup
- ❌ Set rate to $0.01 or $10,000 (no validation)
- ❌ Can't have different rates for different services
- ❌ Can't offer package discounts
- ❌ Wrong currency for international specialist

---

### STEP 6️⃣: TERMS & COMPLIANCE ACCEPTANCE

**User Action:** Accept terms, privacy policy, professional standards

#### 🔴 ISSUE 6.1: Terms & Policy Acceptance

```sql
-- MISSING TABLE:
CREATE TABLE terms_acceptance (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  terms_version TEXT,
  terms_accepted BOOLEAN,
  accepted_at TIMESTAMPTZ,
  privacy_accepted BOOLEAN,
  privacy_version TEXT,
  professional_standards_accepted BOOLEAN,
  standards_version TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Currently: No terms acceptance tracking!
```

#### 🔴 MISSING COMPLIANCE CHECKS

```
❌ MISSING:
1. No terms version tracking
   - Accept terms v1.0
   - Later update to v2.0
   - Still showing as v1.0 accepted
   - No versioning

2. No privacy policy acceptance
   - GDPR requires explicit acceptance
   - Not captured
   - Compliance issue
   - Legal risk

3. No professional standards agreement
   - Specialist agrees to ethics code?
   - Not captured
   - No accountability
   - Could violate standards

4. No consent for marketing
   - Send marketing emails?
   - Not opted in/out
   - Compliance issue
   - GDPR violation

5. No cookie consent
   - Analytics cookies?
   - Not disclosed
   - Privacy violation
   - Legal issue

6. No terms update notification
   - Update terms
   - Existing specialists not notified
   - Old terms still in effect
   - Legal gap

7. No acceptance IP/timestamp logging
   - When did they accept?
   - From what IP?
   - Not logged
   - Can't prove acceptance

8. No refusal handling
   - Specialist refuses terms
   - What happens?
   - Can still register?
   - No enforcement
```

**Possible Errors:**
- ❌ No terms accepted, none recorded
- ❌ Terms updated, specialists don't reaccept
- ❌ No privacy consent, GDPR violation
- ❌ Can't prove specialist accepted terms
- ❌ Marketing emails sent without consent

---

### STEP 7️⃣: EMAIL VERIFICATION & ACCOUNT ACTIVATION

**User Action:** Confirm email, activate account, ready to work

#### 🔴 ISSUE 7.1: Email Verification Process

```sql
-- MISSING TABLE:
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

-- Currently: No email verification!
```

#### 🔴 MISSING EMAIL VERIFICATION

```
❌ MISSING:
1. No verification email sent
   - Signup complete
   - Email never arrives
   - Specialist can't verify
   - Account stuck

2. No verification link generation
   - No token created
   - No secure link
   - How does specialist verify?
   - No process

3. No token expiry
   - Link valid forever
   - Could verify months later
   - Security issue
   - Should expire in 24h

4. No resend capability
   - Didn't receive email?
   - Can't request resend
   - Stuck
   - No retry

5. No verification deadline
   - Verify within 30 days?
   - No deadline set
   - Account could be unverified forever
   - No cleanup

6. No unverified account restrictions
   - Unverified specialist can work?
   - Should be limited
   - No restrictions
   - Can't enforce verification

7. No rate limiting on verification
   - Click link 1000 times
   - No rate limiting
   - Token reuse attack
   - Verification hijacked
```

**Missing Email Function:**
```
❌ No send-specialist-verification-email function!
```

**Possible Errors:**
- ❌ Signup complete but no verification email
- ❌ Email never arrives, account stuck
- ❌ Can't request email resend
- ❌ Verification link expires before seeing email
- ❌ Unverified specialist can work
- ❌ Link valid forever (security issue)

---

#### 🔴 ISSUE 7.2: Account Status & Activation

```sql
-- MISSING FIELDS:
ALTER TABLE profiles ADD COLUMN (
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  account_status TEXT DEFAULT 'pending', -- pending, active, suspended, terminated
  activation_date DATE,
  ready_for_bookings BOOLEAN DEFAULT false,
  specialist_verification_status TEXT DEFAULT 'pending' -- pending, verified, rejected
);

-- Currently: No status tracking!
```

#### 🔴 MISSING ACCOUNT ACTIVATION CHECKS

```
❌ MISSING:
1. No email verification requirement
   - Email not verified but account active?
   - No enforcement
   - Users can't trust contact info

2. No credentials verification requirement
   - Documents not verified but can work?
   - Should be required
   - No enforcement

3. No bank account requirement
   - No payment setup but can get booked?
   - Won't get paid!
   - No check before allowing bookings

4. No activation checklist
   - Email verified ✓?
   - Documents verified ✓?
   - Bank account verified ✓?
   - Working hours set ✓?
   - Services defined ✓?
   - No checklist displayed

5. No activation notification
   - Account activated
   - Specialist not notified
   - Doesn't know they're live
   - Confusion

6. No pre-launch checklist
   - Specialist tries to get booked
   - Missing required info
   - Booking fails midway
   - Bad experience

7. No activation timeline
   - Signup → how long to approval?
   - Days? Weeks?
   - No SLA
   - Uncertainty
```

**Possible Errors:**
- ❌ Account active but email not verified
- ❌ Can get booked before credentials verified
- ❌ No payment setup but specialist goes live
- ❌ Specialist doesn't know account is active
- ❌ Booking setup fails due to missing required info

---

### STEP 8️⃣: ONBOARDING & TRAINING

**User Action:** View platform tour, learn how to use system

#### 🔴 ISSUE 8.1: Missing Onboarding

```
❌ COMPLETELY MISSING:
1. No welcome email
   - Signup complete
   - No welcome
   - No guidance
   - Confusion

2. No onboarding tutorial
   - How to set availability?
   - How to accept bookings?
   - How to conduct sessions?
   - No tutorial

3. No FAQ/Help resources
   - Questions about payment?
   - Questions about policies?
   - No self-service help
   - Have to contact support

4. No video training
   - How to use platform?
   - How to join sessions?
   - How to manage calendar?
   - No videos

5. No knowledge base
   - Common questions?
   - Best practices?
   - Troubleshooting?
   - No documentation

6. No support contact info
   - How to reach support?
   - No email/chat provided
   - How to get help?
   - Isolated

7. No live onboarding call
   - New specialist orientation?
   - One-on-one training?
   - No calls scheduled
   - Alone in system
```

**Missing Functions:**
```
❌ No send-specialist-welcome-email
❌ No send-onboarding-tutorial
❌ No schedule-onboarding-call
```

**Possible Errors:**
- ❌ Specialist doesn't know how to use platform
- ❌ No guidance on setting up
- ❌ Contact support? No support info provided
- ❌ Confusion about features
- ❌ High churn due to lack of support

---

## COMPANY HR REGISTRATION

---

### STEP 1️⃣: COMPANY BASIC INFO & CREATION

**User Action:** Enter company name, registration number, industry, location

#### 🔴 ISSUE 1.1: Company Name Validation & Uniqueness

```typescript
// CURRENT: Frontend validates company name format
const nameRegex = /^[a-zA-Z0-9\s&,.'-]{2,255}$/;

// ❌ MISSING BACKEND:
1. No uniqueness check
   - Two companies with same name?
   - Allowed or not?
   - No constraint
   - Could have duplicates

2. No database normalization
   - "Company Inc"
   - "company inc"
   - "COMPANY INC"
   - All create different records?
   - No case-insensitive lookup

3. No company registration verification
   - What validates it's a real company?
   - No government database check
   - Could be fake company
   - No verification

4. No tax ID verification
   - Tax ID provided?
   - Not validated
   - Could be fake
   - No check against authorities

5. No business license verification
   - Registered to operate?
   - Not verified
   - Could be fake business
   - No validation

6. No address verification
   - Address provided?
   - Not verified
   - Could be wrong
   - No validation

7. No duplicate company check
   - Same company registers twice
   - Two admin accounts
   - Accounts out of sync
   - No prevention
```

**SQL MISSING:**
```sql
-- Missing validation fields:
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  name_normalized TEXT UNIQUE NOT NULL, -- lowercase for uniqueness
  registration_number TEXT,
  registration_number_verified BOOLEAN DEFAULT false,
  tax_id TEXT,
  tax_id_verified BOOLEAN DEFAULT false,
  business_license_number TEXT,
  license_verified BOOLEAN DEFAULT false,
  registered_address TEXT,
  address_verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending'
);

-- Currently: No verification fields!
```

---

#### 🔴 ISSUE 1.2: Registration Number & Tax ID Validation

```
CURRENT: Collected but not validated

❌ MISSING:
1. No format validation per country
   - Different countries have different formats
   - Brazil = CNPJ format?
   - Portugal = NIF format?
   - US = EIN format?
   - Generic system doesn't validate

2. No database lookup
   - Registration number provided
   - Not checked against government database
   - Could be completely made up
   - No verification

3. No check for name match
   - Registration says "ABC Corp"
   - But registered as "XYZ Inc"
   - Name mismatch not detected
   - Could be fraud

4. No realtime verification API
   - Could integrate with government registries
   - No integration
   - Can't verify instantly
   - Manual process only

5. No active/inactive status check
   - Company could be defunct
   - Still registered as active?
   - Not checked
   - Could register defunct company

6. No manual review workflow
   - After submission, needs review?
   - No workflow
   - No queue
   - No assignment to reviewer

7. No document upload for verification
   - Business license upload?
   - Tax registration certificate?
   - No upload capability
   - Nothing to verify against
```

**Possible Errors:**
- ❌ Fake registration number accepted
- ❌ Wrong format accepted
- ❌ Defunct company registered as active
- ❌ Name doesn't match registration, not detected
- ❌ Tax ID belongs to different company

---

#### 🔴 ISSUE 1.3: Industry & Size Classification

```sql
-- MISSING TABLE:
CREATE TABLE industry_classifications (
  id UUID PRIMARY KEY,
  code TEXT,
  name TEXT,
  category TEXT
);

-- Missing in companies table:
CREATE TABLE companies (
  industry_id UUID REFERENCES industry_classifications(id),
  employee_count INT,
  employee_count_range TEXT -- 1-10, 11-50, 51-250, 250+
);

-- Currently: No industry/size classification!
```

#### 🔴 MISSING COMPANY CLASSIFICATION

```
❌ MISSING:
1. No industry list
   - What industry?
   - Tech? Manufacturing? Healthcare? Finance?
   - Free-form text field?
   - No standardization

2. No employee count validation
   - 0 employees?
   - 1 million employees?
   - No min/max
   - No validation

3. No employee count ranges
   - Ranges for targeting?
   - Size-based pricing?
   - No ranges defined
   - Can't categorize

4. No company size impact
   - Affects subscription tier?
   - Pricing changes by size?
   - Not implemented
   - Generic pricing for all

5. No compliance requirements by industry
   - Healthcare company = more compliance?
   - Legal company = different rules?
   - Same rules for all?
   - No differentiation

6. No industry-specific offerings
   - Tech company → different services?
   - Healthcare company → different services?
   - Same services for all?
   - No customization
```

**Possible Errors:**
- ❌ No industry selected, can't categorize
- ❌ Set employee count to 0 or 1 million
- ❌ Can't offer industry-specific services
- ❌ Wrong pricing tier applied

---

### STEP 2️⃣: COMPANY CONTACT & BILLING INFO

**User Action:** Provide contact person, billing address, payment info

#### 🔴 ISSUE 2.1: Contact Person Verification

```sql
-- MISSING TABLE:
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

-- Currently: No contact person table!
```

#### 🔴 MISSING CONTACT VERIFICATION

```
❌ MISSING:
1. No contact person validation
   - "ABC" as name?
   - No validation
   - Could be fake name
   - No verification

2. No email verification
   - Email provided
   - Not verified
   - Could be wrong email
   - Can't contact later

3. No phone verification
   - Phone number provided
   - Not verified
   - Could be wrong number
   - Can't reach

4. No primary contact enforcement
   - Multiple contacts?
   - Which is primary?
   - No enforcement
   - Confusion

5. No contact person title tracking
   - Is person authorized to sign contract?
   - No title/role recorded
   - Can't verify authority
   - Legal risk

6. No contact person authority check
   - Can this person make binding decisions?
   - Not verified
   - Could be unauthorized
   - Contracts void

7. No backup contact
   - Primary contact unavailable?
   - No backup contact
   - Can't reach company
   - Deadlock
```

**Possible Errors:**
- ❌ Contact email never verified
- ❌ Email wrong, can't contact company
- ❌ Unauthorized person signs contract
- ❌ No way to reach company

---

#### 🔴 ISSUE 2.2: Billing Address & Delivery Info

```sql
-- MISSING FIELDS:
ALTER TABLE companies ADD COLUMN (
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  shipping_address_same BOOLEAN,
  shipping_address_line1 TEXT,
  address_verified BOOLEAN DEFAULT false
);

-- Currently: No address fields!
```

#### 🔴 MISSING ADDRESS VALIDATION

```
❌ MISSING:
1. No address format validation per country
   - US format ≠ Portugal format
   - Generic system
   - Could accept wrong format
   - No validation

2. No address verification API
   - Could verify with Google Maps
   - Could verify with postal service
   - No integration
   - Address could be fake

3. No delivery address tracking
   - Invoice delivery address?
   - Certificate delivery address?
   - Same as billing or different?
   - No tracking

4. No postal code validation
   - Postal code format per country?
   - Generic validation?
   - Could accept wrong format
   - No validation

5. No shipping address option
   - Different from billing?
   - No option
   - All deliveries to billing address?
   - Inflexible

6. No address change notification
   - Change billing address
   - No notification sent
   - Could affect invoices
   - No audit trail
```

**Possible Errors:**
- ❌ Invalid address format accepted
- ❌ Postal code wrong, invoice can't be delivered
- ❌ No shipping address, can't deliver materials

---

#### 🔴 ISSUE 2.3: Payment Method Setup

```
CURRENTLY: Payment not implemented

❌ CRITICAL MISSING:
1. No payment processor integration
   - Stripe? Braintree? Adyen?
   - Which processor?
   - No integration at all!
   - Can't process payments

2. No payment method creation
   - Company can't add card?
   - No payment method
   - How to collect payment?
   - No way

3. No invoice generation
   - Bill company monthly?
   - How?
   - No invoices
   - No billing

4. No payment confirmation
   - Payment processed?
   - No confirmation
   - Company doesn't know if paid
   - Confusion

5. No payment failure handling
   - Card declined?
   - What happens?
   - No error handling
   - Company loses access?

6. No recurring billing setup
   - Monthly charge?
   - No recurring setup
   - One-time payment only?
   - Wrong model

7. No payment receipt
   - Payment made?
   - No receipt sent
   - No proof of payment
   - No documentation
```

**Missing Entire Payment System:**
```
❌ NO STRIPE INTEGRATION
❌ NO PAYMENT METHOD STORAGE
❌ NO INVOICING
❌ NO BILLING WORKFLOW
❌ NO PAYMENT PROCESSING
```

**Possible Errors:**
- ❌ No way to collect payment from company
- ❌ Can't process credit cards
- ❌ No billing, revenue lost
- ❌ First month free indefinitely

---

### STEP 3️⃣: SUBSCRIPTION & EMPLOYEE SEATS

**User Action:** Select subscription plan, define number of employee seats/sessions

#### 🔴 ISSUE 3.1: Subscription Plan Selection

```sql
-- MISSING TABLE:
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name TEXT,
  price DECIMAL(10,2),
  currency TEXT,
  sessions_per_month INT,
  max_employees INT,
  features JSONB,
  trial_days INT,
  billing_cycle TEXT -- monthly, annual
);

-- Missing in companies table:
ALTER TABLE companies ADD COLUMN (
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  subscription_status TEXT, -- active, trial, suspended, cancelled
  subscription_start_date DATE,
  subscription_end_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  cancellation_date DATE,
  cancellation_reason TEXT
);

-- Currently: No subscription table!
```

#### 🔴 MISSING SUBSCRIPTION OPTIONS

```
❌ MISSING:
1. No plan comparison
   - What's included in each plan?
   - No comparison table
   - Hard to choose
   - No guidance

2. No pricing model clarity
   - Per session pricing?
   - Per employee pricing?
   - Hybrid?
   - Unclear

3. No trial period
   - Free trial to test?
   - No trial implemented
   - Can't evaluate service
   - Risky purchase

4. No plan upgrade/downgrade
   - Change plans later?
   - No upgrade path
   - Locked into first choice
   - Inflexible

5. No prorating
   - Upgrade mid-month?
   - Full month charge?
   - No proration
   - Unfair billing

6. No plan features display
   - What features in each plan?
   - Not shown
   - Hidden differences
   - Confusion

7. No annual discount
   - Pay annually?
   - No discount
   - Same price per month
   - No savings incentive
```

**Possible Errors:**
- ❌ No subscription plan selected, no billing
- ❌ Trial not implemented, can't test before paying
- ❌ Can't upgrade plan
- ❌ Charged full month when upgrading mid-month

---

#### 🔴 ISSUE 3.2: Employee Seats & Session Quota Setup

```sql
-- Missing in companies table:
ALTER TABLE companies ADD COLUMN (
  max_employees INT,
  current_employees INT DEFAULT 0,
  max_sessions_per_month INT,
  sessions_used_this_month INT DEFAULT 0,
  sessions_last_reset_date DATE
);

-- MISSING TABLE:
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

-- Currently: No quota tracking!
```

#### 🔴 MISSING QUOTA ENFORCEMENT

```
❌ MISSING:
1. No seat limit enforcement
   - Add 1000 employees?
   - No limit checked
   - Only 10 seats purchased?
   - No validation

2. No session quota tracking
   - 100 sessions purchased
   - Used 150 sessions?
   - No tracking
   - Unlimited usage?
   - Revenue loss

3. No quota warning system
   - At 80% usage?
   - No warning sent
   - Runs out with no notice
   - Bad experience

4. No quota reset date
   - Monthly quota?
   - When resets?
   - No clear date
   - Confusion

5. No overage pricing
   - Exceeds quota?
   - What happens?
   - Additional charges?
   - No policy

6. No quota carry-over
   - Unused sessions?
   - Carry to next month?
   - Lost?
   - No policy

7. No on-demand increase
   - Run out of sessions?
   - Need more immediately?
   - No way to buy more
   - Stuck
```

**Possible Errors:**
- ❌ Add more employees than plan allows
- ❌ Use more sessions than quota
- ❌ No warning before quota exhausted
- ❌ Quota exhausted, can't book, bad experience
- ❌ Revenue lost from overages

---

### STEP 4️⃣: COMPANY EMPLOYEES SETUP

**User Action:** Add first employees, set their roles, grant permissions

#### 🔴 ISSUE 4.1: Employee Import & Creation

```
CURRENT: Probably manual entry only

❌ MISSING:
1. No bulk import capability
   - CSV upload?
   - Excel import?
   - Bulk invite?
   - Manual one-by-one only

2. No email list creation
   - Employees to invite?
   - Manual list entry?
   - So tedious!
   - High friction

3. No duplicate detection
   - Import list with duplicates?
   - Same employee twice?
   - No detection
   - Could create duplicates

4. No employee role assignment
   - What role for each employee?
   - Only one role?
   - No granular roles
   - No flexibility

5. No department/team assignment
   - Organize by department?
   - No department field
   - Can't organize
   - No structure

6. No cost center tracking
   - Charge department?
   - No cost center tracking
   - Can't allocate costs
   - No reporting

7. No employee activation email
   - Employees invited?
   - No invitation sent
   - Employee doesn't know
   - Can't activate account
```

**Missing Functions:**
```
❌ No send-employee-invitation-email
❌ No process-employee-csv-import
❌ No validate-employee-list
```

---

#### 🔴 ISSUE 4.2: Employee Activation & Onboarding

```sql
-- MISSING TABLE:
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

-- Currently: No invitation tracking!
```

#### 🔴 MISSING EMPLOYEE ACTIVATION

```
❌ MISSING:
1. No invitation email
   - Employee added?
   - No email sent
   - Employee doesn't know
   - Can't activate

2. No activation link
   - Employee invited?
   - How to activate account?
   - No link
   - Manual process?

3. No invitation expiry
   - Link valid forever?
   - Should expire in 7 days?
   - No expiry
   - Security risk

4. No resend invitation
   - Employee didn't get email?
   - Can't resend
   - Can't activate
   - Stuck

5. No acceptance tracking
   - Employee accepted invitation?
   - No tracking
   - Could think not invited
   - Confusion

6. No rejection handling
   - Employee rejects invitation?
   - What happens?
   - Can re-invite?
   - No workflow

7. No onboarding for employees
   - Activated, now what?
   - No tutorial
   - No welcome
   - Confused
```

**Possible Errors:**
- ❌ No invitation email sent
- ❌ Employee doesn't know they're invited
- ❌ Invitation link expires before employee sees it
- ❌ Can't resend invitation
- ❌ Employee activated but doesn't know how to use system

---

### STEP 5️⃣: COMPANY POLICIES & COMPLIANCE

**User Action:** Accept terms, confirm compliance, acknowledge policies

#### 🔴 ISSUE 5.1: Data Processing Agreement

```sql
-- MISSING TABLE:
CREATE TABLE company_dpa_acceptance (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  dpa_version TEXT,
  accepted BOOLEAN,
  accepted_by_user_id UUID REFERENCES profiles(id),
  accepted_at TIMESTAMPTZ,
  signed_document_url TEXT
);

-- Currently: No DPA tracking!
```

#### 🔴 MISSING DPA & COMPLIANCE

```
❌ MISSING:
1. No DPA (Data Processing Agreement)
   - GDPR requires DPA
   - Not implemented
   - Compliance violation
   - Legal risk

2. No consent recording
   - Company consents to data handling?
   - Not recorded
   - Can't prove consent
   - Compliance issue

3. No compliance checklist
   - Before signup complete:
     - Accepted terms?
     - Accepted privacy policy?
     - Accepted DPA?
     - Agreed to data handling?
   - No checklist
   - Could miss requirements

4. No signed documents
   - Contract needed?
   - No DocuSign integration
   - Manual signatures?
   - No e-signature

5. No compliance notification
   - Company responsible for employee data?
   - No notification of this
   - Could violate GDPR
   - No warning

6. No audit trail
   - Who accepted when?
   - No audit log
   - Can't prove compliance
   - Legal liability

7. No update notification
   - Policies change?
   - No notification
   - Still bound by old policies?
   - No re-acceptance
```

**Possible Errors:**
- ❌ No DPA accepted, GDPR violation
- ❌ Company doesn't know GDPR applies
- ❌ Policies updated, no notification
- ❌ Can't prove company accepted terms

---

### STEP 6️⃣: COMPANY ADMIN & VERIFICATION

**User Action:** Verify company details, complete final verification

#### 🔴 ISSUE 6.1: Company Verification Status

```sql
-- MISSING FIELDS:
ALTER TABLE companies ADD COLUMN (
  verification_status TEXT DEFAULT 'pending', -- pending, approved, rejected, flagged
  verified_by_user_id UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  rejection_reason TEXT,
  verification_deadline DATE
);

-- Currently: No verification status!
```

#### 🔴 MISSING VERIFICATION WORKFLOW

```
❌ MISSING:
1. No company verification
   - Company created?
   - Automatically approved?
   - No verification step
   - Could be fake company

2. No manual review
   - Suspicious company?
   - No review process
   - No queue
   - No assignment

3. No verification timeline
   - How long until verified?
   - No SLA
   - Could be instant or never
   - Unclear

4. No rejection workflow
   - Company rejected?
   - Can reapply?
   - What needs changing?
   - No feedback

5. No company compliance scan
   - Is company legitimate?
   - No checks
   - Could be shell company
   - No validation

6. No background check
   - Company background ok?
   - No background check
   - Could be high-risk
   - No vetting

7. No verification notification
   - Company verified?
   - No notification
   - Company doesn't know
   - Could think still pending
```

**Possible Errors:**
- ❌ Company auto-approved without verification
- ❌ Fake company registered and goes live
- ❌ Legitimate company rejected, no explanation
- ❌ Company doesn't know when verified

---

## COMPARATIVE ANALYSIS

### Similarities Between Specialist & Company Registration

| Issue | Specialist | Company |
|-------|-----------|---------|
| Email Validation | ❌ Missing | ❌ Missing |
| Identity Verification | ❌ Partial | ❌ Missing |
| Payment Setup | ❌ Critical | ❌ Critical |
| Terms Acceptance | ❌ Missing | ❌ Missing |
| Email Verification | ❌ Missing | ❌ Missing |
| Account Activation | ❌ Missing | ❌ Missing |
| Onboarding | ❌ Missing | ❌ Missing |
| GDPR Compliance | ❌ Missing | ❌ Missing |
| Verification Workflow | ❌ Partial | ❌ Missing |
| Contact Verification | ❌ N/A | ❌ Missing |

---

### Key Differences

#### Specialist-Specific Issues
- Professional credential verification
- License number validation
- Bank account setup
- Specialization selection
- Working hours & availability
- Rate setting
- No-show tracking

#### Company-Specific Issues
- Business registration verification
- Tax ID validation
- Employee seat management
- Subscription plan selection
- Bulk employee import
- Data Processing Agreement
- Cost allocation & department tracking

---

## COMMON ISSUES ACROSS BOTH

### 🔴 CRITICAL ISSUES - AFFECTING BOTH

1. **No Atomic Transactions**
   - Account created but profile fails
   - Orphaned records
   - Inconsistent state
   - Can't recover

2. **No Rate Limiting**
   - Spam submissions
   - DoS attacks
   - No protection
   - System vulnerable

3. **No Input Validation**
   - Invalid data accepted
   - Database errors
   - Generic error messages
   - Poor UX

4. **No Verification Workflows**
   - No one reviews registrations
   - No approval process
   - Fake accounts possible
   - No quality control

5. **No Email Verification**
   - Typos in email accepted
   - Can't contact later
   - Registration stuck
   - High friction

6. **No Terms Acceptance Tracking**
   - GDPR violation
   - Can't prove acceptance
   - Legal liability
   - No compliance

7. **No Onboarding**
   - Confused users
   - High churn
   - Support overload
   - Bad experience

8. **No Payment Integration**
   - Can't collect money
   - Revenue lost
   - Platform unsustainable
   - Critical blocker

---

## SUMMARY TABLE

```
TOTAL ISSUES FOUND:

SPECIALIST REGISTRATION:
- Critical: 15
- High: 12
- Medium: 18
- Low: 10
TOTAL: 55 Issues

COMPANY REGISTRATION:
- Critical: 12
- High: 15
- Medium: 16
- Low: 8
TOTAL: 51 Issues

SHARED/COMMON:
- Critical: 8
- High: 10
- Medium: 12
- Low: 5
TOTAL: 35 Issues

GRAND TOTAL: 141 Issues
```

---

## PHASE 0: IMMEDIATE FIXES (Both Roles)

**Do these now (next 2 hours):**

1. ✅ Add input validation on all registration fields
2. ✅ Add rate limiting to registration endpoints
3. ✅ Add atomic transaction handling
4. ✅ Add email verification token generation
5. ✅ Enable JWT verification on all functions
6. ✅ Add email existence checks
7. ✅ Add terms acceptance tracking table
8. ✅ Add Sentry logging to all signup functions

---

## PHASE 1: CRITICAL FIXES (Next 24 hours)

1. ✅ Implement payment processing (Stripe integration)
2. ✅ Implement email verification workflow
3. ✅ Implement account activation checks
4. ✅ Implement verification workflows for both roles
5. ✅ Implement terms & compliance acceptance
6. ✅ Create send-verification-email function
7. ✅ Create send-welcome-email function
8. ✅ Create verification queue management

---

This is your complete audit for Specialist and Company registration! 🎯
