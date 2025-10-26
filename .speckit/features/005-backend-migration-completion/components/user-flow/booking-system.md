# Booking System - Component Migration

## Overview
Migrated booking flow to use real Supabase backend with proper session quota management.

## Database Operations
- **Reads**: 
  - company_employees (get company_id, check sessions_used)
  - companies (increment sessions_used)
- **Writes**: 
  - bookings (insert new booking)
  - company_employees (increment sessions_used)
  - companies (increment sessions_used)

## Schema Dependencies
- bookings.user_id → profiles.id
- bookings.company_id → companies.id
- bookings.prestador_id → prestadores.id
- company_employees.user_id → profiles.id
- company_employees.company_id → companies.id

## Implementation Details

### Component: BookingFlow.tsx
**Lines Modified**: 155-217
**Key Changes**:
1. Added pillar field to booking insert
2. Added topic field from selectedTopics
3. Added meeting_link generation for virtual meetings
4. Added quota management - incrementing both employee and company session counts
5. Proper error handling for database operations

### Session Quota Logic
```typescript
// Get current sessions_used for user and increment
const { data: employeeData } = await supabase
  .from('company_employees')
  .select('sessions_used')
  .eq('user_id', profile.id)
  .single();

if (employeeData) {
  await supabase
    .from('company_employees')
    .update({ sessions_used: employeeData.sessions_used + 1 })
    .eq('user_id', profile.id);
}

// Also increment company's sessions_used
if (companyId) {
  const { data: companyData } = await supabase
    .from('companies')
    .select('sessions_used')
    .eq('id', companyId)
    .single();

  if (companyData) {
    await supabase
      .from('companies')
      .update({ sessions_used: companyData.sessions_used + 1 })
      .eq('id', companyId);
  }
}
```

## Verification Steps
1. User books a session through the flow
2. Check bookings table has new row with all required fields
3. Verify company_employees.sessions_used incremented
4. Verify companies.sessions_used incremented
5. Booking appears in user dashboard with correct provider info

## Known Issues
- Must ensure provider is selected from real prestadores table (currently uses mockProviders)
- Should add validation that user has available sessions before booking

## Migration Date
2025-01-26

