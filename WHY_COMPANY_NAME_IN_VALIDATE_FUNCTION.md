# Why `company_name` Appears in `validate_access_code`

## Your Question:
> "Why is there a company field when I'm just trying to create a prestador or specialist? I don't get it."

## The Answer:

The `validate_access_code` function is **ONE FUNCTION FOR ALL CODE TYPES**. It handles:

1. ✅ **HR codes** (company_id = some UUID)
2. ✅ **Employee codes** (company_id = some UUID)
3. ✅ **Prestador codes** (company_id = NULL)
4. ✅ **Specialist codes** (company_id = NULL)

## What Happens for Each Type:

### For HR/Employee Codes:
```sql
-- Invite in database:
company_id = 'abc-123-...'

-- Function runs:
LEFT JOIN companies c ON i.company_id = c.id
-- ✅ JOIN succeeds

-- Returns:
company_name = 'Acme Corp'
```

### For Prestador/Specialist Codes:
```sql
-- Invite in database:
company_id = NULL

-- Function runs:
LEFT JOIN companies c ON i.company_id = c.id
-- ❌ JOIN finds nothing (because company_id is NULL)

-- Returns:
company_name = NULL
```

## Why Use LEFT JOIN Instead of Different Functions?

**Option 1 (Current):** One function with LEFT JOIN
```sql
CREATE FUNCTION validate_access_code(code TEXT)
-- Works for ALL code types
-- Returns company_name when it exists
-- Returns NULL when it doesn't
```

**Option 2 (Alternative):** Multiple functions
```sql
CREATE FUNCTION validate_hr_code(code TEXT)
CREATE FUNCTION validate_employee_code(code TEXT)  
CREATE FUNCTION validate_prestador_code(code TEXT)
CREATE FUNCTION validate_specialist_code(code TEXT)
```

The first option is simpler and avoids code duplication.

## What the Frontend Does:

```typescript
const { data } = await validate_access_code(code);

if (data.company_name) {
  // This is an HR or Employee code
  showCompanyInfo(data.company_name);
} else {
  // This is a Prestador or Specialist code
  // Ignore company_name (it's NULL anyway)
}
```

## The Fix I Just Applied:

### ✅ What Changed:

1. **`generate_access_code` function now FORCES `company_id = NULL`** for specialists and prestadores
   - Even if someone tries to pass a company_id, it gets ignored
   - Specialists are ALWAYS platform-wide

2. **Database trigger doesn't create `specialist_assignments`**
   - Removed the code that was trying to link specialists to companies
   - Specialists serve ALL companies by default

3. **Cleared any existing bad data**
   - Updated pending specialist invites to have `company_id = NULL`
   - Removed any auto-created specialist_assignments

## Final Architecture:

```
┌──────────────────────────────────────────────────────┐
│                  validate_access_code                │
│                   (ONE FUNCTION)                     │
│                                                      │
│  Handles: HR, Employee, Prestador, Specialist       │
│                                                      │
│  Returns:                                           │
│  - company_name = 'Corp Name' (for HR/Employee)    │
│  - company_name = NULL (for Prestador/Specialist)  │
└──────────────────────────────────────────────────────┘
                           │
                           ↓
              ┌────────────────────────┐
              │   Frontend Ignores     │
              │   NULL company_name    │
              └────────────────────────┘
```

## Bottom Line:

- `company_name` is in the function for **HR and Employee codes**
- For **Prestador and Specialist codes**, it just returns NULL
- The NULL value is harmless and gets ignored
- **Specialists and Prestadores are PLATFORM-WIDE (no company assignment)**

This is now fixed and working correctly! ✅





