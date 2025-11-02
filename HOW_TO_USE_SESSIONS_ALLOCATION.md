# How to Use Sessions Allocation Feature

## For Admins: Generating HR Codes with Custom Session Allocation

### Step-by-Step Guide

#### 1. Navigate to User Management
- Log in as an admin user
- Go to the **Admin Dashboard**
- Click on **Users Management** section

#### 2. Generate HR Access Code
- Look for the "Códigos de Acesso" (Access Codes) section
- Click the **HR** button to open the HR code generation modal

#### 3. Configure the Code
The modal will appear with two fields:

**Field 1: Selecionar Empresa (Select Company)**
- Choose the company from the dropdown list
- Only active companies are shown
- If the company doesn't exist yet, it will be created during registration

**Field 2: Número de Sessões Alocadas (Number of Sessions Allocated)** ⭐ NEW
- Enter the number of sessions you want to allocate to this company
- Default value: **5 sessions**
- Minimum value: **1 session**
- Examples:
  - Small company: 10-20 sessions
  - Medium company: 50-100 sessions
  - Large company: 200+ sessions

#### 4. Generate the Code
- Click **"Gerar Código"** button
- A success message will appear showing:
  - The generated access code (e.g., "MS-ABCD")
  - The number of sessions allocated (e.g., "com 50 sessões alocadas")
- The code is valid for 30 days

#### 5. Share the Code
- Copy the access code from the success message
- Send it to the company's HR representative
- Inform them about the number of sessions they have

### Viewing Generated Codes

After generating codes, you'll see them in the table with these columns:
- **Código**: The access code
- **Tipo**: User type (HR, Prestador, etc.)
- **Email**: User email (after activation)
- **Sessões**: 🆕 Number of sessions allocated (shown in blue)
- **Criado**: Creation date
- **Ativado**: Activation date
- **Estado**: Status (Pending, Ativado, Revogado)
- **Ações**: Action buttons

### Example Scenarios

#### Scenario 1: New Small Company
```
Company: "ABC Consulting"
Employees: ~10 people
Monthly sessions needed: ~15

Action:
1. Click HR button
2. Select "ABC Consulting"
3. Enter: 20 sessions (buffer for growth)
4. Generate code
5. Share code: "MS-XYZ1" with ABC Consulting HR
```

#### Scenario 2: Large Enterprise
```
Company: "TechCorp International"
Employees: ~500 people
Monthly sessions needed: ~200

Action:
1. Click HR button
2. Select "TechCorp International"
3. Enter: 250 sessions (5% buffer)
4. Generate code
5. Share code: "MS-ABC2" with TechCorp HR
```

#### Scenario 3: Trial/Pilot Program
```
Company: "Startup XYZ"
Purpose: Testing platform for 3 months
Sessions needed: Limited

Action:
1. Click HR button
2. Select "Startup XYZ"
3. Enter: 5 sessions (minimal for trial)
4. Generate code
5. Share code with note: "Trial period - 5 sessions"
```

## For HR Users: What Happens When You Register

### Registration Process
1. Receive access code from admin
2. Visit the registration page
3. Enter the access code
4. Complete registration form
5. System automatically:
   - Creates your company profile
   - Allocates the sessions specified by admin
   - Creates your HR account
   - Links you to the company

### Checking Your Allocation
After registration, you can:
1. Log in to your account
2. Go to **Company Dashboard**
3. View your session allocation:
   - Total Sessions: [Number specified by admin]
   - Used Sessions: 0 (initially)
   - Remaining Sessions: [Total - Used]

### Managing Sessions
As an HR user, you can:
- View total allocated sessions
- See how many have been used
- Track which employees used sessions
- Request more sessions from admin if needed

## For Developers: Technical Details

### API Response Format
When `validate_access_code()` is called:
```json
{
  "id": "uuid",
  "user_type": "hr",
  "role": "hr",
  "company_id": "uuid",
  "company_name": "Company Name",
  "expires_at": "2025-12-01T00:00:00Z",
  "status": "pending",
  "metadata": {},
  "sessions_allocated": 50
}
```

### Database Updates
When HR user registers:
```sql
-- companies table
sessions_allocated = [from invite]  -- e.g., 50
sessions_used = 0

-- company_employees table (for HR user)
sessions_quota = [from invite]  -- e.g., 50
sessions_used = 0
```

### Default Values
- **UI Default**: 5 sessions (most common for small companies)
- **Database Default**: 5 sessions (invites table)
- **Fallback**: 100 sessions (if invite doesn't specify)

## Troubleshooting

### Issue: Sessions not showing in table
**Solution**: Refresh the page or click the search box to reload codes

### Issue: Can't enter sessions value
**Solution**: Make sure you've selected a company first

### Issue: Validation error "mínimo 1"
**Solution**: Enter at least 1 session (cannot be 0 or negative)

### Issue: Company has wrong session count
**Solution**: Check the invite record in database - sessions are set during registration and cannot be changed automatically. Admin needs to manually update the company record.

## Best Practices

### Session Allocation Guidelines

**Small Companies (1-50 employees)**
- Recommended: 10-30 sessions
- Consider: 1-2 sessions per active employee

**Medium Companies (51-200 employees)**
- Recommended: 50-150 sessions
- Consider: 20-30% of workforce might use sessions

**Large Companies (201+ employees)**
- Recommended: 150+ sessions
- Consider: Fixed percentage (e.g., 25%) of total employees

### Monitoring Usage
- Review session usage monthly
- Adjust allocations based on actual usage
- Consider seasonal variations (end of year stress, etc.)
- Plan for buffer (10-20% extra)

### Communication
- Always inform HR representative about allocation
- Explain session limits during onboarding
- Provide clear contact for requesting more sessions
- Set expectations about usage policies

## FAQ

**Q: Can I change sessions after generating the code?**
A: No, but you can generate a new code with different allocation.

**Q: What if the company needs more sessions later?**
A: Admin can manually update the company's sessions_allocated in the database or through the company management interface.

**Q: Do sessions expire?**
A: Sessions don't expire, but the access code expires after 30 days.

**Q: Can I see who used which sessions?**
A: Yes, through the company employees view showing sessions_used per employee.

**Q: What happens if I enter 0 sessions?**
A: System prevents this - minimum is 1 session.

**Q: Is there a maximum session limit?**
A: No hard limit in the system, but consider practical resource allocation.

## Support

For issues or questions:
1. Check this guide first
2. Review the technical documentation (FEATURE_SESSIONS_ALLOCATION.md)
3. Contact system administrator
4. Check database directly if you have access

