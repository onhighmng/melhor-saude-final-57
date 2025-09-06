# Lovable Project Placeholder Data Cleanup Prompt

## Objective
Clean up all placeholder, demo, and mock data from the Lovable project while preserving full functionality, structure, and visual design.

## Scope of Changes
**ONLY** replace placeholder values with neutral defaults. **NO** visual, layout, structural, or logic changes allowed without explicit permission.

## Areas to Scan and Clean

### 1. Database/Supabase Data
- [ ] Mock user data in services (names, emails, companies)
- [ ] Demo session data and quotas
- [ ] Placeholder provider information
- [ ] Test booking data
- [ ] Sample testimonials and feedback
- [ ] Demo company organizations
- [ ] Mock admin accounts and prestadores
- [ ] Placeholder file uploads and references

### 2. Static Data Files
- [ ] `src/data/providersData.ts` - Provider profiles, bios, experience
- [ ] `src/components/info-cards/InfoCardsData.tsx` - Pillar descriptions
- [ ] `src/components/pricing/pricingData.ts` - Pricing plan details
- [ ] Any other data configuration files

### 3. Component Default Values
- [ ] Form placeholder text and default values
- [ ] Mock API responses and demo data
- [ ] Sample notifications and messages
- [ ] Default user profiles and settings
- [ ] Preset configuration values

### 4. UI Text Content
- [ ] Lorem ipsum text in components
- [ ] Demo testimonials and quotes
- [ ] Sample company names and descriptions
- [ ] Placeholder contact information
- [ ] Mock success/error messages
- [ ] Demo analytics and statistics

### 5. Assets and Media
- [ ] Placeholder images and videos
- [ ] Demo profile photos
- [ ] Sample documents and files
- [ ] Mock video URLs and links

## Replacement Guidelines

### Names and Personal Information
- **Replace**: "João Silva", "Maria Santos", "Dr. Ana Costa"
- **With**: "User Name", "Full Name", or empty string ""

### Email Addresses
- **Replace**: "joao@example.com", "admin@company.com"
- **With**: "user@example.com" or empty string ""

### Company Information
- **Replace**: "Tech Corp", "Finance Ltd", "Acme Company"
- **With**: "Company Name" or empty string ""

### Lorem Ipsum and Descriptions
- **Replace**: Lorem ipsum text, sample bios, mock descriptions
- **With**: "Description" or empty string ""

### URLs and Links
- **Replace**: Mock URLs, demo links, placeholder hrefs
- **With**: "#" or empty string ""

### Numerical Values
- **Replace**: Demo statistics, sample counts, mock prices
- **With**: 0 or appropriate neutral defaults

### Media References
- **Replace**: Placeholder image URLs, demo video links
- **With**: Empty string "" or default placeholder

## Implementation Rules

### 1. Preserve Functionality
- Maintain all working features and logic
- Keep form validation and error handling
- Preserve routing and navigation
- Maintain API integrations and data flow

### 2. Preserve Structure
- Keep all component props and interfaces
- Maintain database schema and relationships
- Preserve file organization and imports
- Keep existing TypeScript types

### 3. Preserve Design
- No changes to CSS classes or styling
- Keep layout and visual hierarchy
- Maintain responsive behavior
- Preserve animations and interactions

### 4. Safety Checks
- Test all critical user flows after cleanup
- Verify forms still submit correctly
- Ensure authentication still works
- Check that navigation remains functional

## File-by-File Checklist

### Services
- [ ] `src/services/mockSessionService.ts`
- [ ] `src/services/adminAccountService.ts`
- [ ] Any other service files with mock data

### Components
- [ ] All form components with placeholder text
- [ ] Dashboard components with demo data
- [ ] Admin panels with sample information
- [ ] Provider/prestador profile components

### Pages
- [ ] Landing page content and testimonials
- [ ] Dashboard pages with sample data
- [ ] Admin pages with mock users
- [ ] Profile pages with demo information

### Data Files
- [ ] All files in `src/data/` directory
- [ ] Configuration files with sample values
- [ ] Constants files with placeholder content

## Quality Assurance

### Before Changes
- [ ] Document current placeholder values for reference
- [ ] Backup critical configuration
- [ ] Note any custom demo data that serves specific purposes

### After Changes
- [ ] Test user registration and login flows
- [ ] Verify admin dashboard functionality
- [ ] Check provider/prestador workflows
- [ ] Test booking and session systems
- [ ] Validate form submissions and data persistence

### Final Verification
- [ ] No broken links or missing references
- [ ] All forms remain functional
- [ ] Database operations work correctly
- [ ] UI displays properly with neutral defaults
- [ ] No console errors introduced

## Important Notes

1. **Maintain Working State**: The application must remain fully functional after cleanup
2. **Preserve Business Logic**: Do not modify algorithms, validations, or core functionality
3. **Keep User Experience**: UI should remain intuitive and professional
4. **Database Integrity**: Ensure all foreign key relationships remain valid
5. **Type Safety**: Maintain TypeScript compliance throughout

## Success Criteria

✅ All placeholder content replaced with neutral defaults
✅ Application remains fully functional
✅ No visual or structural changes made
✅ All existing features work as expected
✅ Clean, professional appearance maintained
✅ Ready for production deployment

---

**Execute this cleanup systematically, one section at a time, testing functionality after each major change.**