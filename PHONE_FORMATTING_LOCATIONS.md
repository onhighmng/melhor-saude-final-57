# Phone Number Formatting - Complete Implementation Map

## Overview
This document provides a comprehensive map of all locations where phone number formatting has been implemented across the platform.

---

## Format Standard: **+258 ** *** ****

All phone numbers across the platform now use the Mozambique standard format.

---

## Implementation Locations

### **1. Phone Input Fields (9 locations)**

These are editable input fields where users can enter phone numbers:

#### **User-Facing Inputs:**

1. **Profile Edit Modal**
   - **File:** `src/components/settings/ProfileEditModal.tsx`
   - **Component:** `ProfileEditModal`
   - **Field:** User's personal phone number
   - **Line ~147:** `onChange={(e) => setProfileData({ ...profileData, phone: formatPhoneNumber(e.target.value) })}`

2. **Registration Page**
   - **File:** `src/pages/Register.tsx`
   - **Component:** `Register`
   - **Field:** Phone during user registration
   - **Line ~426:** `onChange={(e) => updateFormData('phone', formatPhoneNumber(e.target.value))}`

3. **Support Form**
   - **File:** `src/components/support/SupportForm.tsx`
   - **Component:** `SupportForm`
   - **Field:** Optional contact phone for support tickets
   - **Line ~285:** `onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}`

4. **Specialist Settings**
   - **File:** `src/pages/EspecialistaSettings.tsx`
   - **Component:** `EspecialistaSettings`
   - **Field:** Specialist's contact phone
   - **Line ~331:** `onChange={(e) => setProfileData({...profileData, phone: formatPhoneNumber(e.target.value)})}`

#### **Admin Inputs:**

5. **Add Company Modal**
   - **File:** `src/components/admin/AddCompanyModal.tsx`
   - **Component:** `AddCompanyModal`
   - **Field:** New company phone
   - **Line ~200:** `onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}`

6. **Edit Company Dialog**
   - **File:** `src/components/admin/EditCompanyDialog.tsx`
   - **Component:** `EditCompanyDialog`
   - **Field:** Edit existing company phone
   - **Line ~168:** `onChange={(e) => setFormData({ ...formData, contactPhone: formatPhoneNumber(e.target.value) })}`
   - **Note:** Also formats on load (line ~59)

7. **Company Settings**
   - **File:** `src/pages/CompanySettings.tsx`
   - **Component:** `CompanySettings`
   - **Field:** Company contact phone
   - **Line ~111:** `onChange={(e) => setCompanyData({...companyData, contact_phone: formatPhoneNumber(e.target.value)})}`

8. **Edit User Dialog**
   - **File:** `src/components/admin/EditUserDialog.tsx`
   - **Component:** `EditUserDialog`
   - **Field:** User's phone (admin edit)
   - **Line ~103:** `onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}`

---

### **2. Phone Display Locations (15+ locations across 8 files)**

These are read-only displays where phone numbers are shown:

#### **Specialist/Call Management Views:**

9. **Call Requests Revamped (Specialist)**
   - **File:** `src/pages/EspecialistaCallRequestsRevamped.tsx`
   - **Component:** `EspecialistaCallRequestsRevamped`
   - **Display:** User phone in call request details
   - **Line ~634:** `{formatPhoneNumber(selectedRequest.user_phone || '')}`

10. **Call Requests Legacy (Specialist)**
    - **File:** `src/pages/EspecialistaCallRequests.tsx`
    - **Component:** `EspecialistaCallRequests`
    - **Display:** User phone in multiple locations
    - **Line ~244:** `{formatPhoneNumber(request.user_phone || '')}`
    - **Line ~315:** `{formatPhoneNumber(request.user_phone || '')}`
    - **Line ~351:** `{formatPhoneNumber(selectedRequest.user_phone || '')}`
    - **Line ~384:** `{formatPhoneNumber(selectedRequest?.user_phone || '')}`

11. **Call Modal**
    - **File:** `src/components/specialist/CallModal.tsx`
    - **Component:** `CallModal`
    - **Display:** User phone during active call
    - **Line ~103:** `{formatPhoneNumber(request.user_phone || '')}`
    - **Line ~163:** `{formatPhoneNumber(request.user_phone || '')}`

#### **Admin Views:**

12. **Admin Alerts Tab**
    - **File:** `src/components/admin/AdminAlertsTab.tsx`
    - **Component:** `AdminAlertsTab`
    - **Display:** User phone in alert requests
    - **Line ~254:** `{formatPhoneNumber(request.user_phone || '')}`

13. **Admin Company Features**
    - **File:** `src/components/ui/admin-company-features.tsx`
    - **Component:** `AdminCompanyFeatures`
    - **Display:** Company contact phone in dashboard
    - **Line ~86:** `{formatPhoneNumber(company.contactPhone)}`

14. **Admin Provider Detail**
    - **File:** `src/pages/AdminProviderDetail.tsx`
    - **Component:** `AdminProviderDetail`
    - **Display:** Provider phone in detail view
    - **Line ~375:** `{formatPhoneNumber(provider.phone)}`
    - **Line ~426:** `{formatPhoneNumber(provider.phone)}`

15. **Provider Card**
    - **File:** `src/components/ui/provider-card.tsx`
    - **Component:** `ProviderCard`
    - **Display:** Provider phone in card view
    - **Line ~134:** `{formatPhoneNumber(provider.phone)}`

---

## Summary Statistics

### **By Type:**
- **Input Fields:** 9 files
- **Display Locations:** 15+ locations in 8 files
- **Total Files Modified:** 17 files
- **New Files Created:** 1 file (`phoneFormat.ts`)

### **By User Role:**
- **User-facing:** 4 input fields + multiple displays
- **Admin-facing:** 4 input fields + multiple displays
- **Specialist-facing:** 1 input field + multiple displays

### **By Feature Area:**
- **Profile Management:** 3 files
- **Registration:** 1 file
- **Company Management:** 4 files
- **Call/Support Management:** 4 files
- **Provider Management:** 2 files
- **Settings:** 3 files

---

## Testing Checklist

To verify phone formatting is working everywhere:

### **Input Fields:**
- [ ] User Settings → Edit Profile → Phone
- [ ] Registration Page → Phone Field
- [ ] Support Form → Contact Phone
- [ ] Specialist Settings → Profile → Phone
- [ ] Admin → Add Company → Phone
- [ ] Admin → Edit Company → Phone
- [ ] Admin → Company Settings → Phone
- [ ] Admin → Edit User → Phone

### **Display Locations:**
- [ ] Specialist → Call Requests → User Phone
- [ ] Specialist → Call Modal → User Phone
- [ ] Admin → Alerts → User Phone
- [ ] Admin → Company Detail → Company Phone
- [ ] Admin → Provider Detail → Provider Phone
- [ ] Provider Cards → Provider Phone

### **Edge Cases:**
- [ ] Empty/new phone fields default to "+258 "
- [ ] Existing unformatted phone numbers are formatted on display
- [ ] Copy-paste from various formats works correctly
- [ ] Phone numbers are clickable (tel: links) where appropriate
- [ ] Phone validation works correctly

---

## Maintenance Notes

### **Adding a New Phone Field:**

When adding a new phone input field:

1. Import the utility:
```typescript
import { formatPhoneNumber, PHONE_PLACEHOLDER } from '@/utils/phoneFormat';
```

2. Set default value:
```typescript
const [phone, setPhone] = useState('+258 ');
```

3. Apply formatting on change:
```tsx
<Input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
  placeholder={PHONE_PLACEHOLDER}
/>
```

### **Displaying an Existing Phone Number:**

1. Import the utility:
```typescript
import { formatPhoneNumber } from '@/utils/phoneFormat';
```

2. Wrap the display value:
```tsx
<span>{formatPhoneNumber(user.phone || '')}</span>
```

### **Click-to-Call Links:**

For tel: links, use raw phone but display formatted:
```tsx
<a href={`tel:${user.phone}`}>
  {formatPhoneNumber(user.phone || '')}
</a>
```

---

## Global Search Patterns

To find all phone-related code:

```bash
# Find phone input fields
grep -r "type=\"tel\"" src/

# Find phone displays
grep -r "\.phone" src/ | grep -v "formatPhoneNumber"

# Find formatPhoneNumber usage
grep -r "formatPhoneNumber" src/

# Find phone placeholders
grep -r "PHONE_PLACEHOLDER" src/

# Find phone state
grep -r "phone:" src/ | grep "useState"
```

---

## Future Enhancements

### **Potential Additions:**

1. **Phone Validation:**
   - Real-time validation feedback
   - Visual indicators for incomplete numbers
   - Error messages for invalid formats

2. **International Support:**
   - Country code selector
   - Multi-country format support
   - Flag icons for countries

3. **Integration Features:**
   - WhatsApp quick links
   - SMS integration
   - Click-to-call functionality
   - Call history tracking

4. **UI Enhancements:**
   - Copy to clipboard button
   - Phone icon indicators
   - Verified phone badge
   - Last verified date

---

## Related Documentation

- **Main Implementation Guide:** `PHONE_NUMBER_FORMATTING_IMPLEMENTATION.md`
- **Utility Functions:** `src/utils/phoneFormat.ts`
- **Testing Guide:** See "Testing Checklist" above

---

## Change Log

### **2025-01-06:**
- ✅ Created phone formatting utility
- ✅ Updated all input fields (9 files)
- ✅ Updated all display locations (8 files)
- ✅ Verified no linter errors
- ✅ Created comprehensive documentation

---

**Status:** ✅ **Complete - All phone numbers across the platform use Mozambique format (+258 ** *** ****)**

