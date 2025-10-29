# Batch Migration Tracker - 7 Components at a Time

## Round 1 (Current): High-Priority Dashboards

### Target Components:
1. ✅ PrestadorDashboard.tsx - IN PROGRESS
2. ⏳ AdminProviders.tsx - Next
3. ⏳ AdminProvidersTab.tsx
4. ⏳ AdminBookingsTab.tsx
5. ⏳ AdminSpecialistTab.tsx
6. ⏳ AdminSessionsTab.tsx
7. ⏳ SpecialistDashboard.tsx

**Status**: 1/7 complete

## What Makes These High Priority

### Why These 7?
1. **Core user flows**: Users interact with these daily
2. **Data criticality**: Display most important business metrics
3. **Heavy mock data usage**: Currently showing 100% fake data
4. **Complex backend needs**: Require multiple table joins

### Expected Impact After Migration
- Dashboard views will show real data
- Statistics will be accurate
- Operations will work with real database
- User experience dramatically improved

## Migration Strategy

For each component:
1. Replace mock data imports
2. Add Supabase queries
3. Calculate metrics from real data
4. Add loading states
5. Add error handling
6. Test with real database

## Progress

- **Total components**: ~75 files
- **Migrated**: 28 files
- **Remaining**: ~47 files
- **Completed rounds**: 0/7 (7 components each)
- **Current batch**: 1/7

## Next Batches

### Round 2 (Company Components):
- CompanyReportsImpact.tsx
- CompanyCollaborators.tsx
- CompanyResources.tsx
- CompanySessions.tsx
- And 3 more

### Round 3 (Remaining Admin Components):
- AdminAlertsTab.tsx
- AdminSupportTicketsTab.tsx
- AdminInternalReportsTab.tsx
- And 4 more

### Round 4-7 (Remaining work):
Continue pattern until all 47 remaining files migrated

