# Complete Backend Issues Report - What's Not Functional

## 🚨 CRITICAL: Completely Broken (No Backend at All)

### 1. **RegisterEmployee.tsx** (Lines 115-154)
**Issue**: Simulates account creation with `setTimeout`, updates mock data only
```typescript
// ❌ WRONG - Just simulation
await new Promise(resolve => setTimeout(resolve, 2000));

// Updates mockInviteCodes array in memory
mockInviteCodes[codeIndex] = { ...newData };
```
**Should be**: Create real user in Supabase auth + profiles table
**Impact**: Employee registration completely broken

### 2. **RegisterCompany.tsx** (Line 90)
**Issue**: Mock API call with setTimeout
```typescript
// ❌ WRONG - Just simulation
await new Promise(resolve => setTimeout(resolve, 2000));
```
**Should be**: Create company in Supabase + create HR user
**Impact**: Company registration completely broken

### 3. **SessionRatingDialog.tsx** (Lines 46-54)
**Issue**: Only console.log, no database save
```typescript
// ❌ WRONG - Just logs
await new Promise(resolve => setTimeout(resolve, 500));
console.log('Session rating submitted:', { sessionId, rating, comments });
```
**Should be**: Update bookings table with rating/feedback
**Impact**: User ratings not saved

### 4. **SupportAssistant.tsx** (Line 24)
**Issue**: Fake bot replies with setTimeout
```typescript
// ❌ WRONG - Just simulation
await new Promise(resolve => setTimeout(resolve, 1000));
// Returns hardcoded replies
```
**Should be**: Real AI or database lookup
**Impact**: Support chat completely fake

### 5. **AdminCompanyInvites.tsx** (Lines 62-90)
**Issue**: Generates codes and updates mock array only
```typescript
// ❌ WRONG - Updates mock data
setTimeout(() => {
  newCodes.push(newCode);
  mockInviteCodes.push(newCode);
  setInviteCodes(prev => [...prev, ...newCodes]);
}, 1000);
```
**Should be**: Insert codes into invites table in Supabase
**Impact**: Invite codes not persistent, lost on refresh

### 6. **DirectBookingFlow.tsx** (Line 168)
**Issue**: Fake booking creation
```typescript
// ❌ WRONG - Just simulation
await new Promise(resolve => setTimeout(resolve, 1500));
```
**Should be**: Insert into bookings table
**Impact**: Direct bookings not saved

### 7. **EditCompanyDialog.tsx** (Line 51)
**Issue**: Simulated API call
```typescript
// ❌ WRONG - Just simulation
await new Promise(resolve => setTimeout(resolve, 800));
```
**Should be**: Update companies table
**Impact**: Company edits not saved

### 8. **AdminProviderNew.tsx** (Line 177)
**Issue**: Fake provider creation
```typescript
// ❌ WRONG - Just simulation
await new Promise(resolve => setTimeout(resolve, 2000));
```
**Should be**: Insert into prestadores table
**Impact**: Provider registration broken

## ⚠️ INCOMPLETE: Partially Implemented

### 9. **useCompanyResourceAnalytics.ts** (Lines 27-30)
**Status**: Has TODO comment, returns mock data
```typescript
// TODO: Replace with real Supabase query when ready
await new Promise(resolve => setTimeout(resolve, 500));
setMetrics(mockResourceMetrics);
```
**Impact**: Resource analytics showing fake data

### 10. **BookingModal.tsx** (Line 56)
**Status**: Has TODO, just console.log
```typescript
// TODO: Implement actual booking logic
console.log('Creating booking:', {...});
```
**Impact**: Admin booking creation broken

### 11. **AddProviderModal.tsx** (Line 55)
**Status**: Has TODO, just console.log
```typescript
// TODO: Implement actual provider creation logic here
console.log('Creating provider:', formData);
```
**Impact**: Provider addition broken

## 📋 TODO Comments Found Across Codebase

Total TODO comments indicating missing backend: **14 instances**

Files with TODO backend issues:
1. `src/hooks/useCompanyResourceAnalytics.ts` - Line 15
2. `src/components/admin/providers/BookingModal.tsx` - Line 56
3. `src/components/admin/providers/AddProviderModal.tsx` - Line 55
4. Multiple pages using mock data

## 🔍 Mock Data Usage Still Active

### Mock Data Files Still Imported
- `@/data/mockData.ts` - Used in 15+ files
- `@/data/adminMockData.ts` - Used in 5+ files  
- `@/data/companyMockData.ts` - Used in 10+ files
- `@/data/especialistaGeralMockData.ts` - Used in 3+ files
- `@/data/prestadorMetrics.ts` - Used in 2+ files
- `@/data/companyMetrics.ts` - Used in 4+ files
- `@/data/sessionMockData.ts` - Used in 8+ files
- `@/data/inviteCodesMockData.ts` - Used in 5+ files

### Components Using Mock Data
**Admin Pages (15 files)**
- AdminUsers.tsx
- AdminProviders.tsx
- AdminSettings.tsx
- AdminCompanyDetail.tsx
- AdminCompanyInvites.tsx
- AdminProviderNew.tsx
- AdminLogs.tsx
- All admin tab components

**Company/HR Pages (8 files)**
- CompanyDashboard.tsx
- CompanyReportsImpact.tsx
- CompanyCollaborators.tsx
- CompanyResources.tsx
- CompanySessions.tsx

**Prestador Pages (5 files)**
- PrestadorDashboard.tsx
- PrestadorSessions.tsx
- PrestadorPerformance.tsx
- PrestadorCalendar.tsx
- PrestadorSessionDetail.tsx

**Specialist Pages (3 files)**
- SpecialistDashboard.tsx
- EspecialistaCallRequests.tsx
- EspecialistaUserHistory.tsx

**User Pages (4 files)**
- UserResources.tsx
- UserSessions.tsx (JUST migrated)
- UserDashboard.tsx (partial)

**Public Pages (2 files)**
- Demo.tsx
- RegisterEmployee.tsx
- RegisterCompany.tsx

## 📊 Summary

### By Category

| Category | Total | Broken | Working |
|----------|-------|--------|---------|
| User Registration | 3 | 2 | 1 |
| Company Registration | 1 | 1 | 0 |
| Session Management | 5 | 2 | 3 |
| Resource Management | 3 | 1 | 2 |
| Provider Management | 8 | 3 | 5 |
| Admin Operations | 15 | 5 | 10 |
| Booking Flow | 4 | 2 | 2 |
| Support/Chat | 2 | 2 | 0 |

### By Severity

**🔴 CRITICAL (No Backend at All)**
- RegisterEmployee.tsx
- RegisterCompany.tsx
- SessionRatingDialog.tsx
- AdminCompanyInvites.tsx
- DirectBookingFlow.tsx
- EditCompanyDialog.tsx
- AdminProviderNew.tsx
- SupportAssistant.tsx

**🟠 HIGH (Partially Broken)**
- useCompanyResourceAnalytics.ts
- BookingModal.tsx
- AddProviderModal.tsx

**🟡 MEDIUM (Needs Migration)**
- All pages still using mock data (60+ files)

## 🎯 What Needs Immediate Fix

1. **RegisterEmployee.tsx** - Employees can't register
2. **RegisterCompany.tsx** - Companies can't register
3. **AdminCompanyInvites.tsx** - Invite codes don't persist
4. **SessionRatingDialog.tsx** - Ratings not saved
5. **DirectBookingFlow.tsx** - Direct bookings not working
6. **All admin/providers components** - Provider management broken
7. **Support chat** - Completely fake

## 💡 Recommendation

**Focus on these 8 critical issues first**, then migrate remaining mock data components systematically.

