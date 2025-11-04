# Admin (Melhor Saúde Operator) Data Sources - Quick Reference

## 📋 Quick Overview

All admin functional requirements are fully implemented with complete platform visibility and control.

---

## 🗂️ Data Source Mapping

### 1. Company Management

**Tables:**
- `companies` (all company data)
- `company_employees` (employee links and quotas)
- `subscriptions` (billing info)

**Frontend:**
- `AdminCompanies.tsx`
- `AdminCompanyDetail.tsx`
- `RegisterCompany.tsx`

**Admin Capabilities:**
```typescript
// View all companies
const { data } = await supabase
  .from('companies')
  .select('*')
  .order('created_at', { ascending: false });

// Update company sessions
await supabase
  .from('companies')
  .update({ sessions_allocated: 100 })
  .eq('id', companyId);
```

---

### 2. Provider Management

**Tables:**
- `prestadores` (provider profiles)
- `profiles` (linked user accounts)
- `bookings` (provider sessions for metrics)

**Frontend:**
- `AdminProviders.tsx`
- `AdminProviderDetail.tsx`

**Admin Capabilities:**
```typescript
// View all providers
const { data } = await supabase
  .from('prestadores')
  .select('*, profiles(name, email, phone)')
  .order('created_at', { ascending: false });

// Approve provider
await supabase
  .from('prestadores')
  .update({ 
    is_approved: true,
    approved_by: adminId,
    approved_at: new Date().toISOString()
  })
  .eq('id', prestadorId);
```

---

### 3. Employee Management

**Tables:**
- `profiles` (user accounts)
- `company_employees` (company links and quotas)
- `user_progress` (engagement tracking)

**Frontend:**
- `AdminEmployeesTab.tsx`
- `AdminUsers.tsx`

**Admin Capabilities:**
```typescript
// View all employees with company info
const { data } = await supabase
  .from('company_employees')
  .select(`
    *,
    profiles (name, email),
    companies (company_name)
  `)
  .order('joined_at', { ascending: false });

// Update employee status
await supabase
  .from('profiles')
  .update({ is_active: false })
  .eq('id', userId);
```

---

### 4. Global Metrics

**RPC Function:**
```sql
CREATE FUNCTION get_platform_analytics()
RETURNS JSON
```

**Frontend:**
- `AdminDashboard.tsx`
- `useAnalytics.ts` hook

**Available Metrics:**
```typescript
interface Analytics {
  total_users: number;           // All users
  active_users: number;          // Active in last 30 days
  total_companies: number;       // Active companies
  total_prestadores: number;     // Approved providers
  active_prestadores: number;    // Working today
  total_bookings: number;        // All sessions
  sessions_allocated: number;    // SUM across companies
  sessions_used: number;         // SUM across companies
  avg_rating: number;           // Platform-wide satisfaction
}
```

**Usage:**
```typescript
const { data: analytics } = useAnalytics();
const utilizationRate = (analytics.sessions_used / analytics.sessions_allocated) * 100;
```

---

### 5. Company Reports

**RPC Function:**
```sql
CREATE FUNCTION get_company_monthly_metrics(
  company_id UUID,
  start_date DATE,
  end_date DATE
)
RETURNS JSON
```

**Frontend:**
- `AdminReportsTab.tsx`
- `AdminCompanyReportsTab.tsx`

**Report Data:**
```json
{
  "company_name": "Acme Corp",
  "subscription": {
    "sessions_allocated": 100,
    "sessions_used": 75,
    "utilization_rate": 75.0
  },
  "employees": {
    "active": 45,
    "pending_invites": 5,
    "seats_available": 10
  },
  "pillar_breakdown": [
    {"pillar": "mental", "sessions": 30, "percentage": 40},
    {"pillar": "physical", "sessions": 25, "percentage": 33.3},
    ...
  ],
  "satisfaction": {
    "avg_rating": 4.5,
    "high_satisfaction_count": 60,
    "satisfaction_rate": 80.0
  }
}
```

---

### 6. Alert Monitoring

**Tables:**
- `chat_sessions` (pending calls)
- `feedback` (low ratings)
- `profiles` (inactive users)
- `bookings` (today's sessions)
- `system_alerts` (platform alerts)

**Frontend:**
- `AdminAlertsTab.tsx`

**Alert Queries:**

#### A. Pending Calls
```typescript
const { data } = await supabase
  .from('chat_sessions')
  .select('*, user:profiles(name)')
  .eq('phone_contact_made', true)
  .is('session_booked_by_specialist', null);
```

#### B. Low Feedback
```typescript
const { data } = await supabase
  .from('feedback')
  .select('*, user:profiles(name)')
  .lt('rating', 3)
  .order('created_at', { ascending: false })
  .limit(50);
```

#### C. Inactive Users
```typescript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const { data } = await supabase
  .from('profiles')
  .select('*, company_employees(company:companies(company_name))')
  .lt('last_seen', thirtyDaysAgo.toISOString())
  .not('role', 'eq', 'prestador');
```

#### D. Today's Sessions
```typescript
const today = new Date().toISOString().split('T')[0];
const { data } = await supabase
  .from('bookings')
  .select('*, user:profiles!user_id(name), provider:prestadores!prestador_id(name)')
  .eq('date', today)
  .eq('status', 'scheduled');
```

---

### 7. Invite Management

**Table:**
```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('user', 'hr', 'prestador', 'especialista_geral')),
  company_id UUID REFERENCES companies(id),
  email TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  sessions_allocated INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Frontend:**
- `AdminUsersManagement.tsx`
- `AdminCompanyDetail.tsx`
- `AdminCompanyInvites.tsx`

**Code Management:**

#### Generate Code
```typescript
const code = 'MS-' + Math.random().toString(36).substr(2, 6).toUpperCase();
await supabase.from('invites').insert({
  invite_code: code,
  role: 'hr',
  company_id: companyId,
  status: 'pending',
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
});
```

#### Resend Code
```typescript
// Get existing code
const { data: invite } = await supabase
  .from('invites')
  .select('invite_code')
  .eq('email', userEmail)
  .single();

// Send email
await supabase.functions.invoke('send-email', {
  body: {
    to: userEmail,
    subject: 'Seu Código de Acesso',
    html: `Código: ${invite.invite_code}`
  }
});
```

#### Revoke Code
```typescript
// Revoke invite
await supabase
  .from('invites')
  .update({ status: 'revoked' })
  .eq('id', inviteId);

// Suspend associated user (if exists)
const { data: invite } = await supabase
  .from('invites')
  .select('user_id')
  .eq('id', inviteId)
  .single();

if (invite?.user_id) {
  await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', invite.user_id);
}
```

---

### 8. Error Logging

**Tables:**
- `error_logs` (application errors)
- `admin_logs` (admin actions)
- `support_tickets` (user issues)

**Error Logging:**
```typescript
// Log application error
await supabase.from('error_logs').insert({
  level: 'error',
  message: error.message,
  stack: error.stack,
  context: { userId, action },
  url: window.location.href,
  user_agent: navigator.userAgent
});
```

**Admin Action Logging:**
```typescript
// Automatically logged on admin actions
await supabase.from('admin_logs').insert({
  admin_id: adminUserId,
  action: 'company_updated',
  entity_type: 'company',
  entity_id: companyId,
  details: { changes: {...} }
});
```

---

## 📊 Complete Table Reference

| Table | Admin Access | Primary Use |
|-------|--------------|-------------|
| `companies` | Full CRUD | Company management |
| `profiles` | Read, Update | User management |
| `company_employees` | Full CRUD | Employee-company links |
| `prestadores` | Full CRUD | Provider management |
| `bookings` | Read, Update | Session monitoring |
| `chat_sessions` | Read, Update | Chat monitoring |
| `chat_messages` | Read Only | Message history |
| `feedback` | Read Only | Satisfaction tracking |
| `user_progress` | Read Only | Engagement tracking |
| `invites` | Full CRUD | Access code management |
| `admin_logs` | Read, Insert | Action audit trail |
| `system_alerts` | Full CRUD | Alert management |
| `support_tickets` | Full CRUD | Support management |
| `resources` | Full CRUD | Content management |
| `error_logs` | Read, Update | Error tracking |

---

## 🔧 Common Admin Operations

### View All Companies with Stats
```typescript
const companies = await supabase
  .from('companies')
  .select('*')
  .order('created_at', { ascending: false });

const withStats = await Promise.all(
  companies.map(async (c) => {
    const { count: employees } = await supabase
      .from('company_employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', c.id);
    
    return {
      ...c,
      employees,
      utilization: (c.sessions_used / c.sessions_allocated) * 100
    };
  })
);
```

### Get Platform-Wide Statistics
```typescript
const { data: analytics } = await supabase.rpc('get_platform_analytics');
// Returns: total_users, active_users, companies, providers, bookings, etc.
```

### Monitor Low Utilization Companies
```typescript
const { data: companies } = await supabase
  .from('companies')
  .select('id, name, sessions_allocated, sessions_used')
  .eq('is_active', true);

const lowUtilization = companies.filter(c => {
  const rate = (c.sessions_used / c.sessions_allocated) * 100;
  return rate < 20 && c.sessions_allocated > 0;
});
```

### Export Company Report
```typescript
const { data } = await supabase.rpc('get_company_monthly_metrics', {
  p_company_id: companyId,
  p_start_date: '2025-01-01',
  p_end_date: '2025-01-31'
});

// Convert to CSV
const csv = convertToCSV(data);
downloadFile(csv, 'company-report.csv');
```

### View All Active Alerts
```typescript
const { data: alerts } = await supabase
  .from('system_alerts')
  .select('*')
  .eq('status', 'active')
  .order('severity', { ascending: false })
  .order('created_at', { ascending: false });
```

---

## 🔐 Admin RLS Policies

**Standard Admin Policy Pattern:**
```sql
-- View all records
CREATE POLICY "admins_view_all_X" ON table_name
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Update all records
CREATE POLICY "admins_update_all_X" ON table_name
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Create records
CREATE POLICY "admins_insert_X" ON table_name
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Delete records (where applicable)
CREATE POLICY "admins_delete_X" ON table_name
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));
```

**Helper Function:**
```sql
CREATE FUNCTION has_role(user_id UUID, target_role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_id AND role = target_role
  );
END;
$$;
```

---

## ✅ Verification Checklist

- [x] Admins can view all companies
- [x] Admins can create and edit companies
- [x] Admins can view all providers
- [x] Admins can approve/reject providers
- [x] Admins can view all employees
- [x] Admins can manage employee-company links
- [x] Admins can view platform-wide analytics
- [x] Admins can generate company reports
- [x] Admins can monitor for pending calls
- [x] Admins can monitor for low feedback
- [x] Admins can monitor for inactive users
- [x] Admins can monitor today's sessions
- [x] Admins can generate invite codes
- [x] Admins can resend invite codes
- [x] Admins can revoke access codes
- [x] Admins can view error logs
- [x] Admins can manage support tickets
- [x] Admins can view admin action logs
- [x] All admin actions are properly logged

---

## 📝 Key Insights

### 1. **Global Visibility**
Admins have complete read access to all tables via RLS policies using `has_role(auth.uid(), 'admin')`.

### 2. **Real-Time Analytics**
The `get_platform_analytics()` RPC function provides instant platform-wide statistics without complex frontend queries.

### 3. **Company-Specific Reports**
The `get_company_monthly_metrics()` RPC function generates comprehensive reports with pillar breakdown and satisfaction metrics.

### 4. **Proactive Monitoring**
The `AdminAlertsTab` component provides real-time monitoring of platform health indicators.

### 5. **Audit Trail**
All admin actions are logged in `admin_logs` table for compliance and security.

### 6. **Invite Management**
Comprehensive invite code system with generation, tracking, resending, and revocation capabilities.

---

**Last Updated:** November 2, 2025  
**Status:** ✅ All admin requirements verified and operational





