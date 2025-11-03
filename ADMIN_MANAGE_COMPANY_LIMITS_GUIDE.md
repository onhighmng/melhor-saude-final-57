# 🎛️ Admin Guide: Managing Company Subscription Limits

## Overview

Company subscription limits (`employee_seats`) control how many employee accounts a company can create. This guide explains who sets these limits and how.

## Current System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  WHO SETS LIMITS                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Platform Admins (Manual) ⭐ CURRENT                     │
│     └─ Via Supabase Dashboard or SQL                       │
│                                                             │
│  2. During Company Registration (Future)                    │
│     └─ Automatic based on selected plan                    │
│                                                             │
│  3. Payment System Integration (Future)                     │
│     └─ Stripe webhooks update limits automatically         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Method 1: Platform Admins (Current) ⭐

### Who Has Access?
- **Platform Super Admins**
- **Technical Team** (with database access)
- **Sales/Customer Success Team** (trained on SQL)

### How to Set Limits

#### **Option A: Supabase Dashboard** (Easiest)

1. **Login** to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Table Editor** (left sidebar)
4. Click **`companies`** table
5. Find the company row
6. **Edit** the `employee_seats` column
7. **Save** changes

**✅ Pros:**
- Visual interface
- No SQL knowledge needed
- See all company data

**❌ Cons:**
- Manual process
- One company at a time
- Requires dashboard access

---

#### **Option B: SQL Query** (Fastest)

```sql
-- Set limit for one company
UPDATE companies 
SET employee_seats = 100,
    updated_at = NOW()
WHERE name = 'Company Name';

-- Bulk update (same tier)
UPDATE companies 
SET employee_seats = 50
WHERE plan_type = 'business'
  AND is_active = true;

-- Set with validation
UPDATE companies 
SET employee_seats = 200
WHERE id = 'company-uuid'
  AND is_active = true
RETURNING id, name, employee_seats;
```

**✅ Pros:**
- Very fast
- Bulk operations possible
- Can script/automate

**❌ Cons:**
- Requires SQL knowledge
- Direct database access needed
- Easy to make mistakes

---

#### **Option C: Admin UI** (Recommended to Build)

Create a dedicated admin page: `/admin/companies`

**Features:**
- List all companies
- View current limits & usage
- Update limits with dropdown (10, 25, 50, 100, 200, 500, 1000)
- See usage percentage
- Upgrade/downgrade workflow
- Audit log of changes

**Benefits:**
- ✅ Controlled access (admin role only)
- ✅ User-friendly interface
- ✅ Built-in validation
- ✅ Audit trail
- ✅ No direct database access needed

---

## Method 2: During Company Registration (Future)

### Self-Service Model

When a company registers:

```typescript
// In company registration form
async function registerCompany(formData: CompanyRegistrationForm) {
  const { selectedPlan, companyName, email } = formData;
  
  // Determine seats based on selected plan
  const planSeats = {
    'starter': 10,
    'business': 50,
    'professional': 100,
    'enterprise': 200
  };
  
  const { data: company } = await supabase
    .from('companies')
    .insert({
      name: companyName,
      email: email,
      employee_seats: planSeats[selectedPlan],
      plan_type: selectedPlan,
      is_active: true
    })
    .select()
    .single();
    
  return company;
}
```

### Guided Selection Flow

```
Step 1: Company Info
├─ Name
├─ Email
└─ Phone

Step 2: Choose Package ⭐
├─ ○ Starter (10 seats) - 7.000 MZN/month
├─ ○ Business (50 seats) - 27.000 MZN/month
├─ ○ Professional (100 seats) - 47.000 MZN/month
└─ ○ Enterprise (Custom) - Contact us

Step 3: Payment
└─ Enter payment details

✅ Confirmation
└─ Account created with 50 seats!
```

---

## Method 3: Payment Integration (Future)

### Stripe Webhook Automation

Limits update automatically based on subscription changes:

```typescript
// Edge Function: handle-stripe-webhook
export async function handleStripeWebhook(event: StripeEvent) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      const newSeats = getPlanSeats(subscription.plan.id);
      
      await supabase
        .from('companies')
        .update({ 
          employee_seats: newSeats,
          plan_type: subscription.plan.nickname
        })
        .eq('stripe_customer_id', subscription.customer);
      break;
      
    case 'customer.subscription.deleted':
      // Downgrade to free tier
      await supabase
        .from('companies')
        .update({ 
          employee_seats: 5, // Free tier
          plan_type: 'free'
        })
        .eq('stripe_customer_id', subscription.customer);
      break;
  }
}

function getPlanSeats(planId: string): number {
  const planMap = {
    'price_starter': 10,
    'price_business': 50,
    'price_professional': 100,
    'price_enterprise': 200
  };
  return planMap[planId] || 50;
}
```

---

## Package Tier Reference

### Recommended Pricing Tiers

| Tier | Seats | Price/Month | Target Customer |
|------|-------|-------------|-----------------|
| **Free Trial** | 5 | 0 MZN | Testing, very small teams |
| **Starter** | 10 | 7.000 MZN | Small businesses, startups |
| **Business** | 50 | 27.000 MZN | Medium companies |
| **Professional** | 100 | 47.000 MZN | Larger organizations |
| **Enterprise** | 200+ | Custom | Corporations |
| **Unlimited** | 10,000 | Custom | Special contracts |

### SQL to Set Tiers

```sql
-- Starter Package
UPDATE companies SET employee_seats = 10 WHERE plan_type = 'starter';

-- Business Package (Default)
UPDATE companies SET employee_seats = 50 WHERE plan_type = 'business';

-- Professional Package
UPDATE companies SET employee_seats = 100 WHERE plan_type = 'professional';

-- Enterprise Package
UPDATE companies SET employee_seats = 200 WHERE plan_type = 'enterprise';

-- Custom/Unlimited
UPDATE companies SET employee_seats = 10000 WHERE plan_type = 'unlimited';
```

---

## Access Control & Permissions

### Who Should Set Limits?

#### ✅ **Should Have Access:**
- Platform super admins
- Sales team (via admin UI)
- Customer success managers
- Technical support (with supervision)

#### ❌ **Should NOT Have Access:**
- Company HR users (can't change their own limit)
- Regular employees
- Prestadores/specialists
- External partners

### RLS Policy Recommendation

```sql
-- Companies can only VIEW their own employee_seats
CREATE POLICY "Companies can view own limits"
ON companies FOR SELECT
TO authenticated
USING (id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

-- Only admins can UPDATE employee_seats
CREATE POLICY "Only admins can update seats"
ON companies FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

---

## Audit & Compliance

### Tracking Limit Changes

Create an audit log table:

```sql
CREATE TABLE company_limit_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  old_limit INTEGER,
  new_limit INTEGER,
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track changes with trigger
CREATE OR REPLACE FUNCTION log_limit_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.employee_seats IS DISTINCT FROM NEW.employee_seats THEN
    INSERT INTO company_limit_changes (
      company_id,
      old_limit,
      new_limit,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.employee_seats,
      NEW.employee_seats,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_company_limit_changes
AFTER UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION log_limit_changes();
```

---

## Best Practices

### 1. **Document All Changes**
```sql
-- Always include reason
UPDATE companies 
SET employee_seats = 100,
    notes = 'Upgraded to Professional plan - Sales ticket #12345'
WHERE id = 'company-uuid';
```

### 2. **Verify Before Changing**
```sql
-- Check current status first
SELECT 
  name,
  employee_seats,
  (SELECT COUNT(*) FROM company_employees WHERE company_id = companies.id) as active,
  (SELECT COUNT(*) FROM invites WHERE company_id = companies.id AND status = 'pending') as pending
FROM companies 
WHERE id = 'company-uuid';

-- Then update
UPDATE companies SET employee_seats = 100 WHERE id = 'company-uuid';
```

### 3. **Communicate with Customer**
- Email them about the change
- Explain new limits
- Provide upgrade/downgrade guidance
- Include billing changes if applicable

### 4. **Set Reasonable Defaults**
```sql
-- All new companies get 50 seats by default
ALTER TABLE companies 
ALTER COLUMN employee_seats SET DEFAULT 50;
```

---

## Quick Reference Commands

```sql
-- View all companies with their limits
SELECT 
  id,
  name,
  employee_seats as "Limit",
  plan_type as "Plan",
  (SELECT COUNT(*) FROM company_employees WHERE company_id = companies.id) as "Used"
FROM companies
ORDER BY name;

-- Set limit for one company
UPDATE companies 
SET employee_seats = 100 
WHERE name = 'Company XYZ';

-- Upgrade multiple companies
UPDATE companies 
SET employee_seats = employee_seats * 2
WHERE plan_type = 'business' 
  AND is_active = true;

-- Verify the change
SELECT * FROM get_company_seat_stats('company-uuid');
```

---

## Related Documentation

- 📖 `COMPANY_SUBSCRIPTION_PACKAGES_GUIDE.md` - Full system overview
- 🛠️ `CONFIGURE_COMPANY_PACKAGES.sql` - SQL helper queries
- 📋 `SUBSCRIPTION_BASED_ACCESS_COMPLETE.md` - Implementation details
- 🎨 `SUBSCRIPTION_BANNER_ALL_PAGES_COMPLETE.md` - UI components

---

## Summary

**Current State:** Platform admins manually set limits via Supabase Dashboard or SQL

**Recommended:** Build an admin UI for easier management

**Future:** Automate with payment system integration

**Access:** Only admins should be able to modify limits

**Audit:** Track all changes for compliance and support



