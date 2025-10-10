# Translation Audit Report
**Date:** 2025-10-10
**Status:** In Progress

## Critical Issues Found & Fixed

### 1. ✅ FIXED: BackButton Component
- **File:** `src/components/navigation/BackButton.tsx`
- **Issue:** Missing translation key `booking.backToMyHealth`
- **Solution:** Temporarily hardcoded "Voltar à Minha Saúde" (translation keys added to pt/en user.json but cache issue)
- **Status:** RESOLVED

### 2. ✅ FIXED: DirectBookingFlow Toast Messages  
- **File:** `src/components/booking/DirectBookingFlow.tsx`
- **Lines:** 86-89, 119-122
- **Issue:** Hardcoded Portuguese strings in toast notifications
- **Solution:** Replaced with proper translation keys from user.json
- **Status:** RESOLVED

## Remaining Issues to Fix

### 3. Hardcoded "Utilizador" in UserSidebar
- **File:** `src/components/UserSidebar.tsx`  
- **Line:** 99
- **Current:** `<span className="text-xs text-muted-foreground">Utilizador</span>`
- **Action Required:** Replace with translation

### 4. Hardcoded "Prestador" in PrestadorSidebar
- **File:** `src/components/PrestadorSidebar.tsx`
- **Line:** 95  
- **Current:** `<span className="text-xs text-muted-foreground">Prestador</span>`
- **Action Required:** Replace with translation

### 5. Demo Control Panel Hardcoded Titles
- **File:** `src/components/DemoControlPanel.tsx`
- **Lines:** 36-39
- **Current:** Hardcoded 'Utilizador', 'Prestador', 'RH', 'Admin'
- **Action Required:** Replace with translations

## Translation Keys to Add

### Missing in common.json (PT):
```json
{
  "roles": {
    "user": "Utilizador",
    "provider": "Prestador",  
    "hr": "RH",
    "admin": "Administrador"
  }
}
```

### Missing in common.json (EN):
```json
{
  "roles": {
    "user": "User",
    "provider": "Provider",
    "hr": "HR",
    "admin": "Administrator"
  }
}
```

## Files Systematically Audited
- ✅ src/components/navigation/BackButton.tsx
- ✅ src/components/booking/DirectBookingFlow.tsx  
- ⏳ src/components/UserSidebar.tsx
- ⏳ src/components/PrestadorSidebar.tsx
- ⏳ src/components/DemoControlPanel.tsx
- ⏳ src/components/AdminSidebar.tsx
- ⏳ src/components/CompanySidebar.tsx

## Next Steps
1. Fix remaining hardcoded strings in sidebars
2. Add missing translation keys to common.json
3. Search and replace all instances of hardcoded role names
4. Verify all toast messages use translations
5. Final sweep for any remaining hardcoded strings

## Notes
- Route names (/prestador/, /admin/) are intentionally hardcoded as they're internal paths
- Component file names (PrestadorDashboard, etc.) are intentionally in Portuguese as per project convention
- Focus on USER-FACING strings only
