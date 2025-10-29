# Backend Migration Completion - Specification

## Overview
Complete migration of all components from mock data to real Supabase backend, ensuring production-ready functionality across all user flows.

## Database Schema Reference
- **profiles**: User profiles with role, company_id, metadata
- **companies**: Company information with session allocation
- **company_employees**: Employee-company links with session quotas (sessions_allocated, sessions_used)
- **prestadores**: Provider details with user_id → profiles
- **bookings**: Session bookings with full details
- **session_notes**: Provider notes for sessions
- **feedback**: User feedback and ratings
- **onboarding_data**: User onboarding responses
- **admin_logs**: Admin action logging

## Key Relationships
```
profiles.company_id → companies.id
company_employees.company_id → companies.id
company_employees.user_id → profiles.id (auth.users)
prestadores.user_id → profiles.id
bookings.prestador_id → prestadores.id
bookings.user_id → profiles.id
bookings.company_id → companies.id
session_notes.prestador_id → prestadores.id
session_notes.booking_id → bookings.id
```

## Verification Requirements
1. All database operations must include error handling
2. All mutations must update admin_logs (for admin actions)
3. All queries must respect RLS policies
4. All booking operations must update session quotas
5. All provider details must join through profiles table

## Phase Priorities
1. **Phase 1**: Critical bug fixes (useBookings, useSessionBalance)
2. **Phase 2**: User flow (onboarding, booking, settings, feedback)
3. **Phase 3**: Admin flow (company/provider management)
4. **Phase 4**: Provider flow (availability, session notes, metrics)
5. **Phase 5**: Specialist flow (call requests, session management)
6. **Phase 6**: Admin analytics & reporting
7. **Phase 7**: Cleanup (delete mock data files)

