# Debug Registration Errors

## Steps to Get Error Details

### 1. Open Browser Console
- Right-click anywhere on the page → "Inspect" or "Inspect Element"
- Click "Console" tab
- Keep it open while you attempt registration

### 2. Try Registration Again
- Generate a new prestador access code
- Use it to register
- Watch the console for red error messages

### 3. What to Look For

Copy and send me:
1. **Error messages** in red
2. **Any stack traces**
3. **Network tab errors** (click Network tab, look for red/failed requests)

## Common Issues to Check

### Issue 1: Access Code Generation Error
```
Error message might look like:
- "Failed to generate code"
- "RPC error: function generate_access_code does not exist"
- "Invalid user_type"
```

### Issue 2: Registration Error
```
Error message might look like:
- "Error creating profile"
- "Role constraint violation"
- "User already exists"
```

### Issue 3: Role Assignment Error
```
Error message might look like:
- "Insert violates check constraint"
- "Invalid role"
- "role must be one of..."
```

## Quick Diagnostics to Run

Run these in Supabase SQL Editor to check the system:

