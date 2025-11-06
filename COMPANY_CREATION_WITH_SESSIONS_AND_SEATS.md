# Company Creation with Sessions and Seats Allocation

## ✅ Implementation Complete

The admin company creation process now properly prompts for **sessions** and **seats** allocation.

---

## 🎯 What Was Implemented

### 1. **Add Company Modal** (`src/components/admin/AddCompanyModal.tsx`)

A comprehensive modal dialog for creating new companies with:

#### **Required Fields:**
- **Company Name** * (required)
- **Corporate Email** * (required)
- **Total Sessions** * (required) - Total sessions available for all employees
- **Employee Seats** * (required) - Maximum number of employee accounts allowed

#### **Optional Fields:**
- NUIT (tax ID)
- Phone
- Address
- Industry/Sector
- Program Start Date
- HR Contact Person
- HR Manager Email

#### **Smart Features:**
- **Real-time calculation** showing sessions per employee (total sessions / seats)
- **Visual highlighting** of the two key fields (sessions and seats)
- **Validation** ensuring sessions and seats are greater than zero
- **Success notification** with summary of allocated resources

### 2. **Integration with AdminCompanies Page**

- Added "**Adicionar Empresa**" button in the header
- Opens the modal when clicked
- Automatically refreshes the company list after successful creation

---

## 📊 How It Works

### **Admin Workflow:**

1. **Navigate to** `/admin/users-management`
2. **Make sure you're on the "Empresas" tab**
3. **Click** "Adicionar Empresa" button
3. **Fill in** company details:
   - Company name and email (required)
   - **Choose total sessions** (e.g., 100 sessions)
   - **Choose employee seats** (e.g., 50 seats)
   - Optional: HR contact, address, etc.
4. **See preview**: "~2 sessions per employee" (100 / 50)
5. **Submit** to create the company

### **What Happens in the Database:**

```sql
INSERT INTO companies (
  name,
  email,
  sessions_allocated,  -- Total sessions (e.g., 100)
  sessions_used,       -- Starts at 0
  employee_seats,      -- Max employees (e.g., 50)
  is_active,
  ...
) VALUES (...);
```

### **When Adding Employees:**

The system automatically calculates sessions per employee:

```typescript
// From AddEmployeeModal.tsx (lines 217-227)
const sessionsPerEmployee = Math.floor(
  sessions_allocated / employee_seats
);

// Each employee gets their fair share
// Example: 100 sessions / 50 seats = 2 sessions per employee
```

---

## 🔑 Key Concepts

### **Sessions Allocated** (Total Pool)
- Total number of therapy/consultation sessions purchased by the company
- Shared pool distributed among all employees
- Example: 100 sessions for the entire company

### **Employee Seats** (Max Accounts)
- Maximum number of employee accounts that can be created
- Subscription limit/license cap
- Example: 50 employee seats = max 50 accounts

### **Sessions Per Employee** (Fair Distribution)
- Automatically calculated: `sessions_allocated / employee_seats`
- Example: 100 sessions ÷ 50 seats = 2 sessions per employee
- Each new employee gets this amount automatically

---

## 📋 Database Schema

### **Companies Table:**

| Field | Type | Description |
|-------|------|-------------|
| `sessions_allocated` | integer | Total sessions purchased |
| `sessions_used` | integer | Sessions consumed (tracks usage) |
| `employee_seats` | integer | Max employee accounts allowed |
| `name` | text | Company name |
| `email` | text | Corporate email |
| `is_active` | boolean | Active status |

### **Company_Employees Table:**

| Field | Type | Description |
|-------|------|-------------|
| `company_id` | uuid | Link to company |
| `user_id` | uuid | Link to employee |
| `sessions_allocated` | integer | Sessions for THIS employee |
| `sessions_used` | integer | Sessions used by THIS employee |
| `is_active` | boolean | Active status |

---

## 🎨 UI Features

### **Visual Highlights:**
- Sessions and Seats fields are in a **highlighted blue section**
- **Real-time preview** of sessions per employee
- **Large font** for important numbers
- **Icons** for visual clarity (TrendingUp for sessions, Users for seats)

### **Validation:**
- Company name and email are required
- Sessions must be > 0
- Seats must be > 0
- Helpful error messages

### **Success Flow:**
- Toast notification with confirmation
- Shows: "Company X created with Y sessions and Z seats"
- Modal closes automatically
- Company list refreshes

---

## 🧪 Example Usage

### **Scenario 1: Small Company**
- **Company**: TechStart Lda
- **Sessions**: 50
- **Seats**: 10
- **Result**: Each employee gets 5 sessions

### **Scenario 2: Large Enterprise**
- **Company**: MegaCorp SA
- **Sessions**: 500
- **Seats**: 100
- **Result**: Each employee gets 5 sessions

### **Scenario 3: High-Touch Program**
- **Company**: ExecutiveCo
- **Sessions**: 100
- **Seats**: 10
- **Result**: Each employee gets 10 sessions

---

## 🔧 Files Modified/Created

### **Created:**
- `src/components/admin/AddCompanyModal.tsx` - New modal component

### **Modified:**
- `src/pages/AdminCompanies.tsx` - Added button and modal integration

### **Already Working (No Changes Needed):**
- `src/components/admin/AddEmployeeModal.tsx` - Already uses sessions/seats correctly

---

## ✅ Testing Checklist

1. ✅ Admin can open "Add Company" modal
2. ✅ Required fields are enforced
3. ✅ Sessions and seats validation works
4. ✅ Preview calculation shows correctly
5. ✅ Company is created in database
6. ✅ Company appears in list immediately
7. ✅ Employees created later get correct session allocation

---

## 🎯 Next Steps (Optional Enhancements)

### **Future Ideas:**
1. **Edit Company**: Allow editing sessions/seats after creation
2. **Session Top-Up**: Add more sessions to existing companies
3. **Seat Expansion**: Increase employee seat limit
4. **Usage Dashboard**: Show session consumption trends
5. **Alerts**: Notify when sessions are running low
6. **Flexible Allocation**: Let admin assign custom sessions to specific employees

---

## 📝 Notes

- The system uses a **pool model** by default (shared sessions)
- Sessions are distributed **equitably** across all employees
- The admin sees **real-time preview** of allocation during creation
- All changes are **atomic** (database transaction ensures consistency)
- The UI is fully **responsive** and works on mobile devices

---

## 🎉 Summary

The admin now has a **clear, intuitive workflow** to:
1. ✅ Create new companies
2. ✅ Set total sessions available
3. ✅ Set maximum employee seats
4. ✅ See preview of per-employee allocation
5. ✅ Employees automatically receive their share when created

This ensures **transparent resource management** and **fair distribution** of therapy sessions across all company employees.

