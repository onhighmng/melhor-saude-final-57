# Complete Database Setup Guide
## Melhor Saúde Platform - Full Functionality

---

## ✅ Summary of Missing Tables

Your database was **missing 4 critical tables** for full functionality:

### Missing Tables Found:
1. **`subscriptions`** - Manages user and company subscription plans
2. **`invoices`** - Handles billing and invoicing
3. **`transactions`** - Tracks all payment transactions
4. **`platform_settings`** - Stores system-wide configuration settings

### All Tables Now Included (36 Total):

**Core Tables:**
- ✅ profiles
- ✅ companies
- ✅ company_employees
- ✅ user_roles

**Prestador/Provider Tables:**
- ✅ prestadores
- ✅ prestador_availability
- ✅ prestador_schedule
- ✅ prestador_performance

**Booking & Sessions:**
- ✅ bookings
- ✅ session_notes
- ✅ session_recordings

**Chat System:**
- ✅ chat_sessions
- ✅ chat_messages

**User Experience:**
- ✅ onboarding_data
- ✅ user_milestones
- ✅ user_progress
- ✅ user_goals

**Content & Resources:**
- ✅ resources
- ✅ resource_access_log
- ✅ self_help_content
- ✅ content_views
- ✅ psychological_tests
- ✅ test_results

**Admin & Management:**
- ✅ invites
- ✅ admin_logs
- ✅ admin_analytics
- ✅ specialist_assignments
- ✅ specialist_analytics
- ✅ specialist_call_logs
- ✅ change_requests

**Communication:**
- ✅ notifications
- ✅ feedback

**Billing & Payments:** (NEW)
- ✅ subscriptions
- ✅ invoices
- ✅ transactions

**Configuration:** (NEW)
- ✅ platform_settings

---

## 📋 Execution Order

Run these SQL files **in order** in your Supabase SQL Editor:

### Step 1: Database Structure
```sql
-- File: DATABASE_VERIFICATION_AND_FIXES.sql
-- Creates all base tables and adds missing columns
-- Time: ~2-3 minutes
```

### Step 2: Billing & Settings Tables
```sql
-- File: MISSING_TABLES_BILLING_SETTINGS.sql
-- Adds subscriptions, invoices, transactions, and platform_settings
-- Adds all missing columns to existing tables
-- Time: ~1-2 minutes
```

### Step 3: RPC Functions
```sql
-- File: ALL_RPC_FUNCTIONS.sql
-- Creates all 40+ database functions for business logic
-- Time: ~3-4 minutes
```

### Step 4: Security Policies
```sql
-- File: RLS_POLICIES_COMPLETE.sql
-- Sets up Row Level Security on all tables
-- Time: ~2-3 minutes
```

**Total Setup Time: ~10-12 minutes**

---

## 🔧 What Each Script Does

### 1. DATABASE_VERIFICATION_AND_FIXES.sql

**Creates Missing Tables:**
- admin_analytics
- prestador_availability
- prestador_schedule
- prestador_performance
- session_recordings
- user_goals
- specialist_call_logs
- resource_access_log

**Adds Missing Columns:**
- Companies: employee_seats, plan_type, contact_email, etc.
- Profiles: name, bio, metadata, department, etc.
- Bookings: meeting_type, session_type, pillar_specialties, etc.
- Prestadores: biography, languages, session_duration, etc.
- And many more...

**Creates Performance Indexes:**
- 30+ indexes for optimal query performance

---

### 2. MISSING_TABLES_BILLING_SETTINGS.sql

**Creates 4 New Tables:**
1. **subscriptions** - Subscription management
   - plan_type, status, billing_cycle
   - Stripe integration fields
   - Auto-renewal settings

2. **invoices** - Invoice generation
   - invoice_number, amounts, tax
   - Payment tracking
   - Due dates and status

3. **transactions** - Payment records
   - Transaction types (payment, refund, adjustment)
   - Provider integration
   - Status tracking

4. **platform_settings** - System configuration
   - Key-value configuration storage
   - Category-based organization
   - Public/private settings

**Adds Enhanced Columns:**
- Companies: size, number_of_employees, session_model, pricing, contract dates
- Company_employees: position, status, deactivation tracking
- Prestadores: qualifications, credentials, ratings, approval workflow
- Bookings: quota_type, referral_notes
- Session_recordings: encryption, transcription
- Resources: premium content, ratings, publication workflow
- And more...

---

### 3. ALL_RPC_FUNCTIONS.sql

**Creates 40+ Functions:**

**Utility Functions:**
- `is_admin()` - Check admin status
- `has_role(user_id, role)` - Check user role
- `get_user_primary_role(user_id)` - Get primary role

**Admin Functions:**
- `promote_to_admin(email)` - Promote user to admin
- `assign_role_to_user(email, role)` - Assign any role

**Invite/Access Code Functions:**
- `generate_access_code(user_type, company_id, metadata, expires_days)`
- `validate_access_code(code)`
- `promote_user_from_code(user_id, code)`
- `can_generate_invite_code(company_id)` - Check seat availability

**Booking Functions:**
- `book_session_with_quota_check(...)` - Book with automatic quota management
- `cancel_booking_with_refund(...)` - Cancel with optional quota refund
- `complete_booking_session(...)` - Complete and rate session
- `get_provider_availability(...)` - Check provider availability

**Analytics Functions:**
- `get_company_analytics(company_id)` - Full company metrics
- `get_company_seat_stats(company_id)` - Seat utilization
- `get_user_session_balance(user_id)` - User quota info
- `get_provider_performance(provider_id)` - Provider stats
- `get_platform_utilization()` - Platform-wide metrics
- `get_prestador_performance(start_date, end_date)` - Admin view
- `get_specialist_performance(start_date, end_date)` - Specialist metrics

**Dashboard Functions:**
- `get_user_dashboard_data(user_id)` - User dashboard
- `get_hr_company_metrics(company_id)` - HR dashboard
- `get_company_monthly_metrics(company_id, start, end)` - Monthly reports

**Specialist Functions:**
- `get_specialist_escalated_chats()` - Get open cases
- `refer_to_prestador(chat_id, prestador_id, notes)` - Create referrals
- `get_prestador_sessions(prestador_id)` - Get all sessions

**Employee Functions:**
- `assign_employee_sessions(employee_id, quota)` - Adjust quotas

**Other Functions:**
- `create_notification(user_id, type, title, message, ...)`
- `generate_goals_from_onboarding(user_id)`
- `initialize_user_milestones(user_id)`
- `get_user_journey_data(user_id)`
- `increment_content_views(content_id)`
- `calculate_monthly_performance(prestador_id, month)`
- `get_company_subscription_status(company_id)`

---

### 4. RLS_POLICIES_COMPLETE.sql

**Secures 36 Tables with 100+ Policies:**

**Policy Types:**
- View own data (users see their own records)
- View company data (HR sees company employees)
- Admin access (admins see everything)
- Role-based access (prestadores, specialists, etc.)
- Public access (resources, prestador profiles)

**Tables Secured:**
- All user tables
- All company tables
- All booking tables
- All chat tables
- All admin tables
- All content tables
- All billing tables
- All analytics tables

---

## 🎯 Key Features Enabled

### 1. **Complete User Management**
- Multi-role support (user, admin, HR, prestador, specialist)
- Company employee management
- Session quota tracking
- Role-based permissions

### 2. **Booking System**
- Session booking with quota checks
- Automatic quota deduction
- Cancellation with refunds
- Rescheduling support
- Multiple booking sources (direct, referral, AI chat)

### 3. **Company Management**
- Subscription packages
- Employee seat limits
- Session allocation (pool vs fixed)
- Contract management
- HR portal access

### 4. **Provider Management**
- Provider profiles
- Availability scheduling
- Performance tracking
- Rating system
- Approval workflow

### 5. **Specialist System**
- Chat session management
- Phone escalation tracking
- Referral system
- Performance analytics

### 6. **Billing & Payments**
- Subscription management
- Invoice generation
- Transaction tracking
- Stripe integration ready

### 7. **Content & Resources**
- Self-help content
- Resource library
- Access tracking
- Psychological tests
- Progress tracking

### 8. **Analytics & Reporting**
- Company analytics
- Provider performance
- Specialist metrics
- Platform utilization
- Session statistics

### 9. **Security**
- Row Level Security on all tables
- Role-based access control
- Secure functions (SECURITY DEFINER)
- Audit logging

---

## ✅ Verification Steps

After running all scripts, verify with these queries:

### Check All Tables Exist:
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
-- Should return 36 tables
```

### Check All Functions Exist:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
-- Should return 40+ functions
```

### Check RLS is Enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
-- rowsecurity should be true for most tables
```

### Check Policies Exist:
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Should return 100+ policies
```

---

## 🚀 Next Steps

After completing the database setup:

1. **Test User Registration Flow**
   - Generate invite codes
   - Register test users
   - Verify roles are assigned

2. **Test Booking Flow**
   - Create test bookings
   - Check quota deduction
   - Test cancellations

3. **Test Admin Functions**
   - Promote a user to admin
   - View analytics
   - Manage companies

4. **Test HR Functions**
   - Generate employee invite codes
   - View company dashboard
   - Manage employee quotas

5. **Configure Platform Settings**
   ```sql
   INSERT INTO platform_settings (setting_key, setting_value, category, is_public)
   VALUES 
     ('maintenance_mode', '{"enabled": false}'::jsonb, 'general', true),
     ('default_sessions_per_employee', '{"value": 5}'::jsonb, 'general', false),
     ('stripe_enabled', '{"enabled": false}'::jsonb, 'billing', false);
   ```

---

## 📊 Database Statistics

- **Total Tables:** 36
- **Total Functions:** 40+
- **Total RLS Policies:** 100+
- **Total Indexes:** 50+
- **Supported Roles:** 6 (user, admin, HR, prestador, specialist, especialista_geral)
- **Pillars:** 4 (mental health, physical wellness, financial, legal)

---

## 🔒 Security Features

- ✅ Row Level Security on all sensitive tables
- ✅ Role-based access control
- ✅ Secure RPC functions
- ✅ Audit logging for admin actions
- ✅ Encrypted session recordings
- ✅ Confidential session notes
- ✅ Anonymous test results option

---

## 💡 Additional Notes

### Missing Columns Now Added:
The scripts add **50+ missing columns** across existing tables for enhanced functionality:
- Enhanced company management fields
- Provider approval workflow
- Booking refinements
- Session recording features
- Resource premium content support
- Feedback management workflow
- And much more...

### Performance Optimizations:
- Indexed all foreign keys
- Indexed frequently queried columns
- Indexed date/time columns for reporting
- Optimized for dashboard queries

### Data Integrity:
- Foreign key constraints
- Check constraints on enums
- Unique constraints where needed
- NOT NULL on required fields

---

## 📞 Support

If you encounter any issues:

1. Check the error message carefully
2. Verify you ran scripts in correct order
3. Check that Supabase connection is active
4. Verify you have sufficient permissions
5. Check the Supabase logs for detailed errors

---

**Your database is now ready for full platform functionality! 🎉**




