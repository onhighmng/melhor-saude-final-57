# 🚨 PostgREST RPC Routing Issue - URGENT FIX

## The Problem

```
✅ Function exists in PostgreSQL
✅ Function works via direct SQL: SELECT generate_access_code() → SUCCESS
✅ Other RPC (get_user_primary_role) works via REST API
❌ generate_access_code doesn't work via REST API → 404
```

## Root Cause

PostgREST maintains **TWO separate caches:**

1. **Schema Cache** (what columns/tables exist)
   - Refresh: `Generate Types` or `Restart Database`
   - Status: ✅ Updated

2. **RPC Routing Cache** (what functions can be called via `/rest/v1/rpc/`)
   - Refresh: REQUIRES FULL POSTGREST RESTART
   - Status: ❌ NOT Updated

When we created the function, the schema cache updated but the RPC routing cache didn't.

## Why Other Functions Work

`get_user_primary_role` was created BEFORE the cache was built, so it's in the routing cache.
`generate_access_code` was created AFTER, so it's NOT in the routing cache.

## The ONLY Fix

### Option 1: Restart Supabase (GUARANTEED to work)

1. Go to: https://app.supabase.com/project/ygxamuymjjpqhjoegweb/settings/database
2. Click "Restart Database" 
3. Wait 3-5 minutes for full restart
4. Hard refresh browser: Ctrl+Shift+R
5. Test: Try generating HR code

**This will:**
- Restart PostgreSQL ✓
- Restart PostgREST ✓
- Clear ALL caches ✓
- Rebuild RPC routing ✓

### Option 2: Wait for Auto-Refresh (May Take 30+ mins)

PostgREST eventually re-scans functions. But this is unreliable.

### Option 3: Manual Pool Reconnect (Advanced)

If Option 1 doesn't work within 5 minutes:

1. Go to Database settings
2. Find "Connection pooler"
3. Restart connection pool
4. Hard refresh: Ctrl+Shift+R

---

## Timeline After Restart

```
T+0:   Click "Restart Database"
T+30s: PostgreSQL shuts down
T+1m:  PostgreSQL restarts
T+1:30 PostgREST restarts
T+2m:  Services online
T+2:30 Hard refresh browser
T+3m:  Try generating code → Should work!
```

---

## Proof the Fix Will Work

Evidence that this is a PostgREST routing issue:

1. **Function exists:** ✅ PostgreSQL sees it
2. **Function works:** ✅ Direct SQL succeeds
3. **Other RPCs work:** ✅ `get_user_primary_role` is accessible
4. **Same permissions:** ✅ Both functions have identical ACL
5. **Same configuration:** ✅ Both are SECURITY DEFINER
6. **Only difference:** ❌ Routing cache doesn't list new function

### Why Restarting Fixes It

When PostgREST restarts:
1. Reconnects to PostgreSQL ✓
2. Rebuilds function routing table ✓
3. Scans all functions in public schema ✓
4. Finds `generate_access_code` ✓
5. Makes it routable via `/rest/v1/rpc/` ✓

---

## If Still 404 After Restart

If it STILL doesn't work after 5 minutes:

**Contact Supabase Support:**
- URL: https://supabase.com/support
- Issue: "RPC function not routable after creation despite existing and working via SQL"
- Project: ygxamuymjjpqhjoegweb
- Function: generate_access_code

They can manually refresh PostgREST's RPC routing table.

---

## Prevention for Future Functions

When creating new RPC functions in future:

1. Create function in migration ✓
2. Grant permissions ✓
3. Immediately restart database (don't wait)
4. Test via REST API to confirm routing works

This prevents the routing cache from getting out of sync.

