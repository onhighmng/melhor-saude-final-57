# 📦 Company Subscription Packages - Complete Guide

## Overview

The platform supports **subscription-based access control** for companies. Each company has a subscription package that limits the number of employee accounts (seats) they can create.

## How It Works

### 1. **Database Structure**

Companies have the following key columns in the `companies` table:

| Column | Description | Default |
|--------|-------------|---------|
| `employee_seats` | Maximum number of employee accounts allowed by subscription | 50 |
| `sessions_allocated` | Total therapy sessions allocated to the company (pool) | 0 |
| `sessions_used` | Total therapy sessions consumed by employees | 0 |

### 2. **Seat Calculation Logic**

The `get_company_seat_stats(company_id)` RPC function calculates:

```sql
Available Seats = employee_seats - (active_employees + pending_invites)
```

- **Active Employees**: Users who have redeemed invite codes and have accounts
- **Pending Invites**: Generated access codes that haven't been used yet
- **Available Seats**: How many more codes can be generated

### 3. **Access Code Generation**

HR users can generate access codes on the `/company/colaboradores` page:

✅ **Allowed**: When `available_seats > 0`  
❌ **Blocked**: When `available_seats <= 0`

The system prevents generating more codes than the package allows.

## Setting Up Company Packages

### Option 1: Via Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Open the `companies` table
3. Find the company row
4. Update the `employee_seats` column with the desired limit
5. Example values:
   - **Starter Package**: 10 seats
   - **Business Package**: 50 seats
   - **Enterprise Package**: 200 seats
   - **Custom**: Any number

### Option 2: Via SQL

```sql
-- Set a specific company to have 100 employee seats
UPDATE companies 
SET employee_seats = 100 
WHERE id = 'company-uuid-here';

-- Set all new companies to have 25 seats by default
ALTER TABLE companies 
ALTER COLUMN employee_seats SET DEFAULT 25;
```

### Option 3: Via Admin Interface (Future)

Create an admin page where super admins can:
- View all companies and their subscription tiers
- Update package limits
- See usage statistics
- Handle upgrade requests

## User Flow

### For HR Users (Company Admins)

1. **Login** → Navigate to `/company/colaboradores`
2. **View subscription info**: See total seats, active, pending, available
3. **Generate codes**: Click "Gerar Código" button (if seats available)
4. **Distribute codes**: Copy/download codes and share with employees
5. **Monitor usage**: Track how many seats are being used

**Visual Indicators**:
- 🟢 Green: Plenty of seats available (>5)
- 🟡 Yellow: Running low (1-5 seats remaining)
- 🔴 Red: Limit reached (0 seats available)

### For Employees

1. Receive access code from HR (e.g., `MS-ABC123`)
2. Register on the platform at `/signup`
3. Enter the access code during registration
4. Automatically linked to the company
5. Access granted to company benefits

## Package Tiers Recommendation

### Starter (10 seats)
- Small businesses
- Testing the platform
- 7.000 MZN/month

### Business (50 seats)
- Medium-sized companies
- Growing teams
- 27.000 MZN/month

### Professional (100 seats)
- Larger organizations
- Multiple departments
- 47.000 MZN/month

### Enterprise (Unlimited*)
- Large corporations
- Custom requirements
- Custom pricing

*Set `employee_seats` to a very high number (e.g., 10,000)

## Upgrade Process

When a company reaches their limit:

1. **Notification**: Red alert shown on colaboradores page
2. **HR contacts sales/support**: Request upgrade
3. **Admin updates package**: Update `employee_seats` in database
4. **HR continues**: Can now generate more codes

## Technical Implementation

### Frontend (`src/pages/CompanyCollaborators.tsx`)

```typescript
// Load seat statistics
const { data: seatData } = await supabase
  .rpc('get_company_seat_stats', { p_company_id: profile.company_id })
  .single();

// Check before generating
if (seatStats.available_seats <= 0) {
  toast({
    title: "Limite atingido",
    description: "Faça upgrade do seu plano",
    variant: "destructive"
  });
  return;
}
```

### Backend RPC Function

```sql
CREATE OR REPLACE FUNCTION get_company_seat_stats(p_company_id UUID)
RETURNS TABLE (
  employee_seats INTEGER,
  active_employees INTEGER,
  pending_invites INTEGER,
  total_used_seats INTEGER,
  available_seats INTEGER,
  sessions_allocated INTEGER,
  sessions_used INTEGER,
  sessions_available INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      c.employee_seats as total_seats,
      COUNT(DISTINCT ce.user_id) as active_emps,
      COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'pending') as pending_invs
    FROM companies c
    LEFT JOIN company_employees ce ON ce.company_id = c.id
    LEFT JOIN invites i ON i.company_id = c.id AND i.role = 'user'
    WHERE c.id = p_company_id
    GROUP BY c.employee_seats
  )
  SELECT 
    total_seats,
    active_emps,
    pending_invs,
    (active_emps + pending_invs) as total_used,
    (total_seats - (active_emps + pending_invs)) as available
  FROM stats;
END;
$$;
```

## API Endpoints

### Check if company can generate codes

```typescript
const { data: canGenerate } = await supabase
  .rpc('can_generate_invite_code', { p_company_id: companyId });

if (canGenerate) {
  // Allow code generation
}
```

### Get detailed statistics

```typescript
const stats = await supabase
  .rpc('get_company_seat_stats', { p_company_id: companyId })
  .single();

console.log(`${stats.available_seats} seats available`);
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Seat Utilization Rate**: `(active_employees / employee_seats) * 100`
2. **Code Redemption Rate**: `(active_employees / pending_invites) * 100`
3. **Companies at Limit**: Companies where `available_seats = 0`
4. **Upgrade Opportunities**: Companies using >80% of seats

### SQL Queries for Admin Dashboard

```sql
-- Companies approaching their limit (>80% utilization)
SELECT 
  c.name,
  c.employee_seats,
  (SELECT COUNT(*) FROM company_employees WHERE company_id = c.id) as active,
  (SELECT COUNT(*) FROM invites WHERE company_id = c.id AND status = 'pending') as pending
FROM companies c
WHERE is_active = true
HAVING ((active + pending)::float / employee_seats) > 0.8;

-- Companies that have reached their limit
SELECT 
  c.name,
  c.employee_seats,
  (SELECT COUNT(*) FROM company_employees WHERE company_id = c.id) as active,
  (SELECT COUNT(*) FROM invites WHERE company_id = c.id AND status = 'pending') as pending
FROM companies c
WHERE is_active = true
HAVING (active + pending) >= employee_seats;
```

## Troubleshooting

### Issue: Company can't generate codes even with available seats

**Check:**
```sql
SELECT * FROM get_company_seat_stats('company-id-here');
```

**Possible causes:**
- Pending invites not cleaned up (expired codes still marked as 'pending')
- Inactive employees still counted
- Database sync issues

**Fix:**
```sql
-- Clean up expired invites
UPDATE invites 
SET status = 'expired' 
WHERE status = 'pending' 
AND expires_at < NOW();
```

### Issue: Seat count doesn't match reality

**Recalculate:**
```sql
-- Manual verification
SELECT 
  (SELECT COUNT(*) FROM company_employees WHERE company_id = 'xxx') as active_emps,
  (SELECT COUNT(*) FROM invites WHERE company_id = 'xxx' AND status = 'pending') as pending_invs,
  (SELECT employee_seats FROM companies WHERE id = 'xxx') as total_seats;
```

## Best Practices

1. ✅ **Set realistic limits**: Based on actual company size
2. ✅ **Monitor regularly**: Check companies approaching limits
3. ✅ **Clean up expired codes**: Run periodic cleanup jobs
4. ✅ **Communicate clearly**: Notify HR when approaching limit
5. ✅ **Flexible upgrades**: Make it easy to increase seats
6. ✅ **Grace period**: Allow 1-2 codes over limit with warning

## Future Enhancements

- [ ] Automated email alerts when company reaches 80% capacity
- [ ] Self-service upgrade flow in the company dashboard
- [ ] Integration with Stripe for automatic billing
- [ ] Temporary seat increases for seasonal needs
- [ ] Seat pooling across subsidiary companies
- [ ] Usage analytics and recommendations
- [ ] Audit log for seat changes

---

## Quick Reference

| Action | Command |
|--------|---------|
| Set company seats | `UPDATE companies SET employee_seats = 100 WHERE id = 'xxx'` |
| Check availability | `SELECT * FROM get_company_seat_stats('company-id')` |
| Clean expired codes | `UPDATE invites SET status = 'expired' WHERE expires_at < NOW()` |
| View all packages | `SELECT name, employee_seats, is_active FROM companies` |

---

**Last Updated**: November 2, 2025  
**Migration File**: `20251102_add_employee_seats_to_companies.sql`  
**Status**: ✅ Fully Implemented



