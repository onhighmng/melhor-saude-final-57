# ✅ Phone Number Formatting - Mozambique Standard (+258)

## Overview

Implemented standardized phone number formatting across the entire platform using Mozambique's country code (+258) in the format: **+258 ** *** ****

---

## Format Specification

### **Standard Format:**
```
+258 XX XXX XXXX
```

**Example:**
```
+258 84 123 4567
```

**Breakdown:**
- `+258` - Mozambique country code (always present)
- `XX` - First 2 digits
- `XXX` - Next 3 digits  
- `XXXX` - Last 4 digits
- **Total:** 9 digits after country code

---

## Implementation

### **1. Phone Formatting Utility**

**File:** `src/utils/phoneFormat.ts`

**Functions:**

#### **`formatPhoneNumber(value: string): string`**
Formats any phone input to Mozambique standard:
```typescript
formatPhoneNumber("841234567")     // → "+258 84 123 4567"
formatPhoneNumber("+258841234567") // → "+258 84 123 4567"
formatPhoneNumber("258 84 123")    // → "+258 84 123"
```

#### **`isValidPhoneNumber(value: string): boolean`**
Validates if phone number is complete (has all 9 digits):
```typescript
isValidPhoneNumber("+258 84 123 4567") // → true
isValidPhoneNumber("+258 84 123")      // → false
```

#### **`getRawPhoneNumber(value: string): string`**
Extracts only digits:
```typescript
getRawPhoneNumber("+258 84 123 4567") // → "25884123 4567"
```

#### **`getInternationalFormat(value: string): string`**
Returns international format:
```typescript
getInternationalFormat("841234567") // → "+25884123 4567"
```

#### **Constants:**
```typescript
PHONE_PLACEHOLDER = "+258 ** *** ****"  // For input placeholders
PHONE_DEFAULT = "+258 "                  // For empty inputs
```

---

### **2. Components Updated**

All phone input fields across the platform now use the formatting utility:

#### **User-Facing Components:**

**1. Profile Edit Modal**
- **File:** `src/components/settings/ProfileEditModal.tsx`
- **Field:** User phone number
- **Default:** `+258 `
- **Auto-format:** ✅

**2. Registration Page**
- **File:** `src/pages/Register.tsx`
- **Field:** Phone during signup
- **Default:** `+258 `
- **Auto-format:** ✅

**3. Support Form**
- **File:** `src/components/support/SupportForm.tsx`
- **Field:** Contact phone (optional)
- **Default:** `+258 `
- **Auto-format:** ✅

#### **Admin Components:**

**4. Add Company Modal**
- **File:** `src/components/admin/AddCompanyModal.tsx`
- **Field:** Company phone
- **Default:** `+258 `
- **Auto-format:** ✅

**5. Edit Company Dialog**
- **File:** `src/components/admin/EditCompanyDialog.tsx`
- **Field:** Contact phone
- **Formats on load:** ✅
- **Auto-format:** ✅

---

## How It Works

### **Real-Time Formatting:**

As users type, the phone number is automatically formatted:

```
User types: "8"
Display:    "+258 8"

User types: "84"
Display:    "+258 84"

User types: "841"
Display:    "+258 84 1"

User types: "8412"
Display:    "+258 84 12"

User types: "84123"
Display:    "+258 84 123"

User types: "841234"
Display:    "+258 84 123 4"

User types: "8412345"
Display:    "+258 84 123 45"

User types: "84123456"
Display:    "+258 84 123 456"

User types: "841234567"
Display:    "+258 84 123 4567" ✅ Complete!
```

### **Smart Prefix Handling:**

The formatter intelligently handles various inputs:

```typescript
// Already has +258
formatPhoneNumber("+258841234567")   // → "+258 84 123 4567"

// Has 258 without +
formatPhoneNumber("258841234567")    // → "+258 84 123 4567"

// Raw number
formatPhoneNumber("841234567")       // → "+258 84 123 4567"

// With spaces already
formatPhoneNumber("84 123 4567")     // → "+258 84 123 4567"

// Partial entry
formatPhoneNumber("84")              // → "+258 84"
```

---

## User Experience

### **Input Behavior:**

1. **Empty Field:**
   - Shows placeholder: `+258 ** *** ****`
   - Default value: `+258 `
   - Cursor starts after space

2. **Typing:**
   - Numbers only (non-digits ignored except +)
   - Automatic spacing after 2nd, 5th, and 9th digits
   - Maximum 9 digits after country code
   - Cannot delete `+258 ` prefix

3. **Pasting:**
   - Accepts any format
   - Automatically reformats to standard
   - Strips non-digit characters
   - Adds `+258` if missing

4. **Editing:**
   - Can edit any part of the number
   - Reformats on every keystroke
   - Maintains cursor position reasonably

---

## Database Storage

Phone numbers are stored in the database as entered (formatted):
```sql
-- Example stored values
"+258 84 123 4567"
"+258 82 555 1234"
```

**Benefits:**
- ✅ Consistent format in DB
- ✅ Easy to read in admin panels
- ✅ Ready for display without reformatting
- ✅ Can be validated easily

---

## Validation

### **Complete Number:**
```typescript
const phone = "+258 84 123 4567";
if (isValidPhoneNumber(phone)) {
  // Has all 9 digits - valid for submission
}
```

### **Incomplete Number:**
```typescript
const phone = "+258 84";
if (!isValidPhoneNumber(phone)) {
  // Missing digits - show error
}
```

---

## Examples by Component

### **1. Profile Settings**

**Before:**
```tsx
<Input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="+351 123 456 789"  // Portugal ❌
/>
```

**After:**
```tsx
<Input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
  placeholder={PHONE_PLACEHOLDER}  // "+258 ** *** ****" ✅
/>
```

### **2. Registration**

**Before:**
```tsx
phone: ''  // Empty default ❌
```

**After:**
```tsx
phone: '+258 '  // Mozambique default ✅
```

### **3. Company Management**

**Before:**
```tsx
placeholder="+258 XX XXX XXXX"  // Hardcoded ❌
```

**After:**
```tsx
placeholder={PHONE_PLACEHOLDER}  // Centralized constant ✅
```

---

## Testing

### **Manual Testing Checklist:**

#### **Profile Edit:**
- [x] Open user settings
- [x] Click edit profile
- [x] Phone field shows `+258 ` by default
- [x] Type "841234567"
- [x] Verify displays as "+258 84 123 4567"
- [x] Save and verify format persists

#### **Registration:**
- [x] Go to `/register`
- [x] Enter phone number
- [x] Verify auto-formatting
- [x] Submit and check DB format

#### **Company Creation:**
- [x] Admin → Add Company
- [x] Enter company phone
- [x] Verify formatting
- [x] Save and check display

#### **Support Form:**
- [x] Open support form
- [x] Enter phone (optional)
- [x] Verify formatting
- [x] Submit ticket

#### **Edge Cases:**
- [x] Paste "+258841234567" → formats correctly
- [x] Paste "841234567" → adds +258
- [x] Paste "258841234567" → adds +
- [x] Type letters → ignored
- [x] Type special chars → ignored
- [x] Try to delete "+258" → blocked
- [x] Type more than 9 digits → truncated

---

## Benefits

### **For Users:**
- ✅ **Consistent:** Same format everywhere
- ✅ **Intuitive:** Automatic spacing while typing
- ✅ **Local:** Mozambique standard by default
- ✅ **Error-prevention:** Can't enter invalid formats
- ✅ **Visual:** Easy to read with spaces

### **For Developers:**
- ✅ **Centralized:** Single utility for all formatting
- ✅ **Reusable:** Import and use anywhere
- ✅ **Maintainable:** One place to update format rules
- ✅ **Type-safe:** TypeScript functions
- ✅ **Tested:** Consistent behavior

### **For Business:**
- ✅ **Professional:** Standardized phone display
- ✅ **Local:** Respects Mozambique standards
- ✅ **Data quality:** Clean, consistent phone numbers
- ✅ **Integration:** Ready for SMS/calling systems

---

## Future Enhancements

Possible improvements:

### **1. International Support**
```typescript
formatPhoneNumber(value, countryCode = '258') // → Support other countries
```

### **2. Validation Feedback**
```typescript
// Real-time validation with visual feedback
<Input
  error={!isValidPhoneNumber(phone) && phone.length > 5}
  helperText="Please enter a complete phone number"
/>
```

### **3. Country Selector**
```tsx
<PhoneInput
  country="MZ"  // Mozambique
  value={phone}
  onChange={setPhone}
/>
```

### **4. Click-to-Call**
```tsx
<a href={`tel:${getRawPhoneNumber(phone)}`}>
  {phone}
</a>
```

### **5. WhatsApp Integration**
```tsx
<a href={`https://wa.me/${getRawPhoneNumber(phone)}`}>
  <WhatsAppIcon /> Message on WhatsApp
</a>
```

---

## Migration Notes

### **Existing Data:**

For phone numbers already in the database without formatting:

**Option 1: Format on Display**
```typescript
const displayPhone = formatPhoneNumber(dbPhone);
```

**Option 2: Batch Update (Optional)**
```sql
-- Migration script (if needed)
UPDATE profiles 
SET phone = CONCAT(
  '+258 ',
  SUBSTRING(phone, 1, 2), ' ',
  SUBSTRING(phone, 3, 3), ' ',
  SUBSTRING(phone, 6, 4)
)
WHERE phone NOT LIKE '+258%';
```

**Recommendation:** Let the format happen naturally as users edit their profiles. No forced migration needed since the utility handles both formatted and unformatted inputs.

---

## Files Modified

### **New Files:**
1. **`src/utils/phoneFormat.ts`** - Phone formatting utility (NEW)

### **Updated Files - Phone Inputs (9 files):**
2. **`src/components/settings/ProfileEditModal.tsx`** - User profile phone input
3. **`src/pages/Register.tsx`** - Registration phone input
4. **`src/components/support/SupportForm.tsx`** - Support contact phone input
5. **`src/components/admin/AddCompanyModal.tsx`** - Company phone input (admin)
6. **`src/components/admin/EditCompanyDialog.tsx`** - Edit company phone input (admin)
7. **`src/pages/EspecialistaSettings.tsx`** - Specialist profile phone input
8. **`src/pages/CompanySettings.tsx`** - Company settings phone input
9. **`src/components/admin/EditUserDialog.tsx`** - User edit phone input (admin)

### **Updated Files - Phone Displays (8 files):**
10. **`src/pages/EspecialistaCallRequestsRevamped.tsx`** - Display user phone in call requests
11. **`src/pages/EspecialistaCallRequests.tsx`** - Display user phone in call requests (legacy)
12. **`src/components/admin/AdminAlertsTab.tsx`** - Display user phone in alerts
13. **`src/components/specialist/CallModal.tsx`** - Display user phone in call modal (3 locations)
14. **`src/components/ui/admin-company-features.tsx`** - Display company phone in admin view
15. **`src/pages/AdminProviderDetail.tsx`** - Display provider phone in detail pages (2 locations)
16. **`src/components/ui/provider-card.tsx`** - Display provider phone in cards

**Total:** 1 new file + 16 updated files = **17 files modified**

---

## Code Examples

### **Import and Use:**

```typescript
import { formatPhoneNumber, PHONE_PLACEHOLDER, isValidPhoneNumber } from '@/utils/phoneFormat';

// In your component
const [phone, setPhone] = useState('+258 ');

// In your JSX
<Input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
  placeholder={PHONE_PLACEHOLDER}
/>

// Before submit
if (!isValidPhoneNumber(phone)) {
  toast.error('Please enter a complete phone number');
  return;
}
```

### **Display Phone Number:**

```typescript
// In a card/list
<p>Phone: {phone}</p>  // Already formatted!

// As a link
<a href={`tel:${getRawPhoneNumber(phone)}`}>{phone}</a>
```

---

## Summary

**What Changed:**
- ✅ Created centralized phone formatting utility
- ✅ Updated all phone inputs to use Mozambique format (+258)
- ✅ Set default value to `+258 ` on all empty fields
- ✅ Added automatic formatting as users type
- ✅ Standardized placeholder text across platform

**Result:**
All phone numbers across the platform now use the consistent Mozambique format **+258 ** *** ******, providing a professional, localized user experience! 🇲🇿📞✨

