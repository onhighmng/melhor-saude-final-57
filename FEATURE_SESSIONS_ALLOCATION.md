# Feature: Sessions Allocation for Company Registration

## Overview
Implemented functionality allowing admins to specify the number of sessions when generating HR access codes for company registration. This ensures that when a company registers using the access code, they receive the exact number of sessions allocated by the admin.

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/[timestamp]_add_sessions_allocated_to_validate_access_code.sql`

- Updated `validate_access_code()` function to include `sessions_allocated` in the return type
- This allows the frontend to retrieve the sessions allocation when validating access codes
- Added proper grants for authenticated and anonymous users

### 2. Admin UI - Code Generation Modal
**File**: `src/pages/AdminUsersManagement.tsx`

#### State Management
- Added `sessionsAllocated` state variable with default value of 5
- Loads companies dynamically when HR modal opens via `loadCompanies()` function

#### UI Components
- Added "Número de Sessões Alocadas" input field in the HR code generation modal
- Input includes:
  - Number input with minimum value of 1
  - Default value of 5 sessions
  - Helpful description text
  - Resets to 5 when modal closes

#### Function Updates
- `handleGenerateHRCode(selectedCompanyId, sessions)`: Now accepts sessions parameter
  - Validates that sessions is a positive number
  - Includes sessions in the invite insert
  - Shows sessions count in success toast message

#### Table Display
- Updated codes table from 7 to 8 columns
- Added "Sessões" column displaying `sessions_allocated` in blue font
- Shows default of 5 if not specified

### 3. Registration Logic
**File**: `src/utils/registrationHelpers.ts`

#### `createUserFromCode()` Function
- Now retrieves `sessions_allocated` from the validated invite data
- Passes `sessions_allocated` to `createHRUser()` function
- Added console log for debugging invite data

#### `createHRUser()` Function
- Updated signature: `createHRUser(userId, userData, companyId?, sessionsAllocated?)`
- Uses `sessionsAllocated` parameter when creating company:
  - Sets `sessions_allocated` in companies table
  - Defaults to 100 if not provided
- Uses same value for `sessions_quota` in company_employees table
  - Ensures HR user has access to allocated sessions
  - Defaults to 100 if not provided

## How It Works

### Admin Workflow
1. Admin navigates to Users Management
2. Clicks "HR" button to generate company access code
3. Selects a company from dropdown
4. Enters desired number of sessions (e.g., 50)
5. Clicks "Gerar Código"
6. System creates invite with specified sessions_allocated

### Company Registration Workflow
1. HR user receives access code from admin
2. Visits registration page and enters access code
3. System validates code via `validate_access_code()` function
4. Function returns invite data including `sessions_allocated`
5. During registration:
   - If company doesn't exist: Creates company with `sessions_allocated` from invite
   - Creates HR user profile linked to company
   - Creates company_employees record with matching `sessions_quota`

### Result
- Company receives exactly the number of sessions specified by admin
- HR user can see and manage allocated sessions
- All session tracking uses the admin-specified value

## Database Schema

### invites table
- Already had `sessions_allocated` column (type: INTEGER, default: 5)
- Used to store admin's session allocation decision

### companies table
- Already had `sessions_allocated` column (type: INTEGER)
- Updated via registration to use value from invite

### company_employees table
- Already had `sessions_allocated` column (type: INTEGER)
- Updated via registration to match company allocation

## UI/UX Improvements
1. **Visual Feedback**: Sessions column in codes table shows allocation clearly
2. **Validation**: Prevents generation of codes with invalid session counts
3. **Default Values**: Sensible defaults (5) to streamline common cases
4. **Success Messages**: Confirms sessions allocated in toast notification

## Testing Recommendations
1. Generate HR code with custom session count
2. Register new company using that code
3. Verify company has correct `sessions_allocated` in database
4. Verify HR user has matching `sessions_quota` in company_employees
5. Check that sessions display correctly in company dashboard

## Notes
- Sessions default to 5 if not specified by admin
- If `sessions_allocated` is missing from invite, defaults to 100 for backward compatibility
- The feature respects existing database constraints and RLS policies
- All changes maintain compatibility with existing company registrations



