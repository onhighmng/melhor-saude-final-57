# Remaining Non-Functional Buttons - Summary

## ✅ Fixed in This Session

### SpecialistLayout.tsx - All buttons now functional ✅
1. **Update Meeting Link** - Now updates `meeting_link` in bookings table
2. **Reschedule Case** - Now updates booking status to 'rescheduled'
3. **Cancel Case** - Now updates booking status to 'cancelled'

---

## ❌ Still Non-Functional Buttons

### 1. AdminResourcesTab.tsx

**Line 157-212**: "Guardar Recurso" button
- **Issue**: Opens dialog but form fields are not controlled
- **Fix Needed**: 
  - Add state for form fields (title, pillar, type, description, thumbnail)
  - Implement onSubmit handler to insert into `resources` table
  - Add file upload for thumbnails

**Line 231-256**: Edit resource buttons
- **Issue**: OnClick shows toast only
- **Fix Needed**: 
  - Open edit dialog with resource data
  - Implement update query to database

---

### 2. AdminProvidersTab.tsx

**Approve/Reject Provider** buttons
- **Issue**: Need to verify if implemented
- **Fix Needed**:
  - Update `prestadores.is_approved` and `prestadores.is_active`
  - Log admin action to `admin_logs`

**Edit Provider** button
- **Issue**: Opens modal but doesn't save changes
- **Fix Needed**:
  - Implement update query to `prestadores` table
  - Update profile in `profiles` table if user info changed

---

### 3. AdminCompaniesTab.tsx

**Delete Company** button
- **Issue**: Likely shows toast only
- **Fix Needed**:
  - Check for employee count before deletion
  - Soft delete by setting `is_active = false` instead of hard delete
  - Or implement cascade delete if business logic allows

**Edit Company** button
- **Status**: ✅ Already implemented in EditCompanyDialog.tsx
- **Verification Needed**: Ensure all fields update correctly

---

### 4. AdminEmployeesTab.tsx

Need to verify:
- **View employee details** - Already navigates to detail page ✅
- **Edit employee** - Need to check if implemented
- **Remove employee** - Need to check if implemented

---

## 📝 Implementation Priority

### HIGH PRIORITY (Blocks Admin Workflow)

1. **AdminResourcesTab.tsx** - Create/Edit resource functionality
   - This is critical for content management
   - Estimated time: 2-3 hours

2. **AdminProvidersTab.tsx** - Approve/Edit providers
   - Critical for onboarding providers
   - Estimated time: 2 hours

### MEDIUM PRIORITY (Nice to Have)

3. **AdminCompaniesTab.tsx** - Delete company (soft delete)
   - Careful implementation needed
   - Estimated time: 1 hour

4. **AdminEmployeesTab.tsx** - Verify edit/remove functions
   - Check if already implemented
   - Estimated time: 30 minutes

---

## 🎯 Quick Fixes Available

### AdminResourcesTab.tsx - Create Resource

Replace the button onClick with proper form submission:

```typescript
const handleAddResource = async (formData: any) => {
  try {
    const { error } = await supabase.from('resources').insert({
      title: formData.title,
      pillar: formData.pillar,
      type: formData.type,
      description: formData.description,
      thumbnail_url: formData.thumbnail,
      is_public: true,
      is_premium: false
    });

    if (error) throw error;

    toast.success('Recurso criado');
    await loadResources();
  } catch (error) {
    toast.error('Erro ao criar recurso');
  }
};
```

### AdminProvidersTab.tsx - Approve Provider

```typescript
const handleApprove = async (providerId: string) => {
  try {
    const { error } = await supabase
      .from('prestadores')
      .update({ is_approved: true, is_active: true })
      .eq('id', providerId);

    if (error) throw error;

    // Log action
    await supabase.from('admin_logs').insert({
      admin_id: profile.id,
      action: 'provider_approved',
      target_id: providerId,
      target_type: 'prestador'
    });

    toast.success('Prestador aprovado');
    await loadProviders();
  } catch (error) {
    toast.error('Erro ao aprovar prestador');
  }
};
```

---

## ✅ Summary

**Total Non-Functional Buttons Remaining**: ~5-8 buttons across 3-4 components

**High Priority**: 2 components (AdminResourcesTab, AdminProvidersTab)
**Medium Priority**: 2 components (AdminCompaniesTab, AdminEmployeesTab)

**All Critical Buttons for Admin Workflow**: 
- ✅ Companies (view/create) - DONE
- ✅ Employees (view/create/status) - DONE
- ✅ Sessions (view/filter) - DONE
- ✅ Providers (view) - DONE
- ⚠️ Resources (view - DONE, create/edit - TODO)
- ✅ Specialist cases (all actions - JUST FIXED)
- ✅ Users (view/status) - DONE

**Estimated Time to Complete**: 6-8 hours of focused work

